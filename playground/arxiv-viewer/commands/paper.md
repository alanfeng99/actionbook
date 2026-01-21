# /arxiv-viewer:paper

View and summarize an arXiv paper by ID or URL.

## Usage

```
/arxiv-viewer:paper <arxiv_id_or_url>
```

## Parameters

- `arxiv_id_or_url` (required): arXiv paper ID or URL
  - ID formats: `2301.07041`, `2301.07041v2`, `cs.AI/0612345`
  - URL formats: `https://arxiv.org/abs/2301.07041`, `https://arxiv.org/pdf/2301.07041.pdf`

## Examples

```
/arxiv-viewer:paper 2301.07041
/arxiv-viewer:paper 2301.07041v2
/arxiv-viewer:paper https://arxiv.org/abs/2301.07041
/arxiv-viewer:paper https://arxiv.org/pdf/2301.07041.pdf
```

## Workflow

1. **Parse input** - Extract arXiv ID from URL or use directly
2. **Launch paper-fetcher agent** - Fetch metadata via arXiv API
3. **Present paper info** - Title, authors, abstract, categories, links
4. **Optionally summarize** - If requested, download PDF and summarize

## Output Format

```
## {Paper Title}

**arXiv:** {id}
**Authors:** {author list}
**Categories:** {category list}
**Published:** {date}

### Abstract
{abstract text}

**Links:** [Abstract]({url}) | [PDF]({url})
```
