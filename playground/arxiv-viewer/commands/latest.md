# /arxiv-viewer:latest

Get the latest paper submissions for a specific arXiv category.

## Usage

```
/arxiv-viewer:latest <category> [--max <n>]
```

## Parameters

- `category` (required): arXiv category code (e.g., `cs.CL`, `cs.AI`, `cs.LG`)
- `--max` or `-m` (optional): Maximum papers to return (default: 10)

## Examples

```
/arxiv-viewer:latest cs.CL                # Latest NLP papers
/arxiv-viewer:latest cs.AI --max 20       # Latest 20 AI papers
/arxiv-viewer:latest stat.ML              # Latest statistical ML papers
```

## Workflow

Uses **Actionbook + agent-browser** to scrape arxiv.org:

1. `search_actions("arxiv list recent")` → get action ID
2. `get_action_by_id(action_id)` → get page selectors
3. `agent-browser open https://arxiv.org/list/{category}/recent`
4. `agent-browser get text <paper_list_selector>`
5. Parse and return paper list

## Output Format

```
## Latest Papers in {category}

### Today's Submissions ({date})

1. **{Title}** (arXiv:{id})
   Authors: {author list}
   [Abstract](url) | [PDF](url) | [HTML](url)

2. **{Title}** (arXiv:{id})
   Authors: {author list}
   [Abstract](url) | [PDF](url) | [HTML](url)

...
```

## Common Categories

| Code | Field |
|------|-------|
| `cs.AI` | Artificial Intelligence |
| `cs.CL` | Computation and Language (NLP) |
| `cs.CV` | Computer Vision |
| `cs.LG` | Machine Learning |
| `cs.SE` | Software Engineering |
| `stat.ML` | Statistical ML |
