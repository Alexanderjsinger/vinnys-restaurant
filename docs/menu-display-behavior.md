# Menu display behavior

Owner-requested Eastern service windows (2026-11-15): Lunch 11:00–15:00, Happy Hour 15:00–17:00, Dinner 17:00–23:00. Outside these windows the browsing default is Lunch; this fallback is not a claim that service is open.

`/menu` renders the current menu using America/Detroit timezone rules and rechecks on client arrival to avoid a prefetched selection from the previous service window. Explicit `#select-menu-*` links override the clock. User selections remain unchanged until navigation; no timer switches away from an actively browsed menu. Homepage expanders stay initially collapsed unless directly linked.

Happy Hour/Dinner menu details remain unavailable until owner-confirmed content is supplied. No lunch items are repurposed into those menus. The menu page has no extra Order CTA; header/footer links remain.

All expanders display “Select your menu”, bordered buttons, chevrons and expanded-state styling. The homepage storefront fills its full desktop grid panel using cover cropping; phones retain the stacked photo/story layout.
