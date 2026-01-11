
### Step 1: Set Environment Variables on Netlify

Storing the private key is the most error-prone step.
Netlify environment variables do not handle newlines (`\n`) automatically if pasted as raw text.

**Recommended Correction:**
Instead of pasting the multi-line key, **Base64 encode** your entire `sheets-keys.json` file.
This prevents formatting issues and makes it a single-line string.

1. **On your local machine, encode the file:**
```bash
base64 -i sheets-keys.json | pbcopy  # macOS
# OR
base64 -w 0 sheets-keys.json         # Linux

```

2. **In Netlify UI (Project Settings > Environment Variables), add:**

| Variable | Value |
| --- | --- |
| `GOOGLE_SHEETS_CREDS_BASE64` | `[PASTE_THE_BASE64_STRING_HERE]` |


### Step 2: Create the "Robot" - GCloud Service Account

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

* **Get the "Keys"** (The Password)

Now you need the credentials that your code will use to prove it is this robot.

```bash
# C. Create and Download the Key
# This saves 'sheets-keys.json' in your current folder
gcloud iam service-accounts keys create sheets-keys.json \
    --iam-account=$SA_EMAIL
```

Ensure you have also enabled the **Google Sheets API** and **Google Drive API** in your Google Cloud Project.

```bash
# Enable the required APIs
gcloud services enable sheets.googleapis.com drive.googleapis.com
```

### Step 3: Automated Provisioning

Your provisioning script automatically handles the "Robot needs to share with You" logic.

**Updated `provision-sheets.js`:**

```javascript
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import fs from 'fs';

const YOUR_PERSONAL_EMAIL = "gig.graham@dailyfood.io"; // Remove @gmail.com if it's a Workspace account
const LANGUAGES = ['en', 'de', 'fr', 'ar', 'es', 'it', 'id', 'ja', 'ko', 'pt', 'ru', 'tr', 'zh', 'pl', 'vi'];

const creds = JSON.parse(fs.readFileSync('./sheets-keys.json', 'utf8'));

const auth = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file'
  ],
});

async function provision() {
  const mapping = {};
  for (const lang of LANGUAGES) {
    try {
      const doc = await GoogleSpreadsheet.createNewSpreadsheetDocument(auth, { 
        title: `Contact Form [${lang.toUpperCase()}]` 
      });

      // Share with your personal email so you can see it in Drive
      await doc.share(YOUR_PERSONAL_EMAIL, { role: 'writer' });

      const sheet = doc.sheetsByIndex[0];
      // Set headers matching your form names
      await sheet.setHeaderRow(['Timestamp', 'Language', 'Name', 'Email', 'Message']);
      
      mapping[lang] = doc.spreadsheetId;
      console.log(`✅ ${lang}: ${doc.spreadsheetId}`);
    } catch (err) {
      console.error(`❌ ${lang} failed: ${err.message}`);
    }
  }
  fs.writeFileSync('sheets-map.json', JSON.stringify(mapping, null, 2));
}
provision();

```

### Step 4: Configure the Frontend

Ensure the form's `language` field is dynamically set by your Jinja2 templates using the language code from your web page.

**In your HTML (via Jinja2):**

```html
<form action="/.netlify/functions/submit-contact" method="POST">
  <input type="hidden" name="language" value="{{ current_language_code }}">
</form>
```

### Step 5: The Netlify Function (The "Traffic Controller")

Since you are using Base64 encoding for security, your Netlify function must decode the credentials at runtime.

**`netlify/functions/submit-contact.js`**

```javascript
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import sheetMap from '../../sheets-map.json' assert { type: 'json' };

export const handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  // 1. Decode Credentials from Environment Variable
  const creds = JSON.parse(Buffer.from(process.env.GOOGLE_SHEETS_CREDS_BASE64, 'base64').toString());

  // 2. Setup Auth
  const auth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const formData = JSON.parse(event.body);
  const lang = formData.language || 'en';
  const targetId = sheetMap[lang] || sheetMap['en'];

  try {
    const doc = new GoogleSpreadsheet(targetId, auth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    await sheet.addRow({
      Timestamp: new Date().toLocaleString("en-US", { timeZone: "UTC" }),
      Language: lang,
      Name: formData.name,
      Email: formData.email,
      Message: formData.message
    });

    return { statusCode: 200, body: JSON.stringify({ message: "Success" }) };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};

```

### Final Operational Checks

* **Manual Sharing is now optional:**
Because the `provision-sheets.js` script creates the sheets *as the Robot* and then shares them with you, you do not need to manually share each sheet 14 times.
