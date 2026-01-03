
## track Core Web Vitals
- Largest Contentful Paint: ${largestContentfulPaint}
- Cumulative Layout Shift: ${cumulativeLayoutShift}
- First Input Delay: ${firstInputDelay}
```
<amp-analytics>
  <script type="application/json">
    {
      "requests": {
        "event": "https://amp-new.netlify.app/documentation/examples/advertising-analytics/tracking_core_web_vitals/ping?user=&account=ampdev&event=${eventId}",
        "CWV_EVENT": "${event}&type=CWV"
      },
      "triggers": {
          "cls": {
            "on": "visible",
            "request": "CWV_EVENT",
            "extraUrlParams": {
              "cls": "${cumulativeLayoutShift}"
            }
          },
          "lcp": {
            "on": "visible",
            "request": "CWV_EVENT",
            "extraUrlParams": {
              "lcp": "${largestContentfulPaint}"
            }
          },
          "fid": {
            "on": "visible",
            "request": "CWV_EVENT",
            "extraUrlParams": {
              "fid": "${firstInputDelay}"
            }
          },
        }
      }
    }
  </script>
</amp-analytics>
```

## track pageviews

The following tracks pageviews and uses the extraUrlParams feature to append the Core Web Vitals to the request URL.

```
<amp-analytics type="googleanalytics">
  <script type="application/json">
    {
      "vars": {
         "gtag_id": "UA-XXXXXXXXX-X",
         "config": {
           "UA-XXXXXXXXX-X": {
              "groups": "default"
           }
         }
      },
      "requests": {
        "event": "https://amp-new.netlify.app/documentation/examples/advertising-analytics/tracking_core_web_vitals/ping?user=&account=ampdev&event=${eventId}",
        "CWV_EVENT": "${event}&type=CWV"
      },
      "triggers": {
        "defaultPageview": {
          "on": "visible",
          "request": "pageview",
          "vars": {
            "title": "{{title}}"
          }
        },
        "cls": {
          "on": "visible",
          "request": "CWV_EVENT",
          "extraUrlParams": {
            "cls": "$CALC(${cumulativeLayoutShift}, 1000, multiply)"
          }
        },
        "lcp": {
          "on": "visible",
          "request": "CWV_EVENT",
          "extraUrlParams": {
            "lcp": "${largestContentfulPaint}"
          }
        },
        "fid": {
          "on": "visible",
          "request": "CWV_EVENT",
          "extraUrlParams": {
            "fid": "${firstInputDelay}"
          }
        }
      }
    }
  </script>
</amp-analytics>
```

## Comparing performance on AMP Cache vs Origin

- Below we assume your index was "1", (i.e. cd1). If your Index is 2, then use cd2, etc.

```
<amp-analytics>
  <script type="application/json">
    {
      "vars": {
         "gtag_id": "UA-XXXXXXXXX-X",
         "config": {
           "UA-XXXXXXXXX-X": {
              "groups": "default"
           }
         }
      },
      "requests": {
        "event": "https://amp-new.netlify.app/documentation/examples/advertising-analytics/tracking_core_web_vitals/ping?user=&account=ampdev&event=${eventId}",
        "CWV_EVENT": "${event}&type=CWV"
      },
      "triggers": {
        "defaultPageview": {
          "on": "visible",
          "request": "pageview",
          "vars": {
            "title": "{{title}}"
          },
          "extraUrlParams": {
            "cd1": "${ampdocHost}"
          }
        },
        "cls": {
          "on": "visible",
          "request": "CWV_EVENT",
          "extraUrlParams": {
            "cls": "$CALC(${cumulativeLayoutShift}, 1000, multiply)"
          }
        },
        "lcp": {
          "on": "visible",
          "request": "CWV_EVENT",
          "extraUrlParams": {
            "lcp": "${largestContentfulPaint}"
          }
        },
        "fid": {
          "on": "visible",
          "request": "CWV_EVENT",
          "extraUrlParams": {
            "fid": "${firstInputDelay}"
          }
        }
      }
    }
    </script>
</amp-analytics>
```
