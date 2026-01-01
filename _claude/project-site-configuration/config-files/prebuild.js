#!/usr/bin/env node

/**
 * scripts/prebuild.js
 *
 * Pre-build script that generates site-specific files from site-vars.yaml.
 * Run before the main build process.
 *
 * Usage:
 *   node scripts/prebuild.js
 *   SITE_CONFIG=wabc node scripts/prebuild.js
 *
 * What it does:
 *   1. Generates manifest.json
 *   2. Generates robots.txt (production)
 *   3. Generates sitemap_manual.xml
 *   4. Generates serviceworker.html
 *   5. Copies appropriate netlify.toml
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// -----------------------------------------------------------------------------
// CONFIGURATION
// -----------------------------------------------------------------------------

const PROJECT_ROOT = path.join(__dirname, '..');

// Load site config (same logic as config.js)
function loadSiteConfig() {
  const siteConfigName = process.env.SITE_CONFIG;
  let configPath;

  if (siteConfigName) {
    configPath = path.join(
      PROJECT_ROOT,
      'config/sites',
      `${siteConfigName}.yaml`
    );
  } else {
    configPath = path.join(PROJECT_ROOT, 'config/site-vars.yaml');
  }

  console.log(`[prebuild] Loading: ${configPath}`);
  return yaml.load(fs.readFileSync(configPath, 'utf8'));
}

const config = loadSiteConfig();

// -----------------------------------------------------------------------------
// FILE GENERATORS
// -----------------------------------------------------------------------------

/**
 * Generates pages/static/manifest.json
 */
function generateManifest() {
  const manifest = {
    name: config.site.name,
    short_name: config.site.id,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#005af0',
    icons: [
      {
        src: '/static/img/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/static/img/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };

  const outputPath = path.join(PROJECT_ROOT, 'pages/static/manifest.json');
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
  console.log(`  ✓ Generated: manifest.json`);
}

/**
 * Generates pages/static/robots/platform_prod.txt
 */
function generateRobotsTxt() {
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${config.urls.production}/sitemap.xml
`;

  const outputPath = path.join(
    PROJECT_ROOT,
    'pages/static/robots/platform_prod.txt'
  );
  fs.writeFileSync(outputPath, robotsTxt);
  console.log(`  ✓ Generated: robots/platform_prod.txt`);
}

/**
 * Generates pages/static/sitemap/sitemap_manual.xml
 */
function generateSitemapManual() {
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Playground -->
  <url>
    <loc>${config.urls.playground}/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Boilerplate -->
  <url>
    <loc>${config.urls.production}/boilerplate/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- Add additional manual sitemap entries here -->
</urlset>
`;

  const outputPath = path.join(
    PROJECT_ROOT,
    'pages/static/sitemap/sitemap_manual.xml'
  );
  fs.writeFileSync(outputPath, sitemapXml);
  console.log(`  ✓ Generated: sitemap/sitemap_manual.xml`);
}

/**
 * Generates pages/static/serviceworker.html
 */
function generateServiceworkerHtml() {
  const swHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Installing Service Worker</title>
</head>
<body>
  <script>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('${config.urls.production}/serviceworker.js')
        .then(function(registration) {
          console.log('ServiceWorker registered:', registration.scope);
        })
        .catch(function(error) {
          console.log('ServiceWorker registration failed:', error);
        });
    }
  </script>
</body>
</html>
`;

  const outputPath = path.join(PROJECT_ROOT, 'pages/static/serviceworker.html');
  fs.writeFileSync(outputPath, swHtml);
  console.log(`  ✓ Generated: serviceworker.html`);
}

/**
 * Copies the appropriate netlify.toml for the current site
 */
function copyNetlifyConfig() {
  const siteId = config.site.id;
  const domain = config.domains.production;

  // Try site-specific config first, then domain-specific
  const possibleSources = [
    path.join(PROJECT_ROOT, `netlify/configs/${siteId}/netlify.toml`),
    path.join(PROJECT_ROOT, `netlify/configs/${domain}/netlify.toml`),
  ];

  const sourcePath = possibleSources.find((p) => fs.existsSync(p));

  if (sourcePath) {
    const destPath = path.join(PROJECT_ROOT, 'netlify.toml');
    fs.copyFileSync(sourcePath, destPath);
    console.log(
      `  ✓ Copied: netlify.toml (from ${path.basename(path.dirname(sourcePath))})`
    );
  } else {
    console.log(`  ⚠ No site-specific netlify.toml found for ${siteId}`);
    console.log(`    Expected one of:`);
    possibleSources.forEach((p) => console.log(`      - ${p}`));
  }
}

/**
 * Generates package.json site-specific fields
 * (Merges with existing package.json rather than replacing)
 */
function updatePackageJson() {
  const packagePath = path.join(PROJECT_ROOT, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  // Update only site-specific fields
  pkg.name = config.domains.production;
  pkg.description = config.site.description;
  pkg.repository = config.repository.git_ssh;

  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`  ✓ Updated: package.json (name, description, repository)`);
}

// -----------------------------------------------------------------------------
// MAIN
// -----------------------------------------------------------------------------

console.log('\n[prebuild] Generating site-specific files...\n');
console.log(`  Site ID: ${config.site.id}`);
console.log(`  Domain:  ${config.domains.production}\n`);

try {
  generateManifest();
  generateRobotsTxt();
  generateSitemapManual();
  generateServiceworkerHtml();
  copyNetlifyConfig();
  updatePackageJson();

  console.log('\n[prebuild] Complete!\n');
} catch (error) {
  console.error('\n[prebuild] Error:', error.message);
  process.exit(1);
}
