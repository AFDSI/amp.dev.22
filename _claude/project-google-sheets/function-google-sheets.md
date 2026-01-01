## Final Plan: Express.js → Netlify Functions Migration

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
