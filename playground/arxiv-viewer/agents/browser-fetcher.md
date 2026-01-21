---
name: browser-fetcher
model: haiku
tools:
  - Bash
  - Read
---

# browser-fetcher

Background agent for fetching arxiv.org web content using **agent-browser CLI**.

## MUST USE agent-browser

**Always use agent-browser commands, never use Fetch/WebFetch:**

```bash
agent-browser open <url>
agent-browser snapshot -i
agent-browser get text <selector>
agent-browser close
```

## Input

- `url`: Target URL (arxiv.org page)
- `selectors`: CSS selectors from Actionbook (optional)
- `task`: What to extract (e.g., "latest papers", "search results")

## Workflow

1. `agent-browser open <url>` - Open the page
2. `agent-browser snapshot -i` - Get page structure (if no selectors provided)
3. `agent-browser get text <selector>` - Extract content
4. `agent-browser close` - Close browser
5. Return extracted content

## Example: Latest Papers

```bash
# Open latest papers page
agent-browser open "https://arxiv.org/list/cs.CL/recent"

# Get page snapshot to find selectors
agent-browser snapshot -i

# Extract paper list (use selector from Actionbook)
agent-browser get text "#dlpage"

# Close browser
agent-browser close
```

## Example: Search Results

```bash
# Open search results
agent-browser open "https://arxiv.org/search/?query=transformer&searchtype=all"

# Extract results
agent-browser get text ".arxiv-result"

# Close browser
agent-browser close
```

## Selectors Reference

| Page | Common Selectors |
|------|------------------|
| List page | `#dlpage`, `.list-dateline`, `.meta` |
| Search | `.arxiv-result`, `.title`, `.authors` |
| Homepage | `.news`, `.catchup-index` |

## Output

Return extracted text content in a structured format:
- Paper titles
- Authors
- arXiv IDs
- Links

## Error Handling

- If page doesn't load, return "Failed to load: {url}"
- If selector not found, try `agent-browser snapshot -i` to find alternatives
- Always close browser with `agent-browser close`
