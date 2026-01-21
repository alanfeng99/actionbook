# arxiv-viewer

A Claude Code plugin for accessing, searching, and reading academic papers from arXiv.

## Overview

arxiv-viewer provides a **hybrid approach** combining three data sources:

| Source | Method | Best For |
|--------|--------|----------|
| **arXiv API** | WebFetch | Quick metadata lookup, search |
| **arxiv.org** | Actionbook + agent-browser | Latest papers, trending, advanced search |
| **ar5iv.org** | Actionbook + agent-browser | Section-level reading, figures, citations |

```
┌─────────────────────────────────────────────────────────────┐
│                     arxiv-viewer                            │
├─────────────────┬─────────────────┬─────────────────────────┤
│   arXiv API     │  arxiv.org Web  │      ar5iv.org          │
│   (WebFetch)    │  (Actionbook)   │    (Actionbook)         │
├─────────────────┼─────────────────┼─────────────────────────┤
│ • Metadata      │ • Latest list   │ • Read sections         │
│ • Search        │ • Trending      │ • Extract figures       │
│ • By ID lookup  │ • Advanced      │ • Extract citations     │
│                 │   search form   │ • Paper outline         │
└─────────────────┴─────────────────┴─────────────────────────┘
```

## Key Features

### 1. API-Based Access (Fast & Structured)
- **Paper lookup** - Get metadata, abstract, authors by arXiv ID
- **Search** - Query papers with field prefixes and boolean operators
- **Download** - Download PDFs directly

### 2. Web-Based Access (Actionbook + agent-browser)
- **Latest papers** - Browse recent submissions by category
- **Trending** - See featured papers from arXiv homepage
- **Advanced search** - Use arXiv's advanced search form

### 3. HTML Paper Reading (ar5iv.org)
- **Section reading** - Read specific sections (Introduction, Methods, etc.)
- **Paper outline** - Get table of contents with section IDs
- **Figure extraction** - Extract all figures with captions
- **Citation extraction** - Get full bibliography

## Installation

### From Actionbook Marketplace (Recommended)

```bash
# Step 1: Add Actionbook marketplace
/plugin marketplace add actionbook/actionbook

# Step 2: Install arxiv-viewer plugin
/plugin install arxiv-viewer@actionbook-marketplace
```

### Manual Installation

Clone the repository and add to your Claude Code configuration:

```bash
git clone https://github.com/actionbook/actionbook.git
cd actionbook/playground/arxiv-viewer
./setup.sh
```

## Setup

### Quick Setup

```bash
./setup.sh
```

### Manual Setup

Add to `.claude/settings.local.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(curl *)",
      "Bash(mkdir -p *)",
      "Bash(agent-browser *)"
    ]
  }
}
```

## Commands

### API Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/arxiv-viewer:paper <id>` | View paper metadata | `/arxiv-viewer:paper 2301.07041` |
| `/arxiv-viewer:search <query>` | Search papers | `/arxiv-viewer:search transformer --category cs.CL` |
| `/arxiv-viewer:download <id> [dir]` | Download PDF | `/arxiv-viewer:download 2301.07041 ./papers` |

### Web Commands (Actionbook)

| Command | Description | Example |
|---------|-------------|---------|
| `/arxiv-viewer:latest <category>` | Latest submissions | `/arxiv-viewer:latest cs.CL` |
| `/arxiv-viewer:trending` | Trending papers | `/arxiv-viewer:trending` |

### HTML Reading Commands (ar5iv)

| Command | Description | Example |
|---------|-------------|---------|
| `/arxiv-viewer:read <id> [section]` | Read paper section | `/arxiv-viewer:read 2301.07041 methods` |
| `/arxiv-viewer:outline <id>` | Get paper outline | `/arxiv-viewer:outline 2301.07041` |
| `/arxiv-viewer:figures <id>` | Extract figures | `/arxiv-viewer:figures 2301.07041` |
| `/arxiv-viewer:citations <id>` | Extract bibliography | `/arxiv-viewer:citations 2301.07041` |

### Report Generation

| Command | Description | Example |
|---------|-------------|---------|
| `/arxiv-viewer:report <id>` | Generate AI paper report | `/arxiv-viewer:report 2301.07041` |

## Usage Examples

### Basic Paper Lookup

```
/arxiv-viewer:paper 1706.03762
```

Returns title, authors, abstract, categories, and links.

### Search with Filters

```
# Search by title
/arxiv-viewer:search ti:transformer --max 10

# Search by author
/arxiv-viewer:search au:hinton

# Combined search
/arxiv-viewer:search ti:attention AND cat:cs.CL --max 20
```

### Browse Latest Papers

```
# Latest NLP papers
/arxiv-viewer:latest cs.CL

# Latest ML papers with limit
/arxiv-viewer:latest cs.LG --max 20
```

### Read Paper Sections (ar5iv)

```
# Get paper structure first
/arxiv-viewer:outline 2301.07041

# Read specific section
/arxiv-viewer:read 2301.07041 introduction
/arxiv-viewer:read 2301.07041 #S3

# Extract all figures
/arxiv-viewer:figures 2301.07041

# Get bibliography
/arxiv-viewer:citations 2301.07041
```

### Generate Paper Report

```
# Generate a comprehensive report with AI analysis
/arxiv-viewer:report 2301.07041

# Search by title and generate report
/arxiv-viewer:report "Attention Is All You Need"
```

The report includes:
- Paper metadata (authors, affiliations, date)
- Abstract summary
- Problem statement
- Key contributions
- Method overview
- Experimental results
- Significance analysis
- All branded with **Powered by ActionBook**

### Natural Language

```
"Show me the latest NLP papers"
"Search for transformer papers by Vaswani"
"Read the methods section of paper 2301.07041"
"What figures are in the attention paper?"
"List all citations from this paper"
"Generate a report for paper 2301.07041"
```

## Search Query Syntax

### Field Prefixes

| Prefix | Field | Example |
|--------|-------|---------|
| `ti:` | Title | `ti:transformer` |
| `au:` | Author | `au:hinton` |
| `abs:` | Abstract | `abs:attention` |
| `cat:` | Category | `cat:cs.AI` |
| `all:` | All fields | `all:neural network` |

### Boolean Operators

| Operator | Usage | Example |
|----------|-------|---------|
| `AND` | Both terms | `ti:transformer AND cat:cs.CL` |
| `OR` | Either term | `au:hinton OR au:lecun` |
| `ANDNOT` | Exclude | `ti:attention ANDNOT ti:self` |

## Common Categories

| Code | Field |
|------|-------|
| `cs.AI` | Artificial Intelligence |
| `cs.CL` | Computation and Language (NLP) |
| `cs.CV` | Computer Vision |
| `cs.LG` | Machine Learning |
| `cs.NE` | Neural and Evolutionary Computing |
| `cs.SE` | Software Engineering |
| `stat.ML` | Statistical Machine Learning |

## ar5iv HTML Reading

[ar5iv.org](https://ar5iv.org) converts arXiv LaTeX papers to accessible HTML5, enabling precise section-level access.

### Benefits

| Feature | PDF | ar5iv HTML |
|---------|-----|------------|
| Section access | Full document only | Specific sections |
| Figure extraction | Difficult | Easy with selectors |
| Citation parsing | Complex | Structured |
| Token efficiency | Low (full text) | High (targeted) |

### Section Selectors

| Section | Selector |
|---------|----------|
| Abstract | `.ltx_abstract` |
| Introduction | `#S1` |
| Methods | `#S3` (varies) |
| Conclusion | Last section |
| Bibliography | `.ltx_bibliography` |

### Workflow

```
1. /arxiv-viewer:outline 2301.07041    # See structure
2. /arxiv-viewer:read 2301.07041 #S3   # Read specific section
3. /arxiv-viewer:figures 2301.07041    # Get figures
```

## Architecture

### Agents

| Agent | Model | Purpose |
|-------|-------|---------|
| paper-fetcher | haiku | Fetch paper metadata via API |
| search-executor | haiku | Execute API search queries |
| paper-summarizer | sonnet | Download and summarize PDFs |
| browser-fetcher | haiku | Scrape arxiv.org web pages |
| html-reader | haiku | Read ar5iv.org HTML papers |

### Data Flow

```
User Request
    │
    ├─► API Route (paper, search, download)
    │       └─► WebFetch → arXiv API → Response
    │
    ├─► Web Route (latest, trending)
    │       └─► Actionbook → agent-browser → arxiv.org → Response
    │
    └─► HTML Route (read, outline, figures, citations)
            └─► Actionbook → agent-browser → ar5iv.org → Response
```

## Dependencies

| Dependency | Purpose |
|------------|---------|
| Actionbook MCP | Web page selectors |
| agent-browser | Browser automation |
| curl | PDF downloads |

## Troubleshooting

### "No HTML version available"

Not all papers have ar5iv versions. Fallback to PDF:
```
/arxiv-viewer:paper 2301.07041
/arxiv-viewer:download 2301.07041
```

### "agent-browser not found"

Install agent-browser globally:
```bash
npm install -g agent-browser
```

### Permission denied

Run setup script or add permissions manually:
```bash
./setup.sh
```

## License

MIT
