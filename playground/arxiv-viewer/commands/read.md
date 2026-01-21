# /arxiv-viewer:read

Read a specific section from an arXiv paper's HTML version (ar5iv.org).

## Usage

```
/arxiv-viewer:read <arxiv_id> [section]
```

## Parameters

- `arxiv_id` (required): arXiv paper ID (e.g., `2301.07041`)
- `section` (optional): Section to read. Options:
  - `abstract` - Paper abstract
  - `introduction` or `intro` - Introduction section
  - `methods` - Methods/Approach section
  - `results` - Results/Experiments section
  - `discussion` - Discussion section
  - `conclusion` - Conclusion section
  - `all` - Full paper (default)
  - `#S1`, `#S2`, etc. - Specific section by ID

## Examples

```
/arxiv-viewer:read 2301.07041                      # Full paper
/arxiv-viewer:read 2301.07041 abstract             # Just abstract
/arxiv-viewer:read 2301.07041 methods              # Methods section
/arxiv-viewer:read 2301.07041 #S3                  # Section 3
/arxiv-viewer:read 2301.07041 introduction         # Introduction
```

## Workflow

Uses **Actionbook + agent-browser** to read ar5iv.org HTML:

1. `search_actions("ar5iv section")` → get action ID
2. `get_action_by_id(action_id)` → get section selectors
3. `agent-browser open https://ar5iv.org/html/{arxiv_id}`
4. `agent-browser get text <section_selector>`
5. Return section content

## Section Selectors

| Section | Selector |
|---------|----------|
| Abstract | `.ltx_abstract` |
| Introduction | `#S1` or first `section.ltx_section` |
| Methods | `#S3` (varies by paper) |
| Results | `#S4` (varies by paper) |
| Conclusion | Last `section.ltx_section` |
| Full paper | `.ltx_document` |

## Output Format

```
## {Section Title}

{section content}

---
*Source: ar5iv.org/html/{arxiv_id}*
```

## Notes

- Not all papers have HTML versions on ar5iv
- Section IDs may vary between papers
- Use `/arxiv-viewer:outline` first to see available sections
