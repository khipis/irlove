# JS module layout (vanilla, no ES modules – script order in index.html matters)

- **core/** – app state and config (`state.js`, `config.js`)
- **data/** – static data: character names, monster/animal/artifact names (`character-data.js`, `monster-names.js`, `animal-names.js`, `artifact-names.js`)
- **storage/** – localStorage: theme, experience, characters (`storage.js`)
- **ui/** – UI and locale: experience panel, applyLocale (`experience.js`, `locale.js`)
- **map/** – Leaflet map, markers, decorations, chests (`mapStyle.js`, `map.js`)
- **services/** – external APIs: Overpass (places), Wikipedia (`places.js`, `wiki.js`)
- **walk/** – walk flow, geolocation, stats, simulate arrival (`simulate.js`, `walk.js`)
- **main.js** – entry: init, event binding

All modules attach to `window.Spacerek`; load order is defined in `index.html`.
