
### Step 1: Set Environment Variables on Netlify

**UNCERTAIN**

- Netlify Environment Variables:

| Variable | Value |
|----------|-------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `xxx@project.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | (from JSON, the `private_key` field) |
| `GOOGLE_SHEETS_CONTACT_US_EN_ID` | Sheet ID from URL |


- Netlify Environment Variables:
```
GOOGLE_SHEETS_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
GOOGLE_SHEETS_SPREADSHEET_ID=1abc...xyz
```

### Step 2: Create the "Robot" (Service Account)

**Service account details:**
* **Name:** Give it a clear name - `contact-form-writer`.
* **ID:** It will auto-generate (e.g., `contact-form-writer@amp-2-....iam.gserviceaccount.com`).

```bash
# A. Create the Service Account
gcloud iam service-accounts create contact-form-bot \
    --display-name="contact-form-writer"

# B. Get the full email address (We need this for the script)
SA_EMAIL=$(gcloud iam service-accounts list \
    --filter="displayName:contact-form-writer" \
    --format="value(email)")
echo "🤖 Robot Email: $SA_EMAIL"
```

### Step 3: Get the "Keys" (The Password)

Now you need the credentials that your code will use to prove it is this robot.

```bash
# A. Create and Download the Key
# This saves 'sheets-keys.json' in your current folder
gcloud iam service-accounts keys create sheets-keys.json \
    --iam-account=$SA_EMAIL
```

### Step 4: The "Map" (Configuration)

Create a file named `sheets-map.json` in your project folder.
This acts as your switchboard.
It maps the language codes (from your website) to the specific Google Sheet IDs.

**`sheets-map.json`**

```json
{
  "default": "SPREADSHEET_ID_FOR_FALLBACK_OR_ENGLISH",
  "en": "SPREADSHEET_ID_FOR_ENGLISH",
  "de": "SPREADSHEET_ID_FOR_GERMAN",
  "fr": "SPREADSHEET_ID_FOR_FRENCH",
  "ar": "SPREADSHEET_ID_FOR_ARABIC",
  "es": "SPREADSHEET_ID_FOR_SPANISH",
  "it": "SPREADSHEET_ID_FOR_ITALIN",
  "id": "SPREADSHEET_ID_FOR_INDONESIA",
  "ja": "SPREADSHEET_ID_FOR_JAPANESE",
  "ko": "SPREADSHEET_ID_FOR_KOREAN",
  "pt": "SPREADSHEET_ID_FOR_PORTUGUESE",
  "ru": "SPREADSHEET_ID_FOR_RUSSIAN",
  "tr": "SPREADSHEET_ID_FOR_TURKISH",
  "zh": "SPREADSHEET_ID_FOR_CHINESE",
  "pl": "SPREADSHEET_ID_FOR_POLISH",
  "vi": "SPREADSHEET_ID_FOR_VIETNAMESE"
}
```

### Step 5: The Sheets (Use Node.js)

Since `gcloud` cannot create spreadsheets, we will write a quick "Setup Script" using installed libraries.

This script will:

1. Log in as the Robot.
2. Loop through your 14 languages.
3. **Create** a new Google Sheet for each language.
4. **Share** that sheet with **YOU** (your personal email) so you can see it.
5. **Generate** the `sheets-map.json` file automatically.

**Step A: Create the Setup Script**

Create a file named `provision-sheets.js` and paste this code:

```javascript
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import fs from 'fs';

// --- CONFIGURATION ---
const YOUR_PERSONAL_EMAIL = "gig.graham@dailyfood.io@gmail.com";
const LANGUAGES = ['en', 'de', 'fr', 'ar', 'es', 'it', 'id', 'ja', 'ko', 'pt', 'ru', 'tr', 'zh', 'pl', 'vi'];
// ---------------------

const creds = JSON.parse(fs.readFileSync('./sheets-keys.json', 'utf8'));

const serviceAccountAuth = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file' // Needed to create/share files
  ],
});

async function provision() {
  console.log("🚀 Starting Bulk Sheet Provisioning...");
  const mapping = {};

  for (const lang of LANGUAGES) {
    process.stdout.write(`   Processing [${lang}]... `);

    try {
      // 1. Create the Sheet (The Robot owns it)
      const doc = await GoogleSpreadsheet.createNewSpreadsheetDocument(
        serviceAccountAuth,
        { title: `contact-form-data - [${lang.toUpperCase()}]` }
      );

      // 2. Share it with YOU (So you can see it in Drive)
      await doc.share(gig.graham@dailyfood.io, { role: 'writer' });

      // 3. Add headers
      const sheet = doc.sheetsByIndex[0];
      await sheet.setHeaderRow(['Date', 'Name', 'Email', 'Message']);

      // 4. Save ID to map
      mapping[lang] = doc.spreadsheetId;
      console.log(`✅ Created: ${doc.spreadsheetId}`);

    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }
  }

  // 5. Save the Map File
  fs.writeFileSync('sheets-map.json', JSON.stringify(mapping, null, 2));
  
  console.log("\n------------------------------------------------");
  console.log("🎉 DONE! 'sheets-map.json' has been generated.");
  console.log("📂 Check your Google Drive 'Shared with me' folder.");
}

provision();

```

**Step B: Run it**

1. Open the file and **edit line 6** to put in your actual email address.
2. Run:

```bash
node provision-sheets.js

```

**Step C: Result**

After running `provision-sheets.js`, you will have:

1. **14 New Spreadsheets** in your Google Drive (created by the bot, shared with you).
2. A file named **`sheets-map.json`** on your disk, fully populated with the correct IDs.

You can now immediately deploy your Netlify function because you have the **Keys** (`sheets-keys.json`) and the **Map** (`sheets-map.json`) ready to go.


### Step 6: Configure the Frontend

This is the most critical non-technical step.
Your HTML form **must** send the language code.
The user shouldn't have to type this; your site code should inject it automatically.

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

### Step 7: Share the Sheet

Your Service Account is a user, but it has **zero access** to your spreadsheet by default.

1. Open your `.json` key file (or look in the Cloud Console).
Copy the **`client_email`** address.
* It looks like: `contact-form-writer@amp-2-1704405298450.iam.gserviceaccount.com`

2. Open your target **Google Sheet** in your browser.
3. Click the big **Share** button (top right).
4. Paste the **Service Account email** into the box.
5. Make sure the permission is set to **Editor**.
6. Uncheck "Notify people" (robots don't read email).
7. Click **Share**.

You must perform the "Share" step 14 times.

1. Open the **English Sheet** -> Share with `contact-form-writer@...`
2. Open the **Spanish Sheet** -> Share with `contact-form-writer@...`
3. Repeat for all 14 sheets.

(The Service Account email remains the same for all of them; you are just giving that one robot keys to 14 different rooms).


### Step 8: How to Use It

Since you are using Node.js v22, I recommend the library `google-spreadsheet`.
It is much easier than the raw Google API.

**1. Install Dependencies:**

```bash
npm install google-spreadsheet google-auth-library

```

**2. The "Traffic Controller" (Node.js Script)

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
