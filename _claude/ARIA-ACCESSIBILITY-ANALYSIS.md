# ARIA Accessibility Analysis Report

**Date**: 2026-01-02
**Scope**: amp.dev.22 template accessibility
**Focus**: ARIA roles, states, and properties for improved accessibility

---

## Executive Summary

The amp.dev.22 templates have **partial ARIA implementation** with good practices in some areas (pixi, consent) but significant gaps in core templates (header, footer, sidebar, search).

### Current State Summary

| Area | Status | Notes |
|------|--------|-------|
| Landmark Roles | ⚠️ Partial | `<nav>`, `<header>`, `<footer>` used but missing explicit roles |
| Widget Roles | ⚠️ Partial | Some `role="button"`, missing tab/menu patterns |
| ARIA Labels | ⚠️ Partial | Good on buttons, missing on icons and links |
| Live Regions | ❌ Missing | No `aria-live` for dynamic content |
| Focus Management | ⚠️ Partial | Some `tabindex`, missing focus traps |

### High-Impact Recommendations

1. Add `role="search"` to search form
2. Add `aria-label` to icon-only navigation links
3. Add `aria-expanded` to flyout menu buttons
4. Add `aria-live="polite"` to search results

---

## 1. Template Inventory

### Base Templates (Affect All Pages)

| Template | Purpose | Priority |
|----------|---------|----------|
| `layouts/default.j2` | Base HTML structure | HIGH |
| `partials/header.j2` | Site header and main nav | HIGH |
| `partials/footer.j2` | Site footer | HIGH |
| `partials/sidebar.j2` | Documentation sidebar | HIGH |
| `partials/search.j2` | Search lightbox | HIGH |
| `partials/burger-menu.j2` | Mobile navigation | HIGH |

### Component Templates

| Template | Purpose | Priority |
|----------|---------|----------|
| `partials/consent.j2` | Cookie consent | MEDIUM |
| `partials/toc.j2` | Table of contents | MEDIUM |
| `partials/accordion.j2` | Collapsible sections | MEDIUM |
| `partials/breadcrumbs.j2` | Navigation breadcrumbs | LOW |
| `partials/format-toggle.j2` | Format switcher | MEDIUM |

---

## 2. Current ARIA State

### Existing ARIA Usage (Found: 54 instances)

#### Good Practices Found ✅

| Template | Attribute | Usage |
|----------|-----------|-------|
| `burger-menu.j2:48` | `role="button" aria-label` | Menu toggle button |
| `consent.j2:28` | `role="button" aria-label` | Dismiss button |
| `consent.j2:36` | `role="button" aria-label` | Accept button |
| `header.j2:104-105` | `role="button" tabindex="0"` | Search trigger |
| `pixi/primary-checks.j2:5-9` | `role="tab" aria-selected aria-controls` | Tab interface |
| `pixi/share-dialog.j2:7` | `role="dialog" aria-labelledby` | Modal dialog |
| `pixi/tooltip.j2:6` | `aria-expanded` | Expandable tooltip |

#### Custom/Non-Standard Roles ⚠️

| Template | Role | Issue |
|----------|------|-------|
| `tools-teaser.j2:6` | `role="filter"` | Not a valid ARIA role |
| `examples/documentation.j2:45` | `role="contentmenutrigger"` | Not a valid ARIA role |
| `toc.j2:11` | `role="contentmenutrigger"` | Not a valid ARIA role |
| `sidebar-toggle-button.j2:7,14` | `role="categoriemenutrigger"` | Not a valid ARIA role |

---

## 3. Gap Analysis

### Missing Landmark Roles

| Element | Current | Recommended |
|---------|---------|-------------|
| `<header>` (header.j2:73) | No role | `role="banner"` (implicit, but add for clarity) |
| `<nav>` (header.j2:16) | No role | `role="navigation" aria-label="Main"` |
| `<main>` (default.j2:115-118) | Missing element | Wrap content in `<main role="main">` |
| `<footer>` (footer.j2:6) | No role | `role="contentinfo"` (implicit, but add for clarity) |
| Search form (search.j2:34) | No role | `role="search"` |
| Sidebar (sidebar.j2:50) | No role | `role="complementary" aria-label="Sidebar"` |

### Missing Widget Attributes

| Element | Location | Missing |
|---------|----------|---------|
| Nav flyout buttons | header.j2:34-39 | `aria-expanded`, `aria-haspopup="menu"` |
| Flyout menus | header.j2:41 | `role="menu"`, items need `role="menuitem"` |
| Language selector | language-selector.j2 | `aria-label`, `aria-expanded` |
| Accordion triggers | accordion.j2 | `aria-expanded`, `aria-controls` |
| TOC toggle | toc.j2 | `aria-expanded` |
| Sidebar toggle | sidebar-toggle-button.j2 | Valid `role="button"`, `aria-expanded` |

### Missing Descriptive Labels

| Element | Location | Needed |
|---------|----------|--------|
| Search close button | search.j2:24-31 | `aria-label="{{ _('Close search') }}"` |
| Logo home link | header.j2:11-14 | `aria-label="{{ _('Home') }}"` |
| Social media icons | footer.j2:15-32 | Already have `title`, add `aria-label` |
| Format icons | format-toggle.j2 | `aria-label` for each format |
| Sidebar nav icons | sidebar.j2 | `aria-hidden="true"` for decorative icons |

### Missing Live Regions

| Feature | Location | Needed |
|---------|----------|--------|
| Search results | search.j2:62 | `aria-live="polite"` |
| Search status | search.j2:66 | `aria-busy` during loading |
| Format filter results | Various | `aria-live="polite"` |

---

## 4. Priority Implementation List

### Phase 1: HIGH Priority (Core Templates)

These changes affect every page and have the highest accessibility impact.

#### 1.1 Add Main Landmark

**File**: `frontend/templates/layouts/default.j2`
**Line**: 115-118

```jinja2
{# BEFORE #}
{% block main %}
{% include 'views/partials/content.j2' %}
{% endblock %}

{# AFTER #}
{% block main %}
<main role="main" id="main-content">
{% include 'views/partials/content.j2' %}
</main>
{% endblock %}
```

#### 1.2 Add Search Role

**File**: `frontend/templates/views/partials/search.j2`
**Line**: 33-60

```jinja2
{# BEFORE #}
<div class="ap-o-search-field">
  <form action-xhr="..."

{# AFTER #}
<div class="ap-o-search-field" role="search">
  <form action-xhr="..."
```

Add aria-label to close button (line 24-31):
```jinja2
<div class="ap-m-search-trigger ap-m-search-trigger-close"
     on="tap:searchLightbox.close,AMP.setState({clear: true, query: null})"
     role="button"
     tabindex="0"
     aria-label="{{ _('Close search') }}">
```

Add live region to results (line 62):
```jinja2
<div class="ap-o-search-result" id="searchResult" tabindex="-1"
     aria-live="polite" aria-atomic="true">
```

#### 1.3 Add Navigation Labels

**File**: `frontend/templates/views/partials/header.j2`
**Line**: 16

```jinja2
{# BEFORE #}
<nav class="ap-o-header-main">

{# AFTER #}
<nav class="ap-o-header-main" aria-label="{{ _('Main navigation') }}">
```

**Line**: 34-39 (flyout buttons):
```jinja2
{# BEFORE #}
<button class="ap-o-header-main-link ap-m-nav-link ...">
  {{_(section.title)}}
  <div class="ap-a-ico ap-o-header-main-link-icon">

{# AFTER #}
<button class="ap-o-header-main-link ap-m-nav-link ..."
        aria-expanded="false"
        aria-haspopup="menu">
  {{_(section.title)}}
  <div class="ap-a-ico ap-o-header-main-link-icon" aria-hidden="true">
```

**Line**: 41 (flyout menu):
```jinja2
{# BEFORE #}
<ul class="ap-o-header-flyout">

{# AFTER #}
<ul class="ap-o-header-flyout" role="menu" aria-label="{{_(section.title)}}">
```

**Line**: 48, 61 (menu items):
```jinja2
{# BEFORE #}
<li class="ap-o-header-flyout-primary-item">

{# AFTER #}
<li class="ap-o-header-flyout-primary-item" role="none">
  <a ... role="menuitem">
```

#### 1.4 Add Footer Navigation Labels

**File**: `frontend/templates/views/partials/footer.j2`
**Line**: 36

```jinja2
{# BEFORE #}
<div class="ap-o-footer-nav">

{# AFTER #}
<nav class="ap-o-footer-nav" aria-label="{{ _('Footer navigation') }}">
  ...
</nav>
```

**Lines**: 15-32 (social links - add aria-label in addition to title):
```jinja2
{# BEFORE #}
<a class="ap-a-ico ap-o-footer-follow-icon" href="{{ podspec.social.twitter_url }}" rel="noopener" title="Twitter">

{# AFTER #}
<a class="ap-a-ico ap-o-footer-follow-icon" href="{{ podspec.social.twitter_url }}" rel="noopener" title="Twitter" aria-label="Twitter">
```

### Phase 2: MEDIUM Priority (Interactive Components)

#### 2.1 Fix Sidebar Navigation

**File**: `frontend/templates/views/partials/sidebar.j2`
**Line**: 46-52

```jinja2
{# BEFORE #}
<amp-sidebar id="sidebar-left"
  class="ap--ampsidebar"
  layout="nodisplay"
  side="left">
  <nav class="ap--ampsidebar-toolbar"

{# AFTER #}
<amp-sidebar id="sidebar-left"
  class="ap--ampsidebar"
  layout="nodisplay"
  side="left"
  role="complementary"
  aria-label="{{ _('Documentation sidebar') }}">
  <nav class="ap--ampsidebar-toolbar"
       aria-label="{{ _('Documentation navigation') }}"
```

#### 2.2 Fix Sidebar Toggle

**File**: `frontend/templates/views/partials/sidebar-toggle-button.j2`

```jinja2
{# BEFORE #}
role="categoriemenutrigger"

{# AFTER #}
role="button"
aria-expanded="false"
aria-controls="sidebar-left"
aria-label="{{ _('Toggle sidebar') }}"
```

#### 2.3 Fix Accordion Pattern

**File**: `frontend/templates/views/partials/accordion.j2`

Add to accordion headers:
```jinja2
role="button"
aria-expanded="false"
aria-controls="accordion-panel-{{ id }}"
```

Add to accordion panels:
```jinja2
id="accordion-panel-{{ id }}"
role="region"
aria-labelledby="accordion-header-{{ id }}"
```

#### 2.4 Fix TOC Toggle

**File**: `frontend/templates/views/partials/toc.j2`
**Line**: 11

```jinja2
{# BEFORE #}
role="contentmenutrigger"

{# AFTER #}
role="button"
aria-expanded="false"
aria-controls="toc-content"
aria-label="{{ _('Table of contents') }}"
```

### Phase 3: LOW Priority (Enhancements)

#### 3.1 Add Skip Link

**File**: `frontend/templates/layouts/default.j2`
**Add after opening `<body>` tag**:

```jinja2
<a href="#main-content" class="skip-link">{{ _('Skip to main content') }}</a>
```

#### 3.2 Mark Decorative Icons

Throughout templates, add `aria-hidden="true"` to decorative SVG icons:

```jinja2
{# Decorative icons that repeat text #}
<svg aria-hidden="true"><use xlink:href="#internal"></use></svg>

{# Icons that convey meaning need aria-label #}
<svg role="img" aria-label="{{ _('External link') }}"><use xlink:href="#external"></use></svg>
```

---

## 5. Template Change Summary

### Files to Modify

| File | Changes | Priority |
|------|---------|----------|
| `layouts/default.j2` | Add `<main>`, skip link | HIGH |
| `partials/header.j2` | Nav labels, flyout ARIA, icon hiding | HIGH |
| `partials/search.j2` | Search role, close label, live region | HIGH |
| `partials/footer.j2` | Nav wrapper, social link labels | HIGH |
| `partials/sidebar.j2` | Complementary role, nav label | MEDIUM |
| `partials/sidebar-toggle-button.j2` | Fix invalid roles | MEDIUM |
| `partials/toc.j2` | Fix invalid role, add ARIA | MEDIUM |
| `partials/accordion.j2` | Accordion pattern ARIA | MEDIUM |
| `partials/burger-menu.j2` | Already good, minor improvements | LOW |

### Line-by-Line Changes

| File | Line | Current | Change To |
|------|------|---------|-----------|
| default.j2 | 115 | `{% block main %}` | Wrap in `<main role="main">` |
| header.j2 | 16 | `<nav class=...>` | Add `aria-label` |
| header.j2 | 34 | `<button class=...>` | Add `aria-expanded`, `aria-haspopup` |
| header.j2 | 41 | `<ul class=...>` | Add `role="menu"` |
| search.j2 | 33 | `<div class=...>` | Add `role="search"` |
| search.j2 | 24 | `<div class=... role="button">` | Add `aria-label` |
| search.j2 | 62 | `<div class=...>` | Add `aria-live="polite"` |
| footer.j2 | 36 | `<div class=...>` | Change to `<nav>` with `aria-label` |
| sidebar.j2 | 46 | `<amp-sidebar>` | Add `role="complementary"` |
| sidebar-toggle-button.j2 | 7 | `role="categoriemenutrigger"` | `role="button"` + ARIA |
| toc.j2 | 11 | `role="contentmenutrigger"` | `role="button"` + ARIA |

---

## 6. Implementation Order

1. **Week 1: Core Landmarks**
   - Add `<main>` element to default.j2
   - Add `role="search"` to search.j2
   - Add navigation labels to header.j2

2. **Week 2: Interactive Elements**
   - Add `aria-expanded` to flyout buttons
   - Add `role="menu"` to flyout menus
   - Fix invalid custom roles

3. **Week 3: Live Regions & Focus**
   - Add `aria-live` to search results
   - Add skip link
   - Review focus management

4. **Week 4: Testing & Refinement**
   - Test with screen readers (NVDA, VoiceOver)
   - Validate with axe-core
   - Fix any issues found

---

## 7. Testing Checklist

### Automated Testing

- [ ] Run axe-core on key pages
- [ ] Run WAVE accessibility checker
- [ ] Validate with Lighthouse accessibility audit
- [ ] Check for invalid ARIA roles

### Manual Testing

- [ ] Navigate with keyboard only (Tab, Enter, Escape)
- [ ] Test with NVDA/VoiceOver screen reader
- [ ] Verify focus is visible at all times
- [ ] Confirm all interactive elements are reachable
- [ ] Test search with screen reader
- [ ] Test navigation flyouts with screen reader
- [ ] Test mobile menu with screen reader

---

## Status

- [x] Template inventory complete
- [x] Current ARIA state documented
- [x] Gap analysis complete
- [x] Priority list defined
- [x] Implementation order defined
- [ ] Implementation pending user approval
