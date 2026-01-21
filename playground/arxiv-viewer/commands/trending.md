# /arxiv-viewer:trending

Get trending and highlighted papers from arXiv homepage.

## Usage

```
/arxiv-viewer:trending [--category <cat>]
```

## Parameters

- `--category` or `-c` (optional): Filter by category (e.g., `cs`, `physics`, `math`)

## Examples

```
/arxiv-viewer:trending                    # All trending papers
/arxiv-viewer:trending --category cs      # Trending CS papers
```

## Workflow

Uses **Actionbook + agent-browser** to scrape arxiv.org homepage:

1. `search_actions("arxiv homepage")` → get action ID
2. `get_action_by_id(action_id)` → get page selectors
3. `agent-browser open https://arxiv.org/`
4. `agent-browser get text <featured_selector>`
5. Parse and return trending papers

## Output Format

```
## Trending on arXiv

### Featured Papers

1. **{Title}** (arXiv:{id})
   Authors: {author list}
   Category: {category}
   [Abstract](url) | [PDF](url)

### Recent Highlights

1. **{Title}** (arXiv:{id})
   ...
```

## Notes

- Trending papers are curated by arXiv editors
- Updates periodically throughout the day
- May include papers from any category
