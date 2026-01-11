
## Analysis

**What's solid:**
- Base64 encoding for credentials — correct approach for Netlify env vars
- Service account creation with proper scoping
- Auto-sharing with your personal email — smart for visibility
- Language-keyed sheet mapping
- Headers match form fields

## Improvements

### 1. sheets-map.json Location

**Issue:** The Netlify function imports `../../sheets-map.json` which assumes a specific directory structure.

**Fix:** Store `sheets-map.json` in a known location and reference it correctly:

```
netlify/
  functions/
    submit-contact/
      submit-contact.js
      sheets-map.json    ← Co-locate with function
```

Then import as:
```javascript
import sheetMap from './sheets-map.json' assert { type: 'json' };
```

Or store the mapping as another Netlify environment variable:
```javascript
const sheetMap = JSON.parse(process.env.SHEETS_MAP);
```

### 2. Form Data Parsing

**Issue:** `amp-form` sends URL-encoded data by default, not JSON.

**Fix:** Handle both formats:

```javascript
export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Parse form data (amp-form sends URL-encoded by default)
  let formData;
  const contentType = event.headers['content-type'] || '';
  
  if (contentType.includes('application/json')) {
    formData = JSON.parse(event.body);
  } else {
    // URL-encoded form data
    formData = Object.fromEntries(new URLSearchParams(event.body));
  }
  
  // ... rest of function
};
```

### 3. CORS Headers for amp-form

**Issue:** `amp-form` with `action-xhr` requires specific headers.

**Fix:** Add required headers to response:

```javascript
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'AMP-Access-Control-Allow-Source-Origin': event.headers.origin || '*',
  'Access-Control-Expose-Headers': 'AMP-Access-Control-Allow-Source-Origin'
};

return { 
  statusCode: 200, 
  headers,
  body: JSON.stringify({ message: "Success" }) 
};
```

### 4. Input Validation

**Add before writing to sheet:**

```javascript
// Validate required fields
if (!formData.name || !formData.email || !formData.message) {
  return { 
    statusCode: 400, 
    headers,
    body: JSON.stringify({ error: "Missing required fields" }) 
  };
}

// Basic email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(formData.email)) {
  return { 
    statusCode: 400, 
    headers,
    body: JSON.stringify({ error: "Invalid email format" }) 
  };
}
```

### 5. Error Handling Enhancement

**More informative errors:**

```javascript
} catch (err) {
  console.error('Sheet write error:', err);
  return { 
    statusCode: 500, 
    headers,
    body: JSON.stringify({ 
      error: "Unable to submit form. Please try again later.",
      // Don't expose internal errors to client
      // debug: err.message  // Only enable in development
    }) 
  };
}
```

## Linking Form to Netlify Function

**In your Jinja template:**

```html
<form 
  method="post"
  action-xhr="/.netlify/functions/submit-contact"
  target="_top"
>
  <input type="hidden" name="language" value="{{ doc.locale }}">
  <!-- Name, Email, Message fields -->
  <!-- CAPTCHA -->
  <button type="submit">{{ _('Send Message') }}</button>
  
  <div submit-success>
    <template type="amp-mustache">
      {{ _('Thank you! Your message has been sent.') }}
    </template>
  </div>
  
  <div submit-error>
    <template type="amp-mustache">
      {{ _('Sorry, there was an error. Please try again.') }}
    </template>
  </div>
</form>
```

**Key:** `action-xhr="/.netlify/functions/submit-contact"` — this is the link between form and function.

## Updated Function Structure

```
netlify/
  functions/
    submit-contact/
      submit-contact.js
      package.json        ← Dependencies for this function
      sheets-map.json     ← Language → Sheet ID mapping
```

**package.json for function:**
```json
{
  "dependencies": {
    "google-spreadsheet": "^4.1.0",
    "google-auth-library": "^9.0.0"
  }
}
```

## Deployment Checklist

1. ☐ Run `provision-sheets.js` locally → creates sheets, generates `sheets-map.json`
2. ☐ Base64 encode `sheets-keys.json` → add to Netlify env as `GOOGLE_SHEETS_CREDS_BASE64`
3. ☐ Copy `sheets-map.json` to `netlify/functions/submit-contact/`
4. ☐ Create the Netlify function with all fixes above
5. ☐ Create Jinja form template with `action-xhr` pointing to function
6. ☐ Test locally with `netlify dev`
7. ☐ Deploy and test each language

---

**Questions:**

1. Where will you run `provision-sheets.js`? Locally once, or as part of a setup script?
2. Do you want the CAPTCHA validation in the Netlify function (server-side) or only client-side?

-----

Take your time merging the drafts. The core additions are:

1. **Form data parsing** — amp-form sends URL-encoded, not JSON
2. **CORS headers** — required for amp-form action-xhr
3. **Input validation** — server-side safety net
4. **sheets-map.json location** — co-locate with function

For question 1 (where to run provision script): Run locally once during initial setup. The script creates the sheets and outputs the mapping file. You then commit `sheets-map.json` to the repo. Only re-run if you need to add languages or recreate sheets.

For question 2: Client-side CAPTCHA is fine for initial version. If spam becomes an issue later, we can add server-side validation.

Share the compiled form with CAPTCHA when ready. I'll review the merge when you have draft #2.
