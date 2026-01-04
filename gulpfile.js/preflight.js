/**
 * Copyright 2026 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const {execSync} = require('child_process');

/**
 * Pre-flight checks for deployment readiness.
 * Verifies external services, credentials, and environment
 * before initiating build to avoid wasted time on doomed builds.
 */

// Minimum GitHub API requests needed for a full build
const MIN_GITHUB_RATE_LIMIT = 500;

// Required environment variables for different contexts
const REQUIRED_SECRETS = {
  ci: [
    'AMP_DOC_TOKEN',
    'NETLIFY_DEPLOY_TOKEN',
  ],
  local: [
    'AMP_DOC_TOKEN',
  ],
};

// Optional but recommended secrets
const OPTIONAL_SECRETS = [
  'GOOGLE_CSE_API_KEY',
  'GOOGLE_CSE_ID',
  'GOOGLE_KNOWLEDGE_GRAPH_API_KEY',
  'GOOGLE_MAPS_API_KEY',
];

/**
 * Check GitHub API rate limit
 * @returns {Promise<{name: string, pass: boolean, reason: string}>}
 */
async function checkGitHubRateLimit() {
  const token = process.env.AMP_DOC_TOKEN;

  if (!token) {
    return {
      name: 'GitHub Rate Limit',
      pass: false,
      reason: 'AMP_DOC_TOKEN not set - cannot check rate limit',
      critical: true,
    };
  }

  try {
    const response = await fetch('https://api.github.com/rate_limit', {
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'amp-dev-preflight',
      },
    });

    if (response.status === 401) {
      return {
        name: 'GitHub Rate Limit',
        pass: false,
        reason: 'AMP_DOC_TOKEN is invalid (401 Unauthorized)',
        critical: true,
      };
    }

    if (!response.ok) {
      return {
        name: 'GitHub Rate Limit',
        pass: false,
        reason: `GitHub API error: ${response.status}`,
        critical: true,
      };
    }

    const data = await response.json();
    const remaining = data.resources.core.remaining;
    const limit = data.resources.core.limit;
    const resetTime = new Date(data.resources.core.reset * 1000);
    const resetIn = Math.round((resetTime - Date.now()) / 60000);

    if (remaining < MIN_GITHUB_RATE_LIMIT) {
      return {
        name: 'GitHub Rate Limit',
        pass: false,
        reason: `Only ${remaining}/${limit} remaining. Resets in ${resetIn} minutes at ${resetTime.toISOString()}`,
        critical: true,
      };
    }

    return {
      name: 'GitHub Rate Limit',
      pass: true,
      reason: `${remaining}/${limit} remaining (resets in ${resetIn} min)`,
      critical: false,
    };
  } catch (err) {
    return {
      name: 'GitHub Rate Limit',
      pass: false,
      reason: `Network error: ${err.message}`,
      critical: true,
    };
  }
}

/**
 * Check that required secrets are present
 * @returns {{name: string, pass: boolean, reason: string}}
 */
function checkRequiredSecrets() {
  const isCI = process.env.CI === 'true';
  const required = isCI ? REQUIRED_SECRETS.ci : REQUIRED_SECRETS.local;
  const missing = required.filter((s) => !process.env[s]);

  if (missing.length > 0) {
    return {
      name: 'Required Secrets',
      pass: false,
      reason: `Missing: ${missing.join(', ')}`,
      critical: true,
    };
  }

  return {
    name: 'Required Secrets',
    pass: true,
    reason: `All ${required.length} required secrets present`,
    critical: false,
  };
}

/**
 * Check optional secrets and warn if missing
 * @returns {{name: string, pass: boolean, reason: string}}
 */
function checkOptionalSecrets() {
  const missing = OPTIONAL_SECRETS.filter((s) => !process.env[s]);

  if (missing.length > 0) {
    return {
      name: 'Optional Secrets',
      pass: true, // Don't fail, just warn
      reason: `Missing (non-critical): ${missing.join(', ')}`,
      critical: false,
      warning: true,
    };
  }

  return {
    name: 'Optional Secrets',
    pass: true,
    reason: `All ${OPTIONAL_SECRETS.length} optional secrets present`,
    critical: false,
  };
}

/**
 * Check available disk space
 * @returns {{name: string, pass: boolean, reason: string}}
 */
function checkDiskSpace() {
  const minGB = 5;

  try {
    // Works on Linux/Mac
    const output = execSync('df -BG . 2>/dev/null | tail -1', {
      encoding: 'utf-8',
    });
    const parts = output.trim().split(/\s+/);
    const available = parseInt(parts[3], 10);

    if (isNaN(available)) {
      return {
        name: 'Disk Space',
        pass: true,
        reason: 'Could not parse disk space (assuming OK)',
        critical: false,
      };
    }

    if (available < minGB) {
      return {
        name: 'Disk Space',
        pass: false,
        reason: `Only ${available}GB available (need ${minGB}GB minimum)`,
        critical: true,
      };
    }

    return {
      name: 'Disk Space',
      pass: true,
      reason: `${available}GB available`,
      critical: false,
    };
  } catch (err) {
    // Windows or other OS without df
    return {
      name: 'Disk Space',
      pass: true,
      reason: 'Could not check (non-Unix system)',
      critical: false,
    };
  }
}

/**
 * Check Node.js version matches expected
 * @returns {{name: string, pass: boolean, reason: string}}
 */
function checkNodeVersion() {
  const expectedMajor = ['20', '22']; // Should match .nvmrc
  const actual = process.version;
  const actualMajor = actual.match(/^v(\d+)/)?.[1];

  if (!expectedMajor.includes(actualMajor)) {
    return {
      name: 'Node Version',
      pass: false,
      reason: `Expected Node ${expectedMajor.join(' or ')}.x, got ${actual}`,
      critical: true,
    };
  }

  return {
    name: 'Node Version',
    pass: true,
    reason: `Node ${actual}`,
    critical: false,
  };
}

/**
 * Check Netlify CLI is available and authenticated (for local deploys)
 * @returns {{name: string, pass: boolean, reason: string}}
 */
function checkNetlifyCLI() {
  const isCI = process.env.CI === 'true';

  // Skip in CI - uses NETLIFY_DEPLOY_TOKEN instead
  if (isCI) {
    return {
      name: 'Netlify CLI',
      pass: true,
      reason: 'Skipped in CI (uses token auth)',
      critical: false,
    };
  }

  try {
    const output = execSync('netlify status 2>&1', {
      encoding: 'utf-8',
      timeout: 10000,
    });

    if (output.includes('Not logged in')) {
      return {
        name: 'Netlify CLI',
        pass: false,
        reason: 'Netlify CLI not authenticated. Run: netlify login',
        critical: false, // Not critical for local dev
        warning: true,
      };
    }

    return {
      name: 'Netlify CLI',
      pass: true,
      reason: 'Netlify CLI authenticated',
      critical: false,
    };
  } catch (err) {
    return {
      name: 'Netlify CLI',
      pass: true, // Don't fail - may not need it
      reason: 'Netlify CLI not installed or not responding',
      critical: false,
      warning: true,
    };
  }
}

/**
 * Check GitHub CLI is available (for local operations)
 * @returns {{name: string, pass: boolean, reason: string}}
 */
function checkGitHubCLI() {
  try {
    const output = execSync('gh auth status 2>&1', {
      encoding: 'utf-8',
      timeout: 10000,
    });

    if (output.includes('not logged')) {
      return {
        name: 'GitHub CLI',
        pass: true,
        reason: 'GitHub CLI not authenticated (optional)',
        critical: false,
        warning: true,
      };
    }

    return {
      name: 'GitHub CLI',
      pass: true,
      reason: 'GitHub CLI authenticated',
      critical: false,
    };
  } catch (err) {
    return {
      name: 'GitHub CLI',
      pass: true,
      reason: 'GitHub CLI not installed (optional)',
      critical: false,
    };
  }
}

/**
 * Run all pre-flight checks
 * @param {Function} done - Gulp callback
 */
async function preflight(done) {
  const isCI = process.env.CI === 'true';
  const env = isCI ? 'CI' : 'Local';

  console.log('');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║         PRE-FLIGHT CHECKS                  ║');
  console.log(`║         Environment: ${env.padEnd(22)}║`);
  console.log('╚════════════════════════════════════════════╝');
  console.log('');

  // Run all checks
  const checks = await Promise.all([
    checkRequiredSecrets(),
    checkGitHubRateLimit(),
    checkOptionalSecrets(),
    checkDiskSpace(),
    checkNodeVersion(),
    checkNetlifyCLI(),
    checkGitHubCLI(),
  ]);

  // Display results
  let hasFailure = false;
  let hasWarning = false;

  checks.forEach((check) => {
    let icon;
    if (!check.pass) {
      icon = '❌';
      hasFailure = true;
    } else if (check.warning) {
      icon = '⚠️ ';
      hasWarning = true;
    } else {
      icon = '✅';
    }

    console.log(`  ${icon} ${check.name}`);
    console.log(`     ${check.reason}`);
    console.log('');
  });

  // Summary
  console.log('────────────────────────────────────────────');

  if (hasFailure) {
    console.log('❌ PRE-FLIGHT CHECKS FAILED');
    console.log('');
    console.log('Fix the issues above before proceeding.');
    console.log('');
    done(new Error('Pre-flight checks failed'));
    return;
  } else if (hasWarning) {
    console.log('⚠️  PRE-FLIGHT CHECKS PASSED WITH WARNINGS');
    console.log('');
    console.log('Build can proceed, but some features may be limited.');
    console.log('');
  } else {
    console.log('✅ ALL PRE-FLIGHT CHECKS PASSED');
    console.log('');
    console.log('Ready to build!');
    console.log('');
  }

  done();
}

module.exports = {
  preflight,
  // Export individual checks for testing
  checkGitHubRateLimit,
  checkRequiredSecrets,
  checkOptionalSecrets,
  checkDiskSpace,
  checkNodeVersion,
  checkNetlifyCLI,
  checkGitHubCLI,
};
