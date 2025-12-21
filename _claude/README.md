
## Directory organization
  - `_background`
  - `analysis`
  - `branches`
  - `decisions`
  - `features`

  * `features` is used for feature migration tracking.
  * `analysis` is used for Claude Code analysis outputs.
  * `branches` is used for branch tracking
  * `decisions` is used for a decision log; why we did what we did
  * `_background` is used to present relevant information used to design `amp-site-seach`, implement parts of `amp-site-seach`, and previous work to analyze and implement `amp-site-seach`.

### Background contains 4 sub directories

`01-preview` contains the original description for `amp-site-search`.

`02-examples-client-side` contains working version of the clinet side of `amp-site-search`.
`amp-site-search-client` includes a lightbox that displays a form, a form activated with autosuggest, and a `mustache` formatting engine that parse and displays informaion in the lightbox.

`03-deprecated-code-analysis` present documents that analyze a deprecated version of `amp-site-search`. In effect, this project is restoring a working implementation that was deprecated in the past.

`04-deprecated-code` includes the code that was removed by the deprecation process.

`05-claude-redux` includes the steps Claude Code previously developed to restore the deprecated code, update the code, and prepare the code for integration with a new repository (`amp.dev.22`).

## SCSS and Jinja and Node Events

A quick note about SCSS and Jinja libraries.

SCSS `frontend` is the first generation approach for defining CSS. SCSS `frontend` is based on BEM and is highly granular.

SCSS `frontend21` is a second generation approach for defining CSS. SCSS `frontend21` features less granular CSS components and is easier to understand and configure. Note that `frontend21` wraps some `frontend` assets.

Instances in `02-examples-client-side` use CSS that is compiled from SCSS assets defined in `frontend` and `frontend21`

Also, be aware that, since Google deprecated AMP 'site-search', the amp.dev repository was upgraded to support node events and node v-22. Here is an examples of manual changes made after 'site-search' was deprecated. `ev.headers['Content-Type'] || ev.headers['content-type'],`

Both `amp.dev.20` and `amp.dev.22` implement node events. But I did not want you to trip over the deprecated content that does not support node events.



