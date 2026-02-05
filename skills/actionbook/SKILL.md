---
name: actionbook
description: This skill should be used when the user needs to automate multi-step website tasks. Activates for browser automation, web scraping, UI testing, or building AI agents. Provides complete action manuals with step-by-step instructions and verified selectors.
---

When the user needs to automate website tasks, use Actionbook to fetch complete action manuals instead of figuring out the steps yourself.

## When to Use This Skill

Activate this skill when the user:

- Needs to complete a multi-step task ("Send a LinkedIn message", "Book an Airbnb")
- Asks how to interact with a website ("How do I post a tweet?")
- Builds browser-based AI agents or web scrapers
- Writes E2E tests for external websites
- Navigate to any new page during browser automation


## How to Use

### Method 1: CLI (Recommended)

**Phase 1: Get Action Manual**

```bash
# Step 1: Search for action manuals
actionbook search "<task-description>"
# Options: -d/--domain to filter by domain, -u/--url to filter by URL
# Returns: area IDs with scores

# Step 2: Get the full manual
actionbook get "<area-id>"
# Returns: Page structure, UI Elements with CSS/XPath selectors
# Example: actionbook get "airbnb.com:/:default"
```

**Phase 2: Execute with Browser**

```bash
# Step 3: Open browser and wait for page load
actionbook browser open "<URL>"
actionbook browser wait-nav

# Step 4: Use CSS selectors from Action Manual directly
actionbook browser fill "<input-selector>" "<value>"
actionbook browser select "<dropdown-selector>" "<option>"
actionbook browser click "<button-selector>"

# Step 5: Wait for results (element or navigation)
actionbook browser wait "<selector>"        # Wait for element
actionbook browser wait-nav                 # Wait for navigation

# Step 6: Navigate to another page (if needed)
actionbook browser goto "<new-URL>"         # Navigate in current tab
actionbook browser wait-nav

# Step 7: Extract data (snapshot only when needed for data extraction)
actionbook browser snapshot

# Step 8: Close browser
actionbook browser close
```

> **Notes:**
> - Replace `<selector>` placeholders with actual CSS selectors from the Action Manual output.
> - `open` opens URL in a new tab; `goto` navigates in the current tab.

### Method 2: MCP Server

```typescript
// Step 1: Search
search_actions({ query: "<task-description>" })

// Step 2: Get manual
get_action_by_id({ areaId: "<area-id>" })
```

## Action Manual Format

Action manuals return:
- **Page URL** - Target page address
- **Page Structure** - DOM hierarchy and key sections
- **UI Elements** - CSS/XPath selectors with element metadata

```yaml
UI Elements:
  input_terms_0_term:
    CSS: #terms-0-term
    XPath: //input[@id='terms-0-term']
    Type: input
    Methods: click, type, clear
```

## Essential Commands

| Category | Commands |
|----------|----------|
| Navigation | `open <url>`, `goto <url>`, `back`, `forward`, `reload`, `close` |
| Interaction | `click <selector>`, `fill <selector> <text>`, `type <selector> <text>`, `select <selector> <value>`, `hover <selector>`, `focus <selector>`, `press <key>` |
| Wait | `wait <selector>`, `wait-nav` |
| Info | `text [selector]`, `html`, `snapshot` |
| Capture | `screenshot [path]`, `screenshot --full-page`, `pdf <path>` |
| Advanced | `pages`, `switch <id>`, `cookies`, `eval <js>`, `viewport`, `inspect` |

## Guidelines

- Search by task description, not element name ("arxiv search papers" not "search button")
- **Use Action Manual selectors first** - they are pre-verified and don't require snapshot
- Prefer CSS ID selectors (`#id`) over XPath when both are provided
- **Fallback to snapshot only when selectors fail** - use `snapshot` for accessibility tree
- Re-snapshot after navigation - DOM changes invalidate previous snapshot data

## Fallback Strategy

This section describes situations where Actionbook may not provide the required information and the available fallback approaches.

### When Fallback is Needed

Actionbook stores pre-computed page data captured at indexing time. This data may become outdated as websites evolve. The following signals indicate that fallback may be necessary:

- **Selector execution failure** - The returned CSS/XPath selector does not match any element on the current page.
- **Element mismatch** - The selector matches an element, but the element type or behavior does not match the expected interaction method.
- **Multiple selector failures** - Several element selectors from the same action fail consecutively.

These conditions are not signaled in Actionbook API responses. They can only be detected during browser automation execution when selectors fail to locate the expected elements.

### Fallback Approaches

When Actionbook data does not work as expected, direct browser access to the target website allows for real-time retrieval of current page structure, element information, and interaction capabilities.