# amp.dev Portability & Reusability Project Specification
## Analysis & Recommendations

**Date:** November 15, 2025  
**Objective:** Transform amp.dev into a portable, reusable platform for multi-site deployment

---

## 📊 EXECUTIVE SUMMARY

### Current State
- Google-specific amp.dev configuration with hardcoded values
- Single-site deployment model (amp.dev only)
- App Engine and GCP-specific infrastructure
- Incomplete documentation for GitHub + Netlify workflow

### Target State
- Multi-site platform supporting 6+ independent deployments
- Netlify-based hosting with site-specific configurations
- Generalized workflows supporting multiple domains
- Complete end-to-end deployment documentation

### Gap Analysis
**CRITICAL GAPS IDENTIFIED:**
1. No configuration abstraction layer
2. Missing site-specific credential management
3. Incomplete Netlify integration patterns
4. Undefined multi-site deployment strategy
5. No template system for new site creation
6. Missing Google Services integration guide
7. Incomplete documentation workflow

---

## 🎯 STRATEGIC ARCHITECTURE

### Multi-Site Configuration Model

**Proposed Structure:**
```
config/
├── sites/
│   ├── site-template.json          # Master template
│   ├── amp.dev.20.json             # Site 1 config
│   ├── benetta.io.json             # Site 2 config
│   └── [site-3 through site-6].json
├── environments/
│   ├── development.json            # Shared dev config
│   ├── local.json                  # Shared local config
│   ├── staging.json                # Shared staging config
│   └── production.json             # Shared production config
└── credentials/
    ├── .env.template               # Template for all secrets
    ├── .env.amp-dev-20             # Site 1 secrets
    ├── .env.benetta-io             # Site 2 secrets
    └── [additional site envs]
```

### Configuration Hierarchy
```
[Site Config] + [Environment Config] + [Credentials] = [Runtime Config]
```

---

## 🔴 CRITICAL MISSING INFORMATION

### 1. Site Configuration Schema

**Current:** Google-specific hostnames hardcoded  
**Needed:** Complete site configuration schema

```json
{
  "site": {
    "id": "amp-dev-20",
    "name": "AMP Development Site",
    "domain": {
      "primary": "lighthearted-genie.netlify.app",
      "custom": null,  // Future: "amp20.example.com"
      "production": null  // Future: "amp.dev"
    },
    "netlify": {
      "site_id": "NETLIFY_SITE_ID",
      "deploy_token_var": "NETLIFY_DEPLOY_TOKEN_AMP20"
    },
    "github": {
      "org": "AFDSI",
      "repo": "amp.dev.20",
      "default_branch": "main"
    }
  },
  "services": {
    "google_programmable_search": {
      "api_key_var": "GOOGLE_PSE_API_KEY_AMP20",
      "cse_id_var": "GOOGLE_PSE_CSE_ID_AMP20",
      "enabled": true
    },
    "google_analytics": {
      "tracking_id_var": "GA_TRACKING_ID_AMP20",
      "enabled": false  // Until production
    },
    "google_site_verification": {
      "verification_id_var": "GOOGLE_SITE_VERIFICATION_AMP20",
      "enabled": false  // Until production
    },
    "google_knowledge_graph": {
      "api_key_var": "GOOGLE_KG_API_KEY_AMP20",
      "enabled": false  // Optional feature
    },
    "google_maps": {
      "api_key_var": "GOOGLE_MAPS_API_KEY_AMP20",
      "enabled": false  // Optional feature
    }
  },
  "features": {
    "playground": true,
    "preview": true,
    "pixi": true,
    "packager": false,  // Complex, not needed initially
    "thumbor": false,   // Complex, not needed initially
    "redis": false      // Not needed for Netlify
  },
  "locales": {
    "default": "en",
    "supported": ["en"]  // Start with English only
  },
  "build": {
    "node_version": "22",
    "python_version": "3.9",
    "grow_version": "latest"
  }
}
```

**ACTION REQUIRED:** 
- [ ] Define complete site configuration schema
- [ ] Create site-specific configs for amp.dev.20 and benetta.io
- [ ] Document all configuration options

---

### 2. Environment Configuration Abstraction

**Current Issues:**
- Hardcoded amp.dev hosts in all environments
- Google App Engine specific endpoints (appspot.com)
- Redis endpoints not needed for Netlify
- Packager/Thumbor endpoints tied to GCP

**Missing:**

#### A. Staging Configuration for Netlify

```json
{
  "name": "staging",
  "platform": "netlify",
  "hosts": {
    "pages": {
      "scheme": "https",
      "host": "${SITE_STAGING_DOMAIN}",  // e.g., "branch--lighthearted-genie.netlify.app"
      "port": ""
    },
    "api": {
      "scheme": "https",
      "host": "${SITE_STAGING_DOMAIN}",
      "port": ""
    },
    "platform": {
      "scheme": "https",
      "host": "${SITE_STAGING_DOMAIN}",
      "port": ""
    },
    "websocket": {
      "scheme": "wss",
      "host": "${SITE_STAGING_DOMAIN}",
      "port": ""
    },
    "playground": {
      "scheme": "https",
      "subdomain": "playground",
      "host": "${SITE_STAGING_DOMAIN}",
      "port": ""
    },
    "preview": {
      "scheme": "https",
      "subdomain": "preview",
      "host": "${SITE_STAGING_DOMAIN}",
      "port": ""
    },
    "go": {
      "scheme": "https",
      "subdomain": "go",
      "host": "${SITE_STAGING_DOMAIN}",
      "port": ""
    },
    "log": {
      "scheme": "https",
      "subdomain": "log",
      "host": "${SITE_STAGING_DOMAIN}",
      "port": ""
    }
  },
  "features_disabled": ["packager", "thumbor", "redis"]
}
```

**Question for User:** Does Netlify support subdomain routing (playground.site.netlify.app)? 
- If NO: Need alternative routing strategy (path-based: /playground, /preview)
- If YES: Confirm configuration approach

**ACTION REQUIRED:**
- [ ] Clarify Netlify subdomain capabilities
- [ ] Define staging environment template
- [ ] Create environment configs for each deployment target

---

#### B. Production Configuration Template

**Placeholder needed until benetta.io is configured:**

```json
{
  "name": "production",
  "platform": "netlify",
  "custom_domain": "${SITE_PRODUCTION_DOMAIN}",  // "benetta.io"
  "hosts": {
    "pages": {
      "scheme": "https",
      "host": "${SITE_PRODUCTION_DOMAIN}",
      "port": ""
    },
    // ... similar structure to staging
  },
  "ssl": {
    "enabled": true,
    "provider": "netlify",  // Netlify provides free SSL
    "force_https": true
  },
  "dns": {
    "provider": "aws_route53",  // Current DNS provider
    "migration_required": true,
    "target_provider": "netlify"
  }
}
```

**ACTION REQUIRED:**
- [ ] Document DNS migration process from AWS to Netlify
- [ ] Create checklist for domain transfer
- [ ] Define production deployment gates

---

### 3. Workflow Configuration Issues

**Current deploy.yaml Issues:**

1. **Single NETLIFY_DEPLOY_TOKEN** - Need per-site tokens
2. **No site selection mechanism** - Can't choose which site to deploy
3. **Hardcoded secrets references** - Not generalized
4. **Missing environment matrix** - Can't deploy to multiple sites from one workflow

**Needed: Multi-Site Deployment Workflow**

```yaml
name: Deploy Multi-Site
run-name: Deploy ${{ inputs.site }} to ${{ inputs.environment }}

on:
  workflow_dispatch:
    inputs:
      site:
        description: 'Which site to deploy'
        required: true
        type: choice
        options:
          - amp.dev.20
          - benetta.io
          - site-3
          - site-4
          - site-5
          - site-6
        default: amp.dev.20
      environment:
        description: 'Which environment'
        required: true
        type: choice
        options:
          - staging
          - production
        default: staging
      
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    env:
      SITE_ID: ${{ inputs.site }}
      DEPLOY_ENV: ${{ inputs.environment }}
      # Dynamic secret selection based on site
      NETLIFY_SITE_ID: ${{ secrets[format('NETLIFY_SITE_ID_{0}', inputs.site)] }}
      NETLIFY_DEPLOY_TOKEN: ${{ secrets[format('NETLIFY_DEPLOY_TOKEN_{0}', inputs.site)] }}
    steps:
      - name: Load site configuration
        run: |
          # Load site-specific config
          SITE_CONFIG="config/sites/${{ inputs.site }}.json"
          # Set environment variables from config
          # ... configuration loading logic
      
      - name: Deploy to Netlify
        run: |
          npx netlify deploy \
            --prod=${{ inputs.environment == 'production' }} \
            --site="${NETLIFY_SITE_ID}" \
            --auth="${NETLIFY_DEPLOY_TOKEN}" \
            --dir="dist/pages"
```

**ACTION REQUIRED:**
- [ ] Create multi-site workflow template
- [ ] Define secret naming convention
- [ ] Test with amp.dev.20 first
- [ ] Document workflow for each site

---

### 4. Credentials Management System

**Current State:** Manual, undocumented  
**Required:** Systematic credential management

#### A. Credential Template

```bash
# .env.template
# Copy this to .env.[site-id] and fill in values

# === SITE IDENTIFICATION ===
SITE_ID=                    # e.g., "amp-dev-20"
SITE_NAME=                  # e.g., "AMP Dev 20"

# === NETLIFY DEPLOYMENT ===
NETLIFY_SITE_ID=           # From Netlify project settings
NETLIFY_DEPLOY_TOKEN=      # From Netlify team settings
NETLIFY_SITE_URL=          # e.g., "lighthearted-genie.netlify.app"

# === GITHUB INTEGRATION ===
GITHUB_ORG=AFDSI
GITHUB_REPO=               # e.g., "amp.dev.20"
GITHUB_TOKEN=              # For API access (optional)

# === GOOGLE PROGRAMMABLE SEARCH ===
GOOGLE_PSE_API_KEY=        # From Google Cloud Console
GOOGLE_PSE_CSE_ID=         # From Programmable Search Engine
GOOGLE_PSE_ENABLED=true    # true/false

# === GOOGLE ANALYTICS (Production only) ===
GA_TRACKING_ID=            # e.g., "UA-XXXXXXXXX-X" or "G-XXXXXXXXXX"
GA_ENABLED=false           # Enable for production

# === GOOGLE SITE VERIFICATION (Production only) ===
GOOGLE_SITE_VERIFICATION=  # Meta tag content
GSV_ENABLED=false          # Enable for production

# === GOOGLE KNOWLEDGE GRAPH (Optional) ===
GOOGLE_KG_API_KEY=         # Optional feature
GOOGLE_KG_ENABLED=false

# === GOOGLE MAPS (Optional) ===
GOOGLE_MAPS_API_KEY=       # Optional feature
GOOGLE_MAPS_ENABLED=false

# === BUILD CONFIGURATION ===
NODE_ENV=                  # development/staging/production
APP_ENV=                   # local/staging/production
```

#### B. Credential Loading Script

```bash
#!/bin/bash
# load-site-credentials.sh
# Usage: source load-site-credentials.sh [site-id]

SITE_ID=${1:-amp-dev-20}
ENV_FILE="config/credentials/.env.${SITE_ID}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: Credentials file not found: $ENV_FILE"
  exit 1
fi

# Load credentials
set -a
source "$ENV_FILE"
set +a

echo "✓ Loaded credentials for site: $SITE_NAME"
echo "  Netlify Site: $NETLIFY_SITE_URL"
echo "  GitHub Repo: $GITHUB_ORG/$GITHUB_REPO"
```

**ACTION REQUIRED:**
- [ ] Create credential template
- [ ] Document credential generation process
- [ ] Create loading scripts for each environment
- [ ] Add to .gitignore

---

### 5. Google Services Integration Guide

**MISSING COMPLETELY:** Step-by-step guide for configuring Google services

#### Required Documentation:

##### A. Google Programmable Search Setup

```markdown
# Google Programmable Search Engine Setup

## Prerequisites
- Google Account
- Domain transferred to Netlify (for production)
- Site deployed and accessible

## Steps

### 1. Create Programmable Search Engine
1. Go to: https://programmablesearchengine.google.com/
2. Click "Add" to create new search engine
3. Configure:
   - **Name:** [Site Name] Search
   - **Search sites:** [Your site domain]
   - **Language:** English (or primary language)
4. Click "Create"

### 2. Get Search Engine ID
1. In PSE control panel, click "Setup"
2. Copy "Search engine ID" (format: `xxxxxxxxxxxxx:yyyyyyy`)
3. Save to: `GOOGLE_PSE_CSE_ID` in credentials file

### 3. Generate API Key
1. Go to: https://console.cloud.google.com/
2. Create new project OR select existing
3. Enable "Custom Search API"
4. Go to "Credentials"
5. Click "Create Credentials" → "API Key"
6. Copy API key
7. Save to: `GOOGLE_PSE_API_KEY` in credentials file

### 4. Configure Search Results
1. In PSE control panel:
   - Settings → Basics → Sites to search
   - Add/verify your domain
   - Enable "Search the entire web"
   - Enable "Image search"
   
2. Look and Feel:
   - Layout: Results only
   - Themes: (your choice)

### 5. Test Search
```bash
curl "https://www.googleapis.com/customsearch/v1?\
key=${GOOGLE_PSE_API_KEY}&\
cx=${GOOGLE_PSE_CSE_ID}&\
q=test"
```

Expected: JSON response with search results

### 6. Rate Limits
- Free tier: 100 queries/day
- Paid tier: 10,000 queries/day
- Monitor: https://console.cloud.google.com/apis/dashboard
```

**Similar guides needed for:**
- [ ] Google Analytics setup
- [ ] Google Site Verification
- [ ] Google Knowledge Graph (optional)
- [ ] Google Maps API (optional)

---

### 6. Static-Test Environment Analysis

**User Question:** Should we use static-test.json for developer partitioning?

#### Analysis:

**Pros:**
- Isolated test environments per developer
- No conflicts between contractors
- Easy preview before main branch merge

**Cons:**
- Additional complexity in build system
- More Netlify deployments (cost consideration)
- Configuration management overhead
- May not be needed with branch previews

#### Recommendation: **Skip static-test.json initially**

**Reasoning:**
1. **Netlify Branch Previews solve this problem**
   - Each branch gets automatic preview URL
   - No additional configuration needed
   - Built-in to Netlify workflow

2. **Simpler Mental Model**
   ```
   main branch        → Production (or staging)
   feature branches   → Automatic previews
   ```

3. **Can add later if needed**
   - Start simple
   - Add complexity only if branch previews insufficient
   - Evaluate after real usage

**Alternative Approach:**
```
Use Netlify's native features:
1. Branch deploys (automatic)
2. Deploy previews for PRs
3. Deploy contexts (production vs branch)
```

**ACTION:** Document branch preview workflow instead of static-test

---

### 7. Documentation Structure Needed

**Current:** Fragmented command references  
**Required:** Complete end-to-end workflows

#### Proposed Documentation Structure:

```
docs/
├── 00-OVERVIEW.md
│   ├── Project goals
│   ├── Architecture overview
│   └── Multi-site strategy
│
├── 01-SETUP/
│   ├── initial-setup.md
│   ├── prerequisites.md
│   ├── tool-installation.md
│   └── credential-generation.md
│
├── 02-SITE-CREATION/
│   ├── create-new-site.md
│   ├── site-configuration.md
│   ├── github-repo-setup.md
│   └── netlify-project-setup.md
│
├── 03-GOOGLE-SERVICES/
│   ├── programmable-search.md
│   ├── google-analytics.md
│   ├── site-verification.md
│   ├── knowledge-graph.md (optional)
│   └── maps-api.md (optional)
│
├── 04-DEVELOPMENT/
│   ├── local-development.md
│   ├── branch-strategy.md
│   ├── testing-locally.md
│   └── code-standards.md
│
├── 05-DEPLOYMENT/
│   ├── staging-deployment.md
│   ├── production-deployment.md
│   ├── rollback-procedures.md
│   └── troubleshooting.md
│
├── 06-WORKFLOWS/
│   ├── content-developer-workflow.md
│   ├── technical-workflow.md
│   ├── review-approval-process.md
│   └── ci-cd-pipeline.md
│
└── 07-REFERENCE/
    ├── configuration-schema.md
    ├── environment-variables.md
    ├── makefile-commands.md
    └── api-reference.md
```

---

## 📋 COMPLETE WORKFLOW EXAMPLE

### End-to-End: New Site Creation

**Starting Point:** Nothing exists  
**Ending Point:** Site live on Netlify with working search

```bash
# === PHASE 1: PREPARATION ===

# 1. Create site configuration
cp config/sites/site-template.json config/sites/benetta-io.json
# Edit benetta-io.json with site-specific values

# 2. Create credentials file
cp config/credentials/.env.template config/credentials/.env.benetta-io
# Fill in all required values

# 3. Load credentials
source load-site-credentials.sh benetta-io

# === PHASE 2: GITHUB SETUP ===

# 4. Create GitHub repository
gh repo create AFDSI/benetta.io --public --source=. --remote=origin

# 5. Push initial code
git checkout -b main
git add .
git commit -m "Initial benetta.io site setup"
git push -u origin main

# === PHASE 3: NETLIFY SETUP ===

# 6. Create Netlify site
netlify sites:create --name benetta-io

# 7. Link to GitHub repo
# (Done via Netlify UI: Site settings → Build & deploy → Connect to GitHub)

# 8. Configure build settings in Netlify
# Build command: npm run build:staging
# Publish directory: dist/pages

# 9. Add environment variables in Netlify
# (All variables from .env.benetta-io)

# === PHASE 4: GOOGLE SERVICES ===

# 10. Set up Programmable Search
# Follow guide in docs/03-GOOGLE-SERVICES/programmable-search.md

# 11. Test search locally
npm run develop
# Visit: http://localhost:8080, test search

# === PHASE 5: DEPLOYMENT ===

# 12. Deploy to staging
git push origin main
# Netlify auto-deploys

# 13. Verify staging deployment
# Visit: https://benetta-io.netlify.app
# Test all features

# === PHASE 6: PRODUCTION (When Ready) ===

# 14. Transfer domain to Netlify
# (Follow DNS migration guide)

# 15. Configure custom domain
netlify domains:add benetta.io

# 16. Deploy to production
# (Use GitHub Actions workflow or manual deploy)
```

---

## 🎯 IMMEDIATE ACTION ITEMS

### Priority 1: Foundation (Week 1)

- [ ] **Define configuration schema**
  - Site configuration JSON schema
  - Environment configuration schema
  - Credentials template

- [ ] **Create amp.dev.20 configs**
  - config/sites/amp.dev.20.json
  - config/credentials/.env.amp-dev-20
  - config/environments/staging.json (Netlify version)

- [ ] **Test with existing setup**
  - Deploy amp.dev.20 to Netlify using new configs
  - Verify all features work
  - Document any issues

### Priority 2: Documentation (Week 1-2)

- [ ] **Core workflow docs**
  - 00-OVERVIEW.md
  - 02-SITE-CREATION/create-new-site.md
  - 05-DEPLOYMENT/staging-deployment.md

- [ ] **Google services guides**
  - Programmable Search setup (critical for search feature)
  - Analytics setup (for production)
  - Site verification (for production)

### Priority 3: Multi-Site Support (Week 2-3)

- [ ] **Workflow updates**
  - Multi-site deploy.yaml
  - Site selection mechanism
  - Secret management strategy

- [ ] **Create benetta.io configs**
  - config/sites/benetta.io.json
  - config/credentials/.env.benetta-io

- [ ] **Test second site**
  - Deploy benetta.io to staging
  - Verify isolation from amp.dev.20
  - Document differences

### Priority 4: Production Readiness (Week 3-4)

- [ ] **DNS migration guide**
  - AWS Route53 → Netlify DNS
  - Verification steps
  - Rollback procedures

- [ ] **Production deployment**
  - benetta.io domain transfer
  - Google services configuration
  - Production monitoring setup

---

## ❓ QUESTIONS REQUIRING ANSWERS

### Technical Architecture

1. **Netlify Subdomain Support**
   - Can Netlify handle subdomain routing? (playground.site.netlify.app)
   - If not, what's the alternative? (path-based routing?)

2. **Build Optimization**
   - Current builds take 20+ minutes. Acceptable for CI/CD?
   - Should we implement caching strategies?
   - Parallel builds for multiple locales?

3. **Feature Scope**
   - Which amp.dev features are required for all sites?
   - Which are optional?
   - Can we simplify by removing unused features?

### Operational

4. **Team Structure**
   - How many content developers per site?
   - Review/approval process?
   - Who manages deployments?

5. **Cost Considerations**
   - Netlify plan needed for 6 sites?
   - Build minutes allocation?
   - Bandwidth requirements?

6. **Google Services**
   - Shared Google Cloud Project or per-site projects?
   - API quota management strategy?
   - Cost tracking per site?

### Process

7. **Deployment Frequency**
   - How often will sites be updated?
   - Continuous deployment or scheduled releases?
   - Who approves production deployments?

8. **Testing Strategy**
   - Manual testing sufficient?
   - Automated testing needed?
   - Preview links for stakeholder review?

---

## 🔧 PROPOSED CONFIGURATION SYSTEM

### Configuration Loading Logic

```javascript
// platform/lib/config-loader.js

class ConfigLoader {
  constructor() {
    this.siteId = process.env.SITE_ID || 'default';
    this.environment = process.env.APP_ENV || 'development';
  }

  /**
   * Load complete configuration by merging:
   * 1. Site-specific config
   * 2. Environment config
   * 3. Environment variables (credentials)
   */
  load() {
    const siteConfig = this.loadSiteConfig();
    const envConfig = this.loadEnvironmentConfig();
    const credentials = this.loadCredentials();

    return this.merge(siteConfig, envConfig, credentials);
  }

  loadSiteConfig() {
    const path = `config/sites/${this.siteId}.json`;
    return require(path);
  }

  loadEnvironmentConfig() {
    const path = `config/environments/${this.environment}.json`;
    return require(path);
  }

  loadCredentials() {
    // Load from environment variables
    return {
      netlify: {
        siteId: process.env.NETLIFY_SITE_ID,
        deployToken: process.env.NETLIFY_DEPLOY_TOKEN
      },
      google: {
        pse: {
          apiKey: process.env.GOOGLE_PSE_API_KEY,
          cseId: process.env.GOOGLE_PSE_CSE_ID,
          enabled: process.env.GOOGLE_PSE_ENABLED === 'true'
        },
        analytics: {
          trackingId: process.env.GA_TRACKING_ID,
          enabled: process.env.GA_ENABLED === 'true'
        }
      }
    };
  }

  merge(site, env, credentials) {
    // Deep merge with variable substitution
    // Replace ${VAR} patterns with values
    // Return complete configuration
  }
}

module.exports = new ConfigLoader();
```

---

## 📊 SUCCESS METRICS

### Phase 1: Foundation (Weeks 1-2)
- [ ] amp.dev.20 deployed to Netlify staging
- [ ] Search functionality working
- [ ] Configuration system implemented
- [ ] Basic documentation complete

### Phase 2: Second Site (Weeks 2-3)
- [ ] benetta.io configured
- [ ] Deployed to Netlify staging
- [ ] Independent from amp.dev.20
- [ ] All features working

### Phase 3: Production (Week 4+)
- [ ] benetta.io domain transferred
- [ ] Google services configured
- [ ] Production deployment successful
- [ ] Monitoring in place

### Phase 4: Scale (Week 5+)
- [ ] Template system proven
- [ ] Sites 3-6 configuration ready
- [ ] Team trained on workflows
- [ ] Full documentation complete

---

## 🎓 RECOMMENDATIONS

### 1. Start Small, Scale Systematically
- Perfect amp.dev.20 first
- Add benetta.io second
- Learn from each deployment
- Refine templates before scaling to 6 sites

### 2. Prioritize Documentation
- Write as you build
- Document every decision
- Create reusable templates
- Think about contractors using docs

### 3. Automate Early
- Scripts for repetitive tasks
- GitHub Actions for deployments
- Credential loading helpers
- Validation checks

### 4. Simplify Where Possible
- Remove unused amp.dev features
- Use Netlify's built-in capabilities
- Avoid premature optimization
- Add complexity only when needed

### 5. Plan for Maintenance
- Clear ownership per site
- Update procedures
- Rollback capabilities
- Monitoring and alerts

---

## 📝 NEXT STEPS

### Immediate (This Week)

1. **Review this analysis** with stakeholders
2. **Answer questions** listed above
3. **Define configuration schema** (site + environment)
4. **Create amp.dev.20 configs** (site + credentials)
5. **Test deployment** to Netlify

### Short Term (Next 2 Weeks)

1. **Write core documentation**
   - Site creation guide
   - Deployment workflow
   - Google services setup
2. **Deploy amp.dev.20** to staging
3. **Configure benetta.io**
4. **Test multi-site** isolation

### Medium Term (Weeks 3-4)

1. **Transfer benetta.io domain**
2. **Production deployment**
3. **Complete documentation**
4. **Team training**

### Long Term (Month 2+)

1. **Scale to sites 3-6**
2. **Refine workflows**
3. **Optimize build process**
4. **Establish maintenance procedures**

---

**END OF ANALYSIS**

This specification provides the foundation for transforming amp.dev into a portable, reusable platform. The key is systematic implementation, thorough documentation, and learning from each deployment before scaling.
