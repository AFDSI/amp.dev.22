The `triggers` block is located inside your **Section 3** (the `config` object).
It’s the largest part of that dictionary and sits right below the `requests` section.

Here is exactly where to insert the new timer code. I've highlighted the "insertion point" for you:

```jinja
{# 3. Initial Configuration Object #}
{% set config = {
  'vars': { ... },
  'extraUrlParams': { ... },
  'requests': { ... },

  'triggers': {
    {# --- INSERT THE NEW TIMERS HERE --- #}
    'timer30s': {
      'on': 'timer',
      'timerSpec': { 'interval': 30, 'limit': 1 },
      'vars': {
        'event_name': 'timer_30s',
        'event_category': category.value | default('other') | string,
        'event_action': 'read_minimum'
      }
    },
    'timer2m': {
      'on': 'timer',
      'timerSpec': { 'interval': 120, 'limit': 1 },
      'vars': {
        'event_name': 'timer_2m',
        'event_category': category.value | default('other') | string,
        'event_action': 'deep_read'
      }
    },
    {# --- END OF NEW TIMERS --- #}

    'defaultPageview': {
      'on': 'visible',
      'request': 'pageview',
      'vars': { 'title': title | default('Untitled Page') }
    },
    'cls': { 'on': 'visible', 'request': 'CWV_EVENT', 'extraUrlParams': { 'cls': '${' ~ 'cumulativeLayoutShift}' } },
    'lcp': { 'on': 'visible', 'request': 'CWV_EVENT', 'extraUrlParams': { 'lcp': '${' ~ 'largestContentfulPaint}' } },
    'fid': { 'on': 'visible', 'request': 'CWV_EVENT', 'extraUrlParams': { 'fid': '${' ~ 'firstInputDelay}' } }
  }
} %}

```

### Why put them here?

The `triggers` dictionary in AMP acts like a "listener" list. By placing the timers here, AMP starts the clock the moment the page finishes loading.

### What this does in GA4:

- **timer30s**: Fires once after 30 seconds. In your reports, this counts as an **"Engaged Session"**.
- **timer2m**: Fires once after 2 minutes. This identifies your "Power Users" who are likely actually implementing the code they see.
