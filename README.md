# Fortify

[Siege](https://siege.hackclub.com), but an alt client. Also exposes a fully functional Siege API that you can access with your `_siege_session` cookie (subject to change at any time).

## Versions

Here are some versions of this website, in case you want to see what it looked like in the past.

- Siege Week 9 submission (2025-11-03): [demo video](https://hc-cdn.hel1.your-objectstorage.com/s/v3/0222b1942f61b698f3b21a8ea860968c51cfc35b_fortify.mp4) | [link to this version](https://61fca41c.fortify-4k6.pages.dev)
- Siege Week 10 submission (2025-11-09): [demo video](https://hc-cdn.hel1.your-objectstorage.com/s/v3/a8555b27d4aded3d31d5f65b9e2438e8f1e85cca_fortify2.mp4) | [link to first commit this week](https://github.com/david-why/fortify/commit/8a48731037a9953742082368ffc5e2ca0a1d075c) | [link to this version](https://53b1a3a8.fortify-4k6.pages.dev) | features added:
  - Settings page
  - Market page (device upgrades & other stuff)
  - Armory explore page, with a **_GRID_** view!
- Siege Week 11 submission (TBD): demo video | [link to first commit this week](https://github.com/david-why/fortify/commit/1d5fdacfc43fb70d784f523921e7e00f6ec7f19a) | link to this version | features added:
  - WIP [API docs](./siege_api_schema.yml) for Siege's internal APIs. [Browse here](https://petstore.swagger.io/?url=https://raw.githubusercontent.com/david-why/fortify/refs/heads/main/siege_api_schema.yml)
  - Stonemason review page
  - My Space page, analogous to the Siege Keep page
  - The @Fortify bot, which lets you view and edit Siege projects right from Slack! Try the `/siege-fortify` command from any channel!
- Latest version: [link](https://fortify.davidwhy.me)

## Features & TODO

- [x] Home page
  - [ ] Text-based version for mobile
- [x] Keep (Space)
- [x] Armory
  - [x] View projects
  - [x] Create project
  - [x] Edit & delete projects
  - [x] Explore others' projects
- [x] Great Hall
  - [x] Voting
  - [x] Vote again (when enabled)
- [x] Market
  - [x] Item upgrades
  - [x] Cosmetics
  - [x] "Physical" items
- [ ] Chambers
- [x] Stonemason reviews
- [ ] Final reviews
- [x] Settings (Fortify-specific)
  - [x] Disabling jumpscares

## Tech stack

This is my first Nuxt project! It's a full-stack web framework using Node.js (in my case Bun because it's superior) and Vue.

## Attribution

Many of the assets are made by the original creators of the official Siege website.

No AI was used to write code in this project.
