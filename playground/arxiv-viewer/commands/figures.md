# /arxiv-viewer:figures

Extract all figures and their captions from an arXiv paper (ar5iv.org).

## Usage

```
/arxiv-viewer:figures <arxiv_id> [--figure <n>]
```

## Parameters

- `arxiv_id` (required): arXiv paper ID (e.g., `2301.07041`)
- `--figure` or `-f` (optional): Specific figure number to extract

## Examples

```
/arxiv-viewer:figures 2301.07041           # All figures
/arxiv-viewer:figures 2301.07041 --figure 1  # Just Figure 1
/arxiv-viewer:figures 1706.03762           # Transformer paper figures
```

## Workflow

Uses **Actionbook + agent-browser** to extract figures from ar5iv.org:

1. `search_actions("ar5iv figure")` → get action ID
2. `get_action_by_id(action_id)` → get figure selectors
3. `agent-browser open https://ar5iv.org/html/{arxiv_id}`
4. `agent-browser get text "figure.ltx_figure"`
5. Parse figures and captions

## Selectors

| Element | Selector |
|---------|----------|
| All figures | `figure.ltx_figure` |
| Figure by ID | `#S3.F1` (Section 3, Figure 1) |
| Figure image | `figure.ltx_figure img` |
| Figure caption | `figcaption.ltx_caption` |

## Output Format

```
## Figures from: {Paper Title}

arXiv: {id}

### Figure 1
**Caption:** {caption text}
**Location:** Section {n}
**Image:** {image_url or description}

### Figure 2
**Caption:** {caption text}
**Location:** Section {n}
**Image:** {image_url or description}

...

---
*Total: {n} figures*
```

## Notes

- Figure numbers may not be sequential
- Some figures may be in appendices
- Image URLs point to ar5iv.org hosted images
