---
name: actionbook
description: This skill should be used when the user needs to automate multi-step website tasks. Activates for browser automation, web scraping, UI testing, or building AI agents. Provides complete action manuals with step-by-step instructions and verified selectors.
---

## When to Use This Skill

Activate this skill when the user:

- Needs to complete a multi-step task ("Send a LinkedIn message", "Book an Airbnb")
- Asks how to interact with a website ("How do I post a tweet?")
- Builds browser-based AI agents or web scrapers
- Writes E2E tests for external websites
- Navigates to any new page during browser automation
- Wants to control their existing Chrome browser (Extension mode)

## Browser Modes

Actionbook supports two browser control modes:

| Mode | Flag | Use Case |
|------|------|----------|
| **CDP** (default) | (none) | Launches a dedicated browser instance via Chrome DevTools Protocol |
| **Extension** | `--extension` | Controls the user's existing Chrome browser via a Chrome Extension + WebSocket bridge |

**When to use Extension mode:**
- The user wants to operate on their already-open Chrome (with existing logins, cookies, tabs)
- The task requires interacting with pages that need the user's real session state
- The user explicitly mentions their Chrome browser, extension, or existing tabs

**When to use CDP mode (default):**
- Clean browser environment is preferred
- Headless automation or CI/CD
- Profile-based session isolation is needed

All `actionbook browser` commands work identically in both modes. The only difference is adding `--extension` flag (or setting `ACTIONBOOK_EXTENSION=1`).

## How to Use

### Phase 1: Get Action Manual

```bash
# Step 1: Search for action manuals
actionbook search "arxiv search papers"
# Returns: area IDs with descriptions

# Step 2: Get the full manual (use area_id from search results)
actionbook get "arxiv.org:/search/advanced:default"
# Returns: Page structure, UI Elements with CSS/XPath selectors
```

### Phase 2: Execute with Browser (CDP mode — default)

```bash
# Step 3: Open browser
actionbook browser open "https://arxiv.org/search/advanced"

# Step 4: Use CSS selectors from Action Manual directly
actionbook browser fill "#terms-0-term" "Neural Network"
actionbook browser select "#terms-0-field" "title"
actionbook browser click "#date-filter_by-2"
actionbook browser fill "#date-year" "2025"
actionbook browser click "form[action='/search/advanced'] button.is-link"

# Step 5: Wait for results
actionbook browser wait-nav

# Step 6: Extract data
actionbook browser text

# Step 7: Close browser
actionbook browser close
```

### Phase 2 (alt): Extension mode

Extension mode uses identical commands — just add `--extension`. Ensure the bridge is running first (see [Extension Setup](#extension-setup--management)).

```bash
actionbook extension status                    # verify bridge is running
actionbook --extension browser open "https://arxiv.org/search/advanced"
actionbook --extension browser fill "#terms-0-term" "Neural Network"
# ... remaining browser commands are the same, just add --extension
```

> **Note:** In extension mode, avoid `browser close` unless the user explicitly asks — it closes a tab in their real browser.

## Action Manual Format

Action manuals return:
- **Page URL** - Target page address
- **Page Structure** - DOM hierarchy and key sections
- **UI Elements** - CSS/XPath selectors with element metadata

```yaml
  ### button_advanced_search

  - ID: button_advanced_search
  - Description: Advanced search navigation button
  - Type: link
  - Allow Methods: click
  - Selectors:
    - role: getByRole('link', { name: 'Advanced Search' }) (confidence: 0.9)
    - css: button.button.is-small.is-cul-darker (confidence: 0.65)
    - xpath: //button[contains(@class, 'button')] (confidence: 0.55)
```

## Action Search Commands

```bash
actionbook search "<query>"                    # Basic search
actionbook search "<query>" --domain site.com  # Filter by domain
actionbook search "<query>" --url <url>        # Filter by URL
actionbook search "<query>" -p 2 -s 20         # Page 2, 20 results

actionbook get "<area_id>"                     # Full details with selectors
# area_id format: "site.com:/path:area_name"

actionbook sources list                        # List available sources
actionbook sources search "<query>"            # Search sources by keyword
```

## Browser Commands

> All browser commands below work in both CDP and Extension mode.
> For Extension mode, add `--extension` flag or set `ACTIONBOOK_EXTENSION=1`.

### Navigation

```bash
actionbook browser open <url>                  # Open URL in new tab
actionbook browser goto <url>                  # Navigate current page
actionbook browser back                        # Go back
actionbook browser forward                     # Go forward
actionbook browser reload                      # Reload page
actionbook browser pages                       # List open tabs
actionbook browser switch <page_id>            # Switch tab
actionbook browser close                       # Close browser
actionbook browser restart                     # Restart browser
actionbook browser connect <endpoint>          # Connect to existing browser (CDP port or URL)
```

### Interactions (use CSS selectors from Action Manual)

```bash
actionbook browser click "<selector>"                  # Click element
actionbook browser click "<selector>" --wait 1000      # Wait then click
actionbook browser fill "<selector>" "text"            # Clear and type
actionbook browser type "<selector>" "text"            # Append text
actionbook browser select "<selector>" "value"         # Select dropdown
actionbook browser hover "<selector>"                  # Hover
actionbook browser focus "<selector>"                  # Focus
actionbook browser press Enter                         # Press key
```

### Get Information

```bash
actionbook browser text                        # Full page text
actionbook browser text "<selector>"           # Element text
actionbook browser html                        # Full page HTML
actionbook browser html "<selector>"           # Element HTML
actionbook browser snapshot                    # Accessibility tree
actionbook browser viewport                    # Viewport dimensions
actionbook browser status                      # Browser detection info
```

### Wait

```bash
actionbook browser wait "<selector>"                   # Wait for element
actionbook browser wait "<selector>" --timeout 5000    # Custom timeout
actionbook browser wait-nav                            # Wait for navigation
```

### Screenshots & Export

```bash
# Ensure target directory exists before saving screenshots
actionbook browser screenshot                  # Save screenshot.png
actionbook browser screenshot output.png       # Custom path
actionbook browser screenshot --full-page      # Full page
actionbook browser pdf output.pdf              # Export as PDF
```

### JavaScript & Inspection

```bash
actionbook browser eval "document.title"               # Execute JS
actionbook browser inspect 100 200                     # Inspect at coordinates
actionbook browser inspect 100 200 --desc "login btn"  # With description
```

### Cookies

```bash
actionbook browser cookies list                # List all cookies
actionbook browser cookies get "name"          # Get cookie
actionbook browser cookies set "name" "value"  # Set cookie
actionbook browser cookies set "name" "value" --domain ".example.com"
actionbook browser cookies delete "name"       # Delete cookie
actionbook browser cookies clear               # Clear all
```

## Extension Setup & Management

Commands for managing the Chrome Extension bridge:

```bash
actionbook extension install              # Install extension files and register native host
actionbook extension uninstall            # Remove extension files and native host registration
actionbook extension path                 # Show extension directory (for Chrome "Load unpacked")
actionbook extension serve                # Start WebSocket bridge (keep running in a separate terminal)
actionbook extension status               # Check bridge and extension connection status
actionbook extension ping                 # Ping the extension to verify link is alive
```

**Setup flow (one-time):**

1. **Install extension files:**
   ```bash
   actionbook extension install
   ```

2. **Load in Chrome:**
   - Open `chrome://extensions` in your browser
   - Enable **Developer mode** (toggle in top-right corner)
   - Click **Load unpacked**
   - Run `actionbook extension path` to get the directory, then select it

3. **Start the WebSocket bridge:**
   ```bash
   actionbook extension serve   # Keep this running in a separate terminal
   ```

4. **Auto-pairing:** The extension connects automatically via native messaging. If auto-pairing fails: copy the token from `serve` output → paste in extension popup → Save

**Connection check before automation:**
```bash
actionbook extension status    # should show "running"
actionbook extension ping      # should show "responded"
```

For troubleshooting, see [references/extension-troubleshooting.md](references/extension-troubleshooting.md).

## Global Flags

```bash
actionbook --json <command>                    # JSON output
actionbook --headless <command>                # Headless mode (CDP only)
actionbook --verbose <command>                 # Verbose logging
actionbook -P <profile> <command>              # Use specific profile (CDP only)
actionbook --cdp <port|url> <command>          # CDP connection
actionbook --extension <command>               # Use Chrome Extension mode
actionbook --extension-port <port> <command>   # Override bridge port (default: 19222)
```

Environment variable alternative: `ACTIONBOOK_EXTENSION=1 actionbook <command>`

## Guidelines

- Search by task description, not element name ("arxiv search papers" not "search button")
- **Use Action Manual selectors first** - they are pre-verified and don't require snapshot
- Prefer CSS ID selectors (`#id`) over XPath when both are provided
- **Fallback to snapshot when selectors fail** - use `actionbook browser snapshot` then CSS selectors from the output
- Re-snapshot after navigation - DOM changes invalidate previous state
- **Extension mode**: always verify bridge is running (`actionbook extension status`) before sending browser commands
- **Extension mode**: the user's real browser is being controlled — avoid destructive actions (clearing all cookies, closing all tabs) without confirmation
- **Extension mode**: cookie and storage modifications may require manual approval in the extension popup

## Fallback Strategy

### When Fallback is Needed

Actionbook stores pre-computed page data captured at indexing time. This data may become outdated as websites evolve:

- **Selector execution failure** - The returned CSS/XPath selector does not match any element
- **Element mismatch** - The selector matches an element with unexpected type or behavior
- **Multiple selector failures** - Several selectors from the same action fail consecutively

### Fallback Approaches

When Action Manual selectors don't work:

1. **Snapshot the page** - `actionbook browser snapshot` to get the current accessibility tree
2. **Inspect visually** - `actionbook browser screenshot` to see the current state
3. **Inspect by coordinates** - `actionbook browser inspect <x> <y>` to find elements
4. **Execute JS** - `actionbook browser eval "document.querySelector(...)"` for dynamic queries

### When to Exit

If actionbook search returns no results or action fails unexpectedly, use other available tools to continue the task.

## Examples

### End-to-end with Action Manual

```bash
# 1. Find selectors
actionbook search "airbnb search" --domain airbnb.com

# 2. Get detailed selectors (area_id from search results)
actionbook get "airbnb.com:/:default"

# 3. Automate using pre-verified selectors
actionbook browser open "https://www.airbnb.com"
actionbook browser fill "input[data-testid='structured-search-input-field-query']" "Tokyo"
actionbook browser click "button[data-testid='structured-search-input-search-button']"
actionbook browser wait-nav
actionbook browser text
actionbook browser close
```

### Extension mode: Operate on user's Chrome

```bash
# Verify bridge is running
actionbook extension status

# Use the user's existing logged-in session
actionbook --extension browser open "https://github.com/notifications"
actionbook --extension browser wait-nav
actionbook --extension browser text ".notifications-list"
actionbook --extension browser screenshot notifications.png
```

### Extension mode: Startup Flow

When using Extension mode, always follow this sequence:

```bash
# 1. Check if bridge is already running
actionbook extension status

# 2. If not running, start the bridge (keep running in a separate terminal)
actionbook extension serve

# 3. Wait a few seconds for auto-pairing via Native Messaging, then verify
actionbook extension ping
```

The extension auto-pairs via Chrome Native Messaging — no manual token paste needed
(requires `actionbook extension install` to have been run once to register the native host).

### Deep-Dive Documentation

For detailed patterns and best practices:

| Reference | Description |
|-----------|-------------|
| [references/command-reference.md](references/command-reference.md) | Complete command reference with all features |
| [references/authentication.md](references/authentication.md) | Login flows, OAuth, 2FA handling, state reuse |
| [references/extension-troubleshooting.md](references/extension-troubleshooting.md) | Extension bridge troubleshooting guide |
