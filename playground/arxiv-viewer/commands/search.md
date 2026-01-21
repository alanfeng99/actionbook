# /arxiv-viewer:search

Search arXiv papers using advanced query syntax.

## Usage

```
/arxiv-viewer:search <query> [options]
```

## Parameters

- `query` (required): Search terms, supports field prefixes and boolean operators
- `--category` or `-c`: Filter by category (e.g., `cs.AI`, `cs.CL`)
- `--author` or `-a`: Filter by author name
- `--max` or `-m`: Maximum results (default: 10, max: 50)
- `--sort`: Sort by `relevance`, `date`, or `updated` (default: relevance)

## Search Query Syntax

### Field Prefixes
- `ti:` - Title (e.g., `ti:transformer`)
- `au:` - Author (e.g., `au:hinton`)
- `abs:` - Abstract (e.g., `abs:attention`)
- `cat:` - Category (e.g., `cat:cs.CL`)
- `all:` - All fields

### Boolean Operators (UPPERCASE)
- `AND` - Both terms
- `OR` - Either term
- `ANDNOT` - First but not second

## Examples

```
# Simple search
/arxiv-viewer:search transformer

# Search with category
/arxiv-viewer:search transformer --category cs.CL

# Search by author
/arxiv-viewer:search --author hinton --max 20

# Advanced query
/arxiv-viewer:search ti:attention AND cat:cs.CL --max 15

# Multiple authors
/arxiv-viewer:search au:bengio OR au:lecun --sort date

# Combined search
/arxiv-viewer:search ti:llm AND abs:reasoning --category cs.AI --max 10
```

## Workflow

1. **Parse query and options** - Build arXiv API search URL
2. **Launch search-executor agent** - Execute search via API
3. **Parse results** - Extract entries from XML response
4. **Present results** - List papers with titles, authors, IDs

## Output Format

```
## Search Results for "{query}"

Found {n} papers:

1. **{Title}** (arXiv:{id})
   Authors: {author list}
   Categories: {categories}
   Published: {date}

2. **{Title}** (arXiv:{id})
   ...
```
