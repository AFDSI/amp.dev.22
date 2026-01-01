/**
 * platform/lib/config.js (MODIFIED)
 * 
 * Central configuration hub - extended to support multi-site deployment.
 * 
 * Key changes from original:
 *   1. Loads site-vars.yaml as the master configuration source
 *   2. buildGrowPodSpec() injects site variables into podspec
 *   3. Environment configs can be generated or augmented from site-vars
 * 
 * Usage:
 *   SITE_CONFIG=wabc node build.js        # Use config/sites/wabc.yaml
 *   SITE_CONFIG=amp-new node build.js     # Use config/sites/amp-new.yaml
 *   node build.js                         # Use default config/site-vars.yaml
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// -----------------------------------------------------------------------------
// SITE CONFIGURATION LOADER
// -----------------------------------------------------------------------------

/**
 * Loads the site-specific configuration from YAML.
 * 
 * Resolution order:
 *   1. SITE_CONFIG env var -> config/sites/{SITE_CONFIG}.yaml
 *   2. Default -> config/site-vars.yaml
 * 
 * @returns {Object} Parsed site configuration
 */
function loadSiteConfig() {
  const siteConfigName = process.env.SITE_CONFIG;
  
  let configPath;
  if (siteConfigName) {
    configPath = path.join(__dirname, '../../config/sites', `${siteConfigName}.yaml`);
    if (!fs.existsSync(configPath)) {
      throw new Error(`Site config not found: ${configPath}`);
    }
    console.log(`[config] Loading site config: ${siteConfigName}`);
  } else {
    configPath = path.join(__dirname, '../../config/site-vars.yaml');
    console.log('[config] Loading default site config');
  }
  
  const configContent = fs.readFileSync(configPath, 'utf8');
  return yaml.load(configContent);
}

// Load once at module initialization
const siteConfig = loadSiteConfig();

// -----------------------------------------------------------------------------
// EXISTING ENVIRONMENT CONFIG LOADING (preserved)
// -----------------------------------------------------------------------------

/**
 * Loads environment-specific configuration.
 * Original logic preserved, but can now be augmented with siteConfig.
 */
function loadEnvironmentConfig(environment) {
  const envPath = path.join(
    __dirname, 
    '../config/environments', 
    `${environment}.json`
  );
  
  if (!fs.existsSync(envPath)) {
    console.warn(`[config] Environment config not found: ${environment}`);
    return {};
  }
  
  const envConfig = JSON.parse(fs.readFileSync(envPath, 'utf8'));
  
  // Augment with site-specific overrides if needed
  // This allows environment files to remain generic templates
  return mergeWithSiteConfig(envConfig, environment);
}

/**
 * Merges environment config with site-specific values.
 * Site config takes precedence for domain/URL values.
 */
function mergeWithSiteConfig(envConfig, environment) {
  const merged = { ...envConfig };
  
  // Override host based on environment
  const hostMap = {
    'production': siteConfig.domains.production,
    'staging': siteConfig.domains.staging,
    'development': siteConfig.domains.local,
    'local': siteConfig.domains.local,
  };
  
  if (hostMap[environment]) {
    merged.host = hostMap[environment];
  }
  
  return merged;
}

/**
 * Loads shared.json configuration.
 */
function loadSharedConfig() {
  const sharedPath = path.join(__dirname, '../config/shared.json');
  const shared = JSON.parse(fs.readFileSync(sharedPath, 'utf8'));
  
  // Override with site-specific values
  return {
    ...shared,
    gaTrackingId: siteConfig.analytics.ga4_tracking_id,
    repository: siteConfig.repository.docs_base,
  };
}

// -----------------------------------------------------------------------------
// GROW PODSPEC BUILDER (EXTENDED)
// -----------------------------------------------------------------------------

/**
 * Builds the Grow podspec configuration.
 * 
 * This is the KEY INTEGRATION POINT for Jinja templates.
 * All site-specific values that templates need should be injected here.
 * 
 * Templates access these via: {{ podspec.site_name }}, {{ podspec.blog_url }}, etc.
 * 
 * @param {Object} options - Build options
 * @param {string} options.environment - Current environment (production, staging, etc.)
 * @returns {Object} Complete podspec configuration for Grow
 */
function buildGrowPodSpec(options = {}) {
  const environment = options.environment || process.env.NODE_ENV || 'development';
  const envConfig = loadEnvironmentConfig(environment);
  const sharedConfig = loadSharedConfig();
  
  // Determine base URL for current environment
  const baseUrl = getBaseUrl(environment);
  
  return {
    // -------------------------------------------------------------------------
    // EXISTING PODSPEC VALUES (preserved)
    // -------------------------------------------------------------------------
    env: environment,
    locale: options.locale || 'en',
    
    // -------------------------------------------------------------------------
    // SITE IDENTITY (from site-vars.yaml)
    // -------------------------------------------------------------------------
    
    // Short identifier
    site_id: siteConfig.site.id,
    
    // Display names
    site_name: siteConfig.site.name,
    site_description: siteConfig.site.description,
    publisher_name: siteConfig.site.publisher,
    copyright_holder: siteConfig.site.copyright_holder,
    
    // -------------------------------------------------------------------------
    // URLS & DOMAINS (from site-vars.yaml)
    // -------------------------------------------------------------------------
    
    // Current environment's base URL
    base_url: baseUrl,
    
    // Explicit URL references for templates
    site_url: siteConfig.urls.production,
    blog_url: siteConfig.urls.blog,
    playground_url: siteConfig.urls.playground,
    
    // Domain without protocol (for manifest, etc.)
    site_domain: siteConfig.domains.production,
    
    // -------------------------------------------------------------------------
    // REPOSITORY (from site-vars.yaml)
    // -------------------------------------------------------------------------
    
    repo_org: siteConfig.repository.org,
    repo_name: siteConfig.repository.name,
    repo_url: siteConfig.repository.git_https,
    docs_base_url: siteConfig.repository.docs_base,
    
    // -------------------------------------------------------------------------
    // ANALYTICS (from site-vars.yaml, merged with shared.json)
    // -------------------------------------------------------------------------
    
    gaTrackingId: sharedConfig.gaTrackingId,
    
    // -------------------------------------------------------------------------
    // SOCIAL MEDIA (from site-vars.yaml)
    // -------------------------------------------------------------------------
    
    social: {
      twitter: {
        handle: siteConfig.social.twitter.handle,
        url: siteConfig.social.twitter.url,
        username: siteConfig.social.twitter.username,
      },
      youtube: {
        url: siteConfig.social.youtube.channel_url,
      },
      github: {
        org_url: siteConfig.social.github.org_url,
        issues_url: siteConfig.social.github.issues_url,
        amphtml_url: siteConfig.social.github.amphtml_repo,
      },
      stackoverflow: {
        url: siteConfig.social.stackoverflow.tag_url,
      },
    },
    
    // -------------------------------------------------------------------------
    // CDN & EXTERNAL RESOURCES (from site-vars.yaml)
    // -------------------------------------------------------------------------
    
    cdn: {
      amp_runtime: siteConfig.cdn.amp_runtime,
      amp_js: siteConfig.cdn.amp_js,
    },
    
    // -------------------------------------------------------------------------
    // BUILD METADATA
    // -------------------------------------------------------------------------
    
    build_version: siteConfig.build.version,
    build_time: new Date().toISOString(),
    
    // -------------------------------------------------------------------------
    // LEGACY/COMPATIBILITY (map old names to new structure)
    // -------------------------------------------------------------------------
    
    // If existing templates use different names, map them here
    // This allows gradual migration without breaking existing templates
    siteName: siteConfig.site.name,  // Legacy alias
    blogUrl: siteConfig.urls.blog,   // Legacy alias
  };
}

/**
 * Gets the base URL for a given environment.
 */
function getBaseUrl(environment) {
  const urlMap = {
    'production': siteConfig.urls.production,
    'staging': siteConfig.urls.staging,
    'development': `http://${siteConfig.domains.local}`,
    'local': `http://${siteConfig.domains.local}`,
  };
  
  return urlMap[environment] || urlMap['development'];
}

// -----------------------------------------------------------------------------
// PIXI CONFIG BUILDER (for JavaScript API endpoints)
// -----------------------------------------------------------------------------

/**
 * Builds configuration for Pixi (Page Experience tool).
 * Used by pixi/config.js
 * 
 * @param {string} environment - Current environment
 * @returns {Object} Pixi configuration
 */
function buildPixiConfig(environment = 'development') {
  const isProd = environment === 'production';
  const endpoints = isProd ? siteConfig.apis.pixi.prod : siteConfig.apis.pixi.dev;
  
  return {
    API_ENDPOINT_LINT: endpoints.lint,
    API_ENDPOINT_RECOMMENDATIONS: endpoints.recommendations,
    API_ENDPOINT_CHECK_PAGE_EXPERIENCE: siteConfig.apis.pixi.check_page_experience,
    API_ENDPOINT_PAGESPEED: siteConfig.apis.google.pagespeed,
    API_ENDPOINT_MOBILE_FRIENDLY: siteConfig.apis.google.mobile_friendly,
  };
}

// -----------------------------------------------------------------------------
// EXPORTS
// -----------------------------------------------------------------------------

module.exports = {
  // Site config (raw access if needed)
  siteConfig,
  
  // Config loaders
  loadSiteConfig,
  loadEnvironmentConfig,
  loadSharedConfig,
  
  // Builders
  buildGrowPodSpec,
  buildPixiConfig,
  
  // Utilities
  getBaseUrl,
};


// -----------------------------------------------------------------------------
// CLI: Generate environment configs from site-vars.yaml
// -----------------------------------------------------------------------------

/**
 * When run directly, generates environment JSON files.
 * 
 * Usage: node platform/lib/config.js --generate-env-configs
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--generate-env-configs')) {
    console.log('[config] Generating environment configs from site-vars.yaml...');
    
    const environments = ['production', 'staging', 'development', 'local'];
    const outputDir = path.join(__dirname, '../config/environments');
    
    environments.forEach(env => {
      const config = {
        name: env,
        host: siteConfig.domains[env] || siteConfig.domains.production,
        // Add other environment-specific fields as needed
        gaTrackingId: siteConfig.analytics.ga4_tracking_id,
      };
      
      const outputPath = path.join(outputDir, `${env}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));
      console.log(`  ✓ Generated: ${outputPath}`);
    });
    
    console.log('[config] Done.');
  }
  
  if (args.includes('--print-podspec')) {
    const podspec = buildGrowPodSpec({ environment: 'production' });
    console.log(JSON.stringify(podspec, null, 2));
  }
}
