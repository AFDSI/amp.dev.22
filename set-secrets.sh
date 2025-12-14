#!/bin/bash
set -e

# Load project-specific secrets from .env
source .env

# Load global secrets from shell environment

REPO="AFDSI/amp.dev.22"

echo "Setting secrets for $REPO..."

# Authentication tokens
gh secret set AMP_DOC_TOKEN --body "$AMP_DOC_TOKEN" --repo "$REPO"
gh secret set NETLIFY_DEPLOY_TOKEN --body "$NETLIFY_DEPLOY_TOKEN" --repo "$REPO"

# Google API keys (match googleSearch.js expectations)
gh secret set GOOGLE_CSE_API_KEY --body "$GOOGLE_CSE_API_KEY" --repo "$REPO"
gh secret set GOOGLE_CSE_ID --body "$GOOGLE_CSE_ID" --repo "$REPO"
gh secret set GOOGLE_KNOWLEDGE_GRAPH_API_KEY --body "$GOOGLE_KNOWLEDGE_GRAPH_API_KEY" --repo "$REPO"
gh secret set GOOGLE_MAPS_API_KEY --body "$GOOGLE_MAPS_API_KEY" --repo "$REPO"

echo "Done. Verify with: gh secret list --repo $REPO"
