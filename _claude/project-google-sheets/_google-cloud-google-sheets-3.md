The answer is **Yes, for about 50% of the work.**

You have hit a specific boundary in the Google ecosystem:

* **`gcloud` (The CLI)** controls **Infrastructure** (APIs, Service Accounts, Keys, Servers).
* **`gcloud` cannot** control **User Documents** (Creating Spreadsheets, formatting cells, sharing files).

You can automate the **Identity** setup (creating the bot) using `gcloud`, but you must use a **Node.js script** to automate the **Sheet creation** (the repetitive part).

Here is your "Zero-Click" automation strategy to set up all 14 languages at once.

---

### Part 1: The Infrastructure (Use `gcloud`)

Run these 3 commands in your terminal. This creates the robot and gives you the key.

```bash
# 1. Create the Service Account
gcloud iam service-accounts create contact-form-bot \
    --display-name="Contact Form Writer"

# 2. Get the full email address (We need this for the script)
SA_EMAIL=$(gcloud iam service-accounts list \
    --filter="displayName:Contact Form Writer" \
    --format="value(email)")
echo "🤖 Robot Email: $SA_EMAIL"

# 3. Create and Download the Key
# This saves 'sheets-keys.json' in your current folder
gcloud iam service-accounts keys create sheets-keys.json \
    --iam-account=$SA_EMAIL

```

---

### Part 2: The Sheets (Use Node.js)

Since `gcloud` cannot create spreadsheets, we will write a quick "Setup Script" using the libraries you already installed.

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
const YOUR_PERSONAL_EMAIL = "YOUR_REAL_GMAIL_HERE@gmail.com"; // <--- CHANGE THIS
const LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh', 'ru', 'ar', 'hi', 'bn', 'pa', 'jv'];
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
        { title: `Contact Form Data - [${lang.toUpperCase()}]` }
      );

      // 2. Share it with YOU (So you can see it in Drive)
      await doc.share(YOUR_PERSONAL_EMAIL, { role: 'writer' });

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



### The Result

After running that script, you will have:

1. **14 New Spreadsheets** in your Google Drive (created by the bot, shared with you).
2. A file named **`sheets-map.json`** on your disk, fully populated with the correct IDs.

You can now immediately deploy your Netlify function because you have the **Keys** (`sheets-keys.json`) and the **Map** (`sheets-map.json`) ready to go.