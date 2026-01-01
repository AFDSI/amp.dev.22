'use strict';

//importScripts('/workbox.js');

const workbox = new this.goog.SWLib();

// Static precaching of images
workbox.precache(
  /* START_PRECACHE_MANIFEST */ [
    {
      'url': '/static/image/arrow-blue.svg',
      'revision': 'a6f33901d01705a565a2e723f840c436',
    },
    {
      'url': '/static/image/arrow.svg',
      'revision': '52ec66cadebd140286fb6eaf764bfe33',
    },
    {
      'url': '/static/image/blog-icon.svg',
      'revision': '52069b075f99fa3e8fb0c0dd6dd5818f',
    },
    {
      'url': '/static/image/cheveron-down.svg',
      'revision': 'db8205481910116f1bd30a958c623b56',
    },
    {
      'url': '/static/image/close.svg',
      'revision': 'e2c01bb46e2dfc13ba65497cf7b76dca',
    },
    {
      'url': '/static/image/github.png',
      'revision': '0f101d83a8e372272757124af24b6281',
    },
    {
      'url': '/static/image/hamburger.svg',
      'revision': '168ec7289539feef81f1bb8a62178e23',
    },
    {
      'url': '/static/image/ic_open_in_new_black.svg',
      'revision': '0885970e0da2d1654c6fbf91369329b1',
    },
    {
      'url': '/static/image/ic_open_in_new_blue.svg',
      'revision': 'afe567cf51f984ce2cc85b4a3cb08ebe',
    },
    {
      'url': '/static/image/ic_open_in_new_white.svg',
      'revision': 'd3135d08a28aab1229ff50d7e7699790',
    },
    {
      'url': '/static/image/sprite.svg',
      'revision': 'e6d70508e708996150a5d8e5a09e2a40',
    },
    {
      'url': '/static/image/twitter.png',
      'revision': 'c073b0d05f4dee6dceb910848444a81a',
    },
    {
      'url': '/static/image/nav/back_arrow.png',
      'revision': 'ba07a190770fc636310cc3d98beadd0e',
    },
    {
      'url': '/static/image/nav/back_arrow.svg',
      'revision': '3d5a2874d9b47343fa993e2348695a74',
    },
    {
      'url': '/static/image/nav/close.png',
      'revision': '7d87190576b5979c3f85e0cf3507ba1f',
    },
    {
      'url': '/static/image/nav/close.svg',
      'revision': '17009be9ac59de19d031339c7542b862',
    },
    {
      'url': '/static/image/nav/next_level.png',
      'revision': '441fe94efecf15ee82a9bd9d2d3edbad',
    },
    {
      'url': '/static/image/nav/next_level.svg',
      'revision': 'd9c40735c6c5d41f0ed9ae369db0a4c4',
    },
    {'url': '/static/image/arrow_black_left_24px_.svg'},
    {'url': '/static/image/arrow_black_up_24px_.svg'},
    {'url': '/static/image/arrow_left.svg'},
    {'url': '/static/image/arrow_right.svg'},
    {'url': '/static/image/email.svg'},
    {'url': '/static/image/facebook.svg'},
    {'url': '/static/image/flexibility.svg'},
    {'url': '/static/image/googleplus.svg'},
    {'url': '/static/image/home_icon_flexibility.svg'},
    {'url': '/static/image/home_icon_performance.svg'},
    {'url': '/static/image/icon_important.svg'},
    {'url': '/static/image/icon_note.svg'},
    {'url': '/static/image/icon_read.svg'},
    {'url': '/static/image/icon_search.svg'},
    {'url': '/static/image/icon_tip.svg'},
    {'url': '/static/image/ic_close_black_18dp_2x.png'},
    {'url': '/static/image/iframe_placeholder_w2_h720_.png'},
    {'url': '/static/image/linkedin.svg'},
    {'url': '/static/image/ontomatica_logo_black_green_transparent_back_.svg'},
    {
      'url':
        '/static/image/ontomatica_logo_black_green_transparent_w480_h76_.png',
    },
    {'url': '/static/image/onto_logo_black_transparent_back_w300_h56_.png'},
    {'url': '/static/image/onto_logo_blue.svg'},
    {'url': '/static/image/onto_logo_w325_h60.svg'},
    {'url': '/static/image/onto_logo_w325_h60_optimised.svg'},
    {'url': '/static/image/onto_logo_w650_h60.svg'},
    {'url': '/static/image/onto_logo_white_black_back_w300_h59_.png'},
    {'url': '/static/image/onto_logo_white_transparent_back_w1083_h157_.png'},
    {'url': '/static/image/onto_logo_white_transparent_back_w407_h59_.png'},
    {'url': '/static/image/onto_symbol_green_transparent_back_.svg'},
    {'url': '/static/image/onto_symb_w421_h421.png'},
    {'url': '/static/image/onto_sym_green_transparent_back_w305_h365_.png'},
    {'url': '/static/image/onto_sym_white_black_back_w421_h421_.png'},
    {'url': '/static/image/oscars_placeholder_1.png'},
    {'url': '/static/image/performance.svg'},
    {'url': '/static/image/place_holder_wide.jpg'},
    {'url': '/static/image/reddit.svg'},
    {'url': '/static/image/return.svg'},
    {'url': '/static/image/texture-1.png'},
    {'url': '/static/image/tumblr.svg'},
    {'url': '/static/image/twitter.svg'},
  ] /* END_PRECACHE_MANIFEST */
);

// Runtime caching
const staleWhileRevalidate = workbox.strategies.staleWhileRevalidate();
workbox.router.registerRoute(
  /https:\/\/fonts\.googleapis\.com\/.*/,
  staleWhileRevalidate
);
//workbox.router.registerRoute(/https:\/\/cdn\.ampproject\.org\/.*/, staleWhileRevalidate);

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  // immediately claim the currently connected clients
  self.clients.claim();
});
