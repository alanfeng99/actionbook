#!/bin/bash

# arxiv-viewer setup script
# Configures permissions for Claude Code

set -e

echo "Setting up arxiv-viewer plugin..."
echo ""

# Check for agent-browser
if ! command -v agent-browser &> /dev/null; then
    echo "⚠️  agent-browser not found. Install it with:"
    echo "   npm install -g agent-browser"
    echo ""
fi

# Create .claude directory if it doesn't exist
mkdir -p .claude

# Check if settings.local.json exists
if [ -f .claude/settings.local.json ]; then
    echo "Found existing .claude/settings.local.json"
    echo ""
    echo "Please manually add these permissions:"
    echo '  "Bash(curl *)"'
    echo '  "Bash(mkdir -p *)"'
    echo '  "Bash(agent-browser *)"'
    echo ""
else
    # Create new settings file
    cat > .claude/settings.local.json << 'EOF'
{
  "permissions": {
    "allow": [
      "Bash(curl *)",
      "Bash(mkdir -p *)",
      "Bash(agent-browser *)"
    ]
  }
}
EOF
    echo "✅ Created .claude/settings.local.json with required permissions"
fi

echo ""
echo "Setup complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Available commands:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📄 API-based:"
echo "  /arxiv-viewer:paper <id>        View paper info and abstract"
echo "  /arxiv-viewer:search <query>    Search arXiv papers"
echo "  /arxiv-viewer:download <id>     Download paper PDF"
echo ""
echo "🌐 Web-based (Actionbook):"
echo "  /arxiv-viewer:latest <cat>      Latest papers in category"
echo "  /arxiv-viewer:trending          Trending papers"
echo ""
echo "📖 HTML Reading (ar5iv):"
echo "  /arxiv-viewer:read <id> [sec]   Read paper section"
echo "  /arxiv-viewer:outline <id>      Get paper outline"
echo "  /arxiv-viewer:figures <id>      Extract figures"
echo "  /arxiv-viewer:citations <id>    Extract bibliography"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
