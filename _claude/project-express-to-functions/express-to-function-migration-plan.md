## Final Plan: Express.js → Netlify Functions Migration

### Prerequisites

- GPSE credentials configured in Netlify ✅
- Google Workspace with Sheets access
- Draft Contact Us page exists (Jinja/SCSS)

---

## Phase 1: Fix GPSE Integration (Priority)

**Objective:** Make site search work

**Root cause:** Client `action-xhr` targets Express endpoint; Netlify serves Functions

**Tasks:**

1. Add redirect to `netlify.toml`:
```toml
[[redirects]]
  from = "/search/do"
  to = "/.netlify/functions/search_do"
  status = 200

[[redirects]]
  from = "/search/autosuggest"
  to = "/.netlify/functions/search_autosuggest"
  status = 200
```

2. Verify Function request/response format matches client expectations

3. Test search functionality

**Files:**
```
netlify.toml
netlify/functions/search_do/
netlify/functions/search_autosuggest/
```

**Success criteria:** Search returns GPSE results on amp-new.netlify.app

---

## Phase 2: Autosuggest Hybrid Example

**Objective:** One example using Functions routing with static JSON

**Approach:**
1. You identify the Express example using static JSON
2. CC creates duplicate with Functions routing
3. Both use identical JSON data source
4. Documents both approaches

**Awaiting:** Your identification of source example

---

## Phase 3: Star Rating → Google Sheets

**Objective:** Capture ratings to Google Sheets

**Architecture:**
```
User clicks star → Function receives POST → Google Sheets API → Row added
```

**Data schema:**
| Timestamp | Page URL | Rating | Session ID |
|-----------|----------|--------|------------|
| 2025-12-22T10:30:00Z | /documentation/components/ | 4 | abc123 |

**Files to modify:**
```
netlify/functions/examples_interactivity_dynamic_content_star_rating/
```

**New dependencies:**
- `googleapis` npm package
- Google Sheets API credentials (service account)

**Setup required:**
1. Create Google Sheet in Workspace
2. Create service account with Sheets API access
3. Share Sheet with service account email
4. Add credentials to Netlify environment variables

**Success criteria:** Star rating submissions appear in Google Sheet

---

## Phase 4: Contact Us Form → Google Sheets

**Objective:** Multi-language form capturing to Google Sheets

**Architecture:**
```
User fills form (in NL) → Function receives POST → Google Sheets API → Row added
                        → Return confirmation (in same NL)
```

**Data schema:**
| Timestamp | Locale | Name | Email | Message | Source Page |
|-----------|--------|------|-------|---------|-------------|
| 2025-12-22T10:30:00Z | ar | أحمد | a@b.com | مرحبا | /ar/contact/ |

**Files:**
```
# New page
pages/content/amp-dev/contact/index.md
pages/content/amp-dev/contact/index@ar.md
pages/content/amp-dev/contact/index@de.md
# etc. for each locale

# Function
netlify/functions/contact_form_submit/

# Templates
frontend/templates/views/contact.j2

# Styles
frontend/scss/components/contact.scss

# Menu (Portable Object)
pages/translations/*.po
```

**Form fields:**
- Name (text)
- Email (email)
- Message (textarea)
- Hidden: locale, source URL

**Success criteria:** 
- Form renders in each NL
- Submissions appear in Google Sheet with correct locale

---

## Phase 5: Routing Configuration (All Functions)

**Objective:** Complete netlify.toml with all Function routes

```toml
# Search
[[redirects]]
  from = "/search/do"
  to = "/.netlify/functions/search_do"
  status = 200

[[redirects]]
  from = "/search/autosuggest"
  to = "/.netlify/functions/search_autosuggest"
  status = 200

# Contact Form
[[redirects]]
  from = "/contact/submit"
  to = "/.netlify/functions/contact_form_submit"
  status = 200

# Star Rating
[[redirects]]
  from = "/api/star-rating"
  to = "/.netlify/functions/examples_interactivity_dynamic_content_star_rating"
  status = 200

# Form examples (existing)
[[redirects]]
  from = "/documentation/examples/api/submit-form"
  to = "/.netlify/functions/examples_api_amp-form_submit_form"
  status = 200
```

---

## CC Investigation Tasks (Run First)

```bash
# 1. Find all action-xhr targets
grep -r "action-xhr" pages/ examples/ frontend/ --include="*.html" --include="*.j2"

# 2. List existing Functions
ls -la netlify/functions/

# 3. Check current redirects
cat netlify.toml
cat netlify/configs/amp.dev/netlify.toml

# 4. Find search-related files
grep -r "googleSearch\|search/do\|autosuggest" platform/ frontend/ pages/

# 5. Locate Contact Us draft
find . -name "*contact*" -type f
```

---

## Google Sheets Setup Instructions

1. **Create Sheet:** "AMP Site Data" with tabs: "Star Ratings", "Contact Submissions"

2. **Service Account:**
   - Google Cloud Console → Create service account
   - Enable Sheets API
   - Create JSON key
   - Share Sheet with service account email (Editor)

3. **Netlify Environment Variables:**
   ```
   GOOGLE_SHEETS_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
   GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
   GOOGLE_SHEETS_SPREADSHEET_ID=1abc...xyz
   ```

---

## Execution Order

1. **Phase 1:** GPSE fix (unblocks search)
2. **Phase 3:** Star Rating → Sheets (simpler, validates Sheets integration)
3. **Phase 4:** Contact Us → Sheets (builds on Phase 3 patterns)
4. **Phase 2:** Autosuggest example (after you identify source)
5. **Phase 5:** Complete routing (consolidate all redirects)

