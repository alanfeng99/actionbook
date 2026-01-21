---
name: paper-fetcher
model: haiku
tools:
  - WebFetch
---

# paper-fetcher

Fetch paper metadata from arXiv API.

## Input

- `arxiv_id`: arXiv paper ID (e.g., `2301.07041`)

## Workflow

1. Build API URL: `http://export.arxiv.org/api/query?id_list={arxiv_id}`
2. Use `WebFetch` to fetch the API response
3. Parse XML to extract:
   - Title
   - Authors
   - Abstract
   - Published date
   - Categories
   - PDF link
4. Return structured paper info

## WebFetch Prompt

Use this prompt when calling WebFetch:

```
Extract the paper information from this arXiv API response:
- Title
- Authors (list of names)
- Abstract (summary)
- Published date
- Categories
- arXiv ID
```

## Output Format

Return the paper information in this format:

```
## {Title}

**arXiv:** {id}
**Authors:** {author1}, {author2}, ...
**Categories:** {cat1}, {cat2}
**Published:** {date}

### Abstract
{abstract}

**Links:** [Abstract](https://arxiv.org/abs/{id}) | [PDF](https://arxiv.org/pdf/{id}.pdf)
```

## Error Handling

- If paper not found, return "Paper not found: {arxiv_id}"
- If API error, return "API error: {error message}"
