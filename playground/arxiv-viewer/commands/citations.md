# /arxiv-viewer:citations

Extract the bibliography/references from an arXiv paper (ar5iv.org).

## Usage

```
/arxiv-viewer:citations <arxiv_id> [--search <term>]
```

## Parameters

- `arxiv_id` (required): arXiv paper ID (e.g., `2301.07041`)
- `--search` or `-s` (optional): Search term to filter citations

## Examples

```
/arxiv-viewer:citations 2301.07041                    # All references
/arxiv-viewer:citations 2301.07041 --search transformer  # Filter by "transformer"
/arxiv-viewer:citations 1706.03762                    # Attention paper refs
```

## Workflow

Uses **Actionbook + agent-browser** to extract bibliography from ar5iv.org:

1. `search_actions("ar5iv bibliography")` → get action ID
2. `get_action_by_id(action_id)` → get citation selectors
3. `agent-browser open https://ar5iv.org/html/{arxiv_id}`
4. `agent-browser get text ".ltx_bibliography"`
5. Parse and return citations

## Selectors

| Element | Selector |
|---------|----------|
| Bibliography section | `.ltx_bibliography` |
| Single citation | `.ltx_bibitem` |
| Citation by ID | `#bib.bib1`, `#bib.bib2`, etc. |

## Output Format

```
## References from: {Paper Title}

arXiv: {id}
Total citations: {n}

### References

[1] {Author et al.} ({Year}). {Title}. {Venue}.

[2] {Author et al.} ({Year}). {Title}. {Venue}.

[3] {Author et al.} ({Year}). {Title}. {Venue}.

...

---
*Extracted from ar5iv.org/html/{id}*
```

## Notes

- Citation format varies by paper's LaTeX style
- Some citations may include DOI or arXiv links
- Use `--search` to find specific referenced works
