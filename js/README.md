# IRLove – frontend modules (vanilla JS)

Load order is defined in `index.html`. All modules attach to `window.IRLove`.

- **core/** – `config.js` (RADIUS_KM, RELAY_URL, storage keys), `state.js` (map, user, Gun, profile)
- **storage/** – `profile.js` (localStorage profile: displayName, age, height, avatar, tags)
- **ui/** – `locale.js` (applyLocale, i18n)
- **map/** – `map.js` (Leaflet + OSM, user marker, other users within 2 km, availability icons)
- **services/** – `gun.js` (Gun relay, location sync, presence, SEA chat)
- **main.js** – entry: profile form, go to map, chat overlay, notifications

To set relay URL (e.g. after deploying server): set `window.IRLOVE_RELAY_URL = 'https://your-relay.example/gun'` before loading the app scripts.
