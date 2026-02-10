# Actionbook Auto-Connect Setup Guide

This guide explains how to enable automatic token connection for Actionbook Chrome Extension, eliminating manual token input.

## How It Works

Actionbook uses Chrome Native Messaging to automatically provide the bridge token to the extension:

1. **Bridge Server** runs as a persistent service (via `actionbook extension serve`)
2. **Native Messaging Host** (built into actionbook CLI) reads the token file
3. **Chrome Extension** automatically requests and receives the token on startup
4. **WebSocket Connection** established automatically - no manual intervention needed

## Setup Steps

### 1. Install Actionbook Extension

```bash
actionbook extension install
```

This command:
- Downloads and installs the Chrome extension
- Installs the native messaging host manifest
- Configures automatic connection

### 2. Start Bridge Server as a Service

**macOS (LaunchAgent):**

Create `~/Library/LaunchAgents/com.actionbook.bridge.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.actionbook.bridge</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/actionbook</string>
        <string>extension</string>
        <string>serve</string>
    </array>
    
    <key>RunAtLoad</key>
    <true/>
    
    <key>KeepAlive</key>
    <true/>
    
    <key>StandardOutPath</key>
    <string>/tmp/actionbook-bridge.log</string>
    
    <key>StandardErrorPath</key>
    <string>/tmp/actionbook-bridge.err.log</string>
</dict>
</plist>
```

Load the service:
```bash
launchctl load ~/Library/LaunchAgents/com.actionbook.bridge.plist
```

**Linux (systemd):**

Create `~/.config/systemd/user/actionbook-bridge.service`:

```ini
[Unit]
Description=Actionbook Extension Bridge Server
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/actionbook extension serve
Restart=always
RestartSec=3

[Install]
WantedBy=default.target
```

Enable and start:
```bash
systemctl --user enable actionbook-bridge
systemctl --user start actionbook-bridge
```

### 3. Reload Chrome Extension

After setup:
1. Go to `chrome://extensions/`
2. Find "Actionbook" extension
3. Click the reload button (circular arrow icon)
4. The extension will automatically connect (usually within 1-2 seconds)

## Verification

Check if auto-connect is working:

```bash
# Check bridge server status
actionbook extension status

# Ping the extension
actionbook extension ping
```

If both commands succeed, auto-connect is working! 🎉

## Troubleshooting

### Extension Not Auto-Connecting

**1. Check native messaging host manifest:**

```bash
# macOS
cat ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/com.actionbook.bridge.json

# Linux
cat ~/.config/google-chrome/NativeMessagingHosts/com.actionbook.bridge.json
```

The `path` should point to your actionbook binary (usually `/opt/homebrew/bin/actionbook` or `/usr/local/bin/actionbook`).

**2. Check bridge server is running:**

```bash
actionbook extension status
```

Should show: `✓ Bridge server is running on port 19222`

**3. Check extension logs:**

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "service worker" link under Actionbook extension
4. Check console for errors

**4. Manual test of native messaging:**

```bash
echo '{"type":"get_token"}' | actionbook chrome-extension://dpfioflkmnkklgjldmaggkodhlidkdcd/
```

Should return JSON with token.

### Bridge Server Keeps Restarting

If using LaunchAgent/systemd with `KeepAlive`/`Restart=always`, check logs:

```bash
# macOS
tail -f /tmp/actionbook-bridge.log
tail -f /tmp/actionbook-bridge.err.log

# Linux
journalctl --user -u actionbook-bridge -f
```

## Benefits

✅ **Zero manual intervention** - works across system restarts  
✅ **Automatic reconnection** - recovers from crashes  
✅ **Secure** - token stays in local files, never exposed  
✅ **Persistent** - browser can be closed and reopened  

## How It Differs from Manual Mode

**Manual Mode (old):**
1. Start bridge: `actionbook extension serve`
2. Read token from terminal output
3. Open Chrome extension popup
4. Copy-paste token
5. Click "Connect"
6. Repeat after every bridge restart

**Auto Mode (new):**
1. Start bridge service once (persists across reboots)
2. Install extension once
3. Everything else is automatic ✨

## Security Notes

- Native messaging is a Chrome security feature, not a workaround
- Token is read from local filesystem only
- Extension must have `nativeMessaging` permission (declared in manifest)
- Only the specific extension ID can request tokens (validated by Chrome)
- Token file permissions are user-only (600)

## Advanced: Monitoring Connection

Create a cron job to monitor and alert on disconnections:

```bash
#!/bin/bash
# Check if extension is connected every 10 minutes

if ! actionbook extension ping >/dev/null 2>&1; then
    # Send notification (customize for your system)
    echo "⚠️ Actionbook extension disconnected" | mail -s "Actionbook Alert" you@example.com
fi
```

Add to crontab:
```bash
*/10 * * * * /path/to/monitor-actionbook.sh
```

## Contributing

Found an issue or have improvements? Please open an issue or PR at:
https://github.com/actionbook/actionbook

---

**Note:** This is a community guide. For official documentation, see https://actionbook.dev/docs
