Good. While you look that up, here's what we'll need:

**Google Cloud Console Checklist:**

| Step | Action | Where |
|------|--------|-------|
| 1 | Enable Google Sheets API | APIs & Services → Library |
| 2 | Create Service Account | IAM & Admin → Service Accounts |
| 3 | Generate JSON key | Service Account → Keys → Add Key |
| 4 | Note the service account email | `something@project-id.iam.gserviceaccount.com` |

**Google Sheets Setup:**

| Sheet | Purpose | Share With |
|-------|---------|------------|
| `amp-dev-star-rating` | Page ratings | Service account email |
| `amp-dev-survey-en` | English surveys | Service account email |
| `amp-dev-contact-us-en` | English contact forms | Service account email |

**Netlify Environment Variables:**

| Variable | Value |
|----------|-------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `xxx@project.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | (from JSON, the `private_key` field) |
| `GOOGLE_SHEETS_STAR_RATING_ID` | Sheet ID from URL |
| `GOOGLE_SHEETS_SURVEY_EN_ID` | Sheet ID from URL |
| `GOOGLE_SHEETS_CONTACT_US_EN_ID` | Sheet ID from URL |

Take your time gathering the Google Cloud info. We can create the sheets and wire everything up once you have the service account ready.