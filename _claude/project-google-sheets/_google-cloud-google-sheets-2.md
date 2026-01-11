This is a classic "Router" pattern. You need a centralized "Traffic Controller" script that receives the form data, looks at the language tag, and directs the data to the correct destination.

Since you are supporting 14 languages, hard-coding logic (if/else statements) will get messy. The best way to configure this environment is to separate your **Configuration (The Map)** from your **Logic (The Code)**.

Here is the architecture  showing how a form submission with a language code is processed by a router script which looks up the destination ID and sends data to the corresponding Google Sheet.

### Step 1: The "Map" (Configuration)

Create a file named `sheets-map.json` in your project folder. This acts as your switchboard. It maps the language codes (from your website) to the specific Google Sheet IDs.

*Note: You can use different Spreadsheets entirely, or the same Spreadsheet with different Tab IDs (gid), but using different Spreadsheets is usually cleaner for permissions.*

**`sheets-map.json`**

```json
{
  "default": "SPREADSHEET_ID_FOR_FALLBACK_OR_ENGLISH",
  "en": "SPREADSHEET_ID_FOR_ENGLISH",
  "es": "SPREADSHEET_ID_FOR_SPANISH",
  "fr": "SPREADSHEET_ID_FOR_FRENCH",
  "de": "SPREADSHEET_ID_FOR_GERMAN",
  "ja": "SPREADSHEET_ID_FOR_JAPANESE"
  // ... add all 14 languages here
}

```

### Step 2: The "Traffic Controller" (Node.js Script)

We will modify the previous script to read the incoming language code and dynamically select the destination.

**`submit-form.js`**

```javascript
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import fs from 'fs';

// 1. Load Configurations
const creds = JSON.parse(fs.readFileSync('./sheets-keys.json', 'utf8'));
const sheetMap = JSON.parse(fs.readFileSync('./sheets-map.json', 'utf8'));

// 2. Setup Auth (Reusable for all sheets)
const serviceAccountAuth = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function handleFormSubmission(formData) {
  // Extract language, default to 'default' if missing/invalid
  const lang = formData.language || 'default';
  
  // LOOKUP: Get the correct ID from your map
  const targetSheetID = sheetMap[lang] || sheetMap['default'];

  console.log(`Email received in [${lang}]. Routing to Sheet ID: ${targetSheetID}...`);

  try {
    // 3. Connect to the SPECIFIC Sheet
    const doc = new GoogleSpreadsheet(targetSheetID, serviceAccountAuth);
    await doc.loadInfo();

    // Assume we write to the first tab of that sheet
    const sheet = doc.sheetsByIndex[0]; 

    // 4. Write the Data
    await sheet.addRow({
      Timestamp: new Date().toISOString(),
      Language: lang,
      Name: formData.name,
      Email: formData.email,
      Message: formData.message
    });

    console.log(`✅ Success! Data written to the ${doc.title} spreadsheet.`);

  } catch (error) {
    console.error(`❌ Error writing to ${lang} sheet:`, error.message);
    // Optional: Fallback logic here (e.g., write to a local log file if Google fails)
  }
}

// --- MOCK TEST (Simulating a POST request from your website) ---
const incomingRequest = {
  language: 'es', // <--- This determines the destination
  name: "Maria Garcia",
  email: "maria@example.com",
  message: "Hola, necesito ayuda con mi cuenta."
};

handleFormSubmission(incomingRequest);

```

### Step 3: Configure the Frontend

This is the most critical non-technical step. Your HTML form **must** send the language code. The user shouldn't have to type this; your site code should inject it automatically.

**In your HTML Form:**
Include a hidden input field that populates based on the current page's language setting.

```html
<form action="/submit-contact" method="POST">
  <input type="text" name="name" placeholder="Name">
  <input type="email" name="email" placeholder="Email">
  
  <input type="hidden" name="language" value="es">
  
  <button type="submit">Send</button>
</form>

```

### Important: Permissions

You must perform the "Share" step 14 times.

1. Open the **English Sheet** -> Share with `sheets-writer@...`
2. Open the **Spanish Sheet** -> Share with `sheets-writer@...`
3. Repeat for all 14 sheets.

(The Service Account email remains the same for all of them; you are just giving that one robot keys to 14 different rooms).
