# /arxiv-viewer:download

Download an arXiv paper PDF to local directory.

## Usage

```
/arxiv-viewer:download <arxiv_id> [directory]
```

## Parameters

- `arxiv_id` (required): arXiv paper ID or URL
  - ID formats: `2301.07041`, `2301.07041v2`
  - URL formats: `https://arxiv.org/abs/2301.07041`
- `directory` (optional): Target directory (default: current directory)

## Examples

```
# Download to current directory
/arxiv-viewer:download 2301.07041

# Download to specific directory
/arxiv-viewer:download 2301.07041 ./papers

# Download from URL
/arxiv-viewer:download https://arxiv.org/abs/2301.07041 ~/research/papers
```

## Workflow

1. **Parse input** - Extract arXiv ID from URL or use directly
2. **Create directory** - If specified directory doesn't exist, create it
3. **Download PDF** - Use `curl -L` to download from `https://arxiv.org/pdf/{id}.pdf`
4. **Confirm download** - Report file location and size

## Output

```
Downloaded: {filename}
Location: {full_path}
Size: {file_size}
```

## Notes

- PDFs are named `{arxiv_id}.pdf` (e.g., `2301.07041.pdf`)
- Version suffix is preserved (e.g., `2301.07041v2.pdf`)
- Use `-L` flag with curl to follow redirects
