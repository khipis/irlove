# IRLove / IRLike – Mini Local Dating App

Lekka aplikacja w przeglądarce do spontanicznych spotkań IRL: użytkownicy widzą się na mapie w promieniu 2 km, mogą ustawić profil (nick, wiek, avatar, dostępność: pogadać / randka / piwo) i pisać szyfrowane wiadomości.

**Języki:** PL | EN

---

## Demo / deploy

- **GitHub Pages (auto-deploy):** po pushu na `main` strona jest pod **https://khipis.github.io/irlove/**  
  W repozytorium: **Settings → Pages → Build and deployment → Source: GitHub Actions.**

Aby aplikacja działała w pełni (realtime, czat), potrzebny jest **relay Gun.js**. Wdróż serwer (patrz niżej) i ustaw URL relay w aplikacji:

```html
<script>window.IRLOVE_RELAY_URL = 'https://twoj-relay.example/gun';</script>
```

przed załadowaniem skryptów w `index.html`, albo zmień domyślny URL w `js/core/config.js`.

---

## Uruchomienie lokalne

1. **Frontend (tylko mapa + profil, bez syncu):**  
   Otwórz `index.html` przez serwer HTTP (np. `npx serve .` lub `python3 -m http.server 8000`).  
   Geolokalizacja na localhost często działa bez HTTPS.

2. **Z relay (realtime + czat):**  
   Uruchom relay (patrz niżej), ustaw `IRLOVE_RELAY_URL` na `http://localhost:8765/gun` (lub swój URL) i odpal frontend przez HTTP/HTTPS.

---

## Relay Gun.js (serwer)

Minimalny serwer do synchronizacji lokalizacji i wiadomości. **Nie przechowuje treści czatu w plaintext** – szyfrowanie E2E (Gun SEA) jest po stronie klienta.

### Lokalnie

```bash
cd server
npm install
npm start
```

Serwer nasłuchuje na `http://localhost:8765`.  
Dla testów z telefonem użyj tunelu (np. ngrok): `ngrok http 8765` i ustaw `IRLOVE_RELAY_URL` na podany adres HTTPS + `/gun`.

### Wdrożenie (Railway, Render, Fly.io)

- **Fly.io:** `fly launch` w katalogu `server`, ustaw zmienną `PORT` (zazwyczaj 8080).  
- **Railway / Render:** dodaj projekt z repozytorium, root build = `server`, komenda start = `npm start`, port z zmiennej `PORT`.

Po wdrożeniu ustaw w aplikacji:  
`window.IRLOVE_RELAY_URL = 'https://twoja-aplikacja.fly.dev/gun';` (lub odpowiedni URL).

---

## Funkcje

| Funkcja | Opis |
|--------|------|
| **Profil** | localStorage: nick, wiek, wzrost, avatar (emoji/URL), tagi: chat / date / beer |
| **Mapa** | Leaflet + OpenStreetMap, promień 2 km, marker użytkownika i innych „online” |
| **Obecność** | Aktualizacja pozycji co 5 s, widoczni tylko użytkownicy aktywni w ostatnich 15 s |
| **Czat** | Gun.js SEA – szyfrowanie E2E, wiadomości tylko między wybranymi użytkownikami |
| **Powiadomienia** | Opcjonalne powiadomienia przeglądarki o nowych osobach w pobliżu |

---

## Struktura projektu

- `index.html`, `styles.css`, `locales.js` – wejście, style, teksty PL/EN  
- `js/` – core (config, state), storage (profil), map (Leaflet), services (Gun), main.js  
- `server/` – relay Gun.js (Node.js), do wdrożenia osobno  
- `.github/workflows/deploy-pages.yml` – auto-deploy na GitHub Pages przy pushu do `main`

---

## Licencja

MIT (lub według wyboru autora).
