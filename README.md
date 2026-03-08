# Spacerek – spacer w ciemno (PoC, darmowy)

Aplikacja webowa do odkrywania ciekawych miejsc w okolicy poprzez losowy spacer.  
**Wersja PoC:** bez kluczy API – mapa i miejsca z darmowych źródeł (OpenStreetMap).

**Repo:** [github.com/khipis/spacerek](https://github.com/khipis/spacerek)  
**Strona (GitHub Pages):** [khipis.github.io/spacerek](https://khipis.github.io/spacerek)

## Wypchnięcie kodu do repo i deploy

1. **Pierwszy raz (w katalogu `spacerek`):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit – Spacerek"
   git branch -M main
   git remote add origin https://github.com/khipis/spacerek.git
   git push -u origin main
   ```

2. **Włącz GitHub Pages (Actions):**  
   W repozytorium na GitHubie: **Settings** → **Pages** → **Build and deployment** → Source: **GitHub Actions**.  
   Przy każdym `git push` do `main` workflow `.github/workflows/deploy-pages.yml` wdroży stronę pod adresem **https://khipis.github.io/spacerek/**.

3. **Kolejne zmiany:** zwykły push wystarczy, deploy zrobi się sam.
   ```bash
   git add .
   git commit -m "Opis zmian"
   git push
   ```

## Uruchomienie lokalne

**HTTPS** – geolokalizacja działa tylko przez HTTPS (lub localhost). Lokalnie:
- `npx serve .` w katalogu projektu → `http://localhost:3000` (na localhost geolokacja często działa),
- lub zdeployuj na jeden z hostów poniżej (HTTPS z automatu).

## Wdrożenie na WWW (bezbolesne, darmowe)

Aplikacja to zwykłe pliki: `index.html`, `styles.css`, `app.js`. Żadnego buildu – wystarczy wrzucić folder na hosting statyczny.

### 1. Netlify Drop (najszybsze, bez konta w Git)
1. Wejdź na [app.netlify.com/drop](https://app.netlify.com/drop).
2. Zarejestruj się / zaloguj (darmowe konto).
3. Przeciągnij **cały folder `spacerek`** (z plikami `index.html`, `styles.css`, `app.js`) w okno „Drag and drop your site output folder”.
4. Netlify od razu da Ci link typu `https://random-name-123.netlify.app`. Gotowe.

### 2. Vercel (równie proste)
1. Zainstaluj CLI: `npm i -g vercel`.
2. W katalogu `spacerek`: `vercel` (pierwszy raz zapyta o logowanie).
3. Potwierdź katalog (`.`), Vercel wgra pliki i poda link.

### 3. GitHub Pages (już skonfigurowane dla tego repo)
Dla [khipis/spacerek](https://github.com/khipis/spacerek) deploy jest zautomatyzowany: po **Settings → Pages → Source: GitHub Actions** strona jest pod **https://khipis.github.io/spacerek/**.

### 4. Cloudflare Pages
1. [pages.cloudflare.com](https://pages.cloudflare.com) → **Create a project** → **Direct Upload**.
2. Spakuj folder `spacerek` (zip) i wgraj. Cloudflare da Ci domenę `*.pages.dev`.

---

**Ważne:** Po wdrożeniu otwieraj aplikację przez **HTTPS** (wszyscy powyżej go dają). Na telefonie najlepiej wejść bezpośrednio w link – geolokalizacja wtedy działa.

## Technologie (darmowe)

| Funkcja        | Źródło                |
|----------------|------------------------|
| Mapa           | **Leaflet** + kafelki **OpenStreetMap** |
| Wyszukiwanie miejsc | **Overpass API** (dane OSM: parki, muzea, restauracje, atrakcje) |
| Lokalizacja    | `navigator.geolocation` |

Żadnych kluczy API ani rejestracji.

## Zasada działania

- Wybierasz zasięg: 1 km lub 2 km.
- Aplikacja szuka w OpenStreetMap miejsc (parki, muzea, restauracje, kawiarnie, atrakcje, zabytki) w tym promieniu.
- Losuje jedno miejsce i **nie pokazuje** jego lokalizacji.
- Spacerujesz w dowolnym kierunku; aplikacja śledzi pozycję i odległość do celu.
- Gdy dojdziesz na odległość **&lt; 50 m**, pokazuje się nazwa i krótki opis typu miejsca (bez zdjęć – OSM ich nie udostępnia w tym API).

## Pliki

- `index.html` – struktura, ekran startowy i mapy
- `styles.css` – stylowanie, responsywność 320–800 px
- `app.js` – logika: geolokalizacja, Leaflet, Overpass API, odległość (Haversine), flow

Żadnych pakietów – tylko HTML, CSS i vanilla JS + Leaflet i OSM z CDN.
