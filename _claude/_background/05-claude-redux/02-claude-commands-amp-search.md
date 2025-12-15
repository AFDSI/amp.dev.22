**claude-code commands** that would help gather the missing information for amp-search restoration:

## **1. Locate All Search-Related Files**

```bash
# Find all files containing search-related keywords
claude "Find all files in amp.dev.20 related to search functionality - include autosuggest, Google Custom Search, search API endpoints, and search configuration files. List file paths and brief descriptions."

# Find JSON-LD implementations
claude "Find all files in amp.dev.20 that contain JSON-LD or schema.org markup. Show examples of the structured data patterns used."
```

## **2. Analyze Autosuggest Implementation**

```bash
# Client-side autosuggest analysis
claude "Analyze the autosuggest implementation in amp.dev.20. Document the component architecture, data flow, and how search suggestions are generated and displayed."

# API integration points
claude "Find where amp.dev.20 makes API calls for search/autosuggest. Document the endpoints, request/response patterns, and any rate limiting or caching mechanisms."
```

## **3. Google Custom Search Integration**

```bash
# Server-side GCS code
claude "Find all code in amp.dev.20 that integrates with Google Custom Search API. Document the implementation, configuration requirements, authentication patterns, and any environment variables needed."

# Configuration files
claude "Find search configuration files in amp.dev.20 - look for API keys patterns, GCS IDs, search scope definitions, and any .env or config files related to search."
```

## **4. JSON-LD + Schema.org Patterns**

```bash
# Document JSON-LD usage
claude "Analyze how JSON-LD structured data is implemented across pages in amp.dev.20. Show the different schema.org types used (@type values), common properties, and how they vary by page type."

# Rich Snippets compatibility
claude "Find examples of JSON-LD in amp.dev.20 that would generate Google Rich Snippets. Document which schema.org types are used and how they're structured."
```

## **5. Compare amp.dev.20 vs amp.dev.8**

```bash
# Search feature comparison
claude "Compare search-related files between ~/projects/amp.dev.20 and ~/projects/amp.dev.8. Identify what exists in .4 but is missing or different in .8."

# Dependency differences
claude "Compare package.json and dependencies related to search between amp.dev.20 and amp.dev.8. Identify any search-related packages that may be missing."
```

## **6. Document Search Architecture**

```bash
# Create architecture overview
claude "Document the complete search architecture in amp.dev.20 - how client-side autosuggest connects to server-side GCS, how results map to page locations, and how JSON-LD enhances search results. Create a detailed technical specification."

# API endpoint documentation
claude "Find and document all search-related API endpoints in amp.dev.20. Include routes, handlers, request/response schemas, and authentication requirements."
```

## **7. Environment & Configuration Requirements**

```bash
# Environment variables
claude "Find all environment variables and configuration needed for search functionality in amp.dev.20. Document what's required for GCS API access, authentication, and search indexing."

# Deployment requirements
claude "Document the deployment configuration for search in amp.dev.20 - including any build steps, environment setup, or external service dependencies specific to search."
```

## **Strategic Approach:**

Run these in sequence:
1. **Locate** (commands 1-2) → Find all relevant files
2. **Analyze** (commands 3-4) → Understand implementations  
3. **Compare** (command 5) → Identify gaps in amp.dev.8
4. **Document** (commands 6-7) → Create restoration specification


