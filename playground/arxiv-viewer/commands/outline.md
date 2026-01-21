# /arxiv-viewer:outline

Get the table of contents (outline) of an arXiv paper from ar5iv.org.

## Usage

```
/arxiv-viewer:outline <arxiv_id>
```

## Parameters

- `arxiv_id` (required): arXiv paper ID (e.g., `2301.07041`)

## Examples

```
/arxiv-viewer:outline 2301.07041
/arxiv-viewer:outline 1706.03762    # Attention Is All You Need
```

## Workflow

Uses **Actionbook + agent-browser** to extract structure from ar5iv.org:

1. `search_actions("ar5iv outline")` → get action ID
2. `get_action_by_id(action_id)` → get heading selectors
3. `agent-browser open https://ar5iv.org/html/{arxiv_id}`
4. `agent-browser get text "h2.ltx_title, h3.ltx_title"`
5. Parse and return outline

## Output Format

```
## Paper Outline: {Paper Title}

arXiv: {id}

### Sections

1. Introduction (#S1)
2. Related Work (#S2)
   2.1 Background (#S2.SS1)
   2.2 Prior Methods (#S2.SS2)
3. Methods (#S3)
   3.1 Model Architecture (#S3.SS1)
   3.2 Training (#S3.SS2)
4. Experiments (#S4)
5. Results (#S5)
6. Conclusion (#S6)

### Appendices
A. Implementation Details (#A1)
B. Additional Results (#A2)

---
*Use `/arxiv-viewer:read {id} #S3` to read a specific section*
```

## Notes

- Section IDs (like `#S3`) can be used with `/arxiv-viewer:read`
- Subsections are indicated by `#S2.SS1` format
- Appendices typically start with `#A1`, `#A2`, etc.
