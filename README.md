# Cosa guardo stasera?

App front-end per scegliere un film in base a mood, tempo, vibe e lingua. Le proposte provengono da TMDB Discover; preferiti, film scartati e risultati già mostrati vengono gestiti nel browser.

## Avvio

1. Installa Node.js LTS.
2. Nella cartella del progetto esegui `npm install`.
3. Copia `.env.example` in `.env` e inserisci il Read Access Token TMDB in `VITE_TMDB_ACCESS_TOKEN`.
4. Avvia `npm run dev` e apri l'indirizzo mostrato da Vite.

Riavvia Vite dopo aver modificato `.env`. Non inserire il token nel codice o nei commit. Attenzione: Vite incorpora le variabili `VITE_*` nel client; un token usato dal browser è visibile nelle richieste e non può essere mantenuto segreto in un sito statico pubblico. Per la produzione pubblica usa un proxy/backend.

## Struttura

- `index.html`: questionario a passaggi.
- `results.html`: tre proposte dimostrative e watchlist.
- `css/style.css`: stile responsive.
- `js/app.js`: navigazione, ricerca, risultati e watchlist.
- `js/moodEngine.js`: risposte del questionario in filtri TMDB Discover.
- `js/tmdb.js`: richieste API e URL delle immagini.
- `js/storage.js`: watchlist, scarti, film già proposti e ultima ricerca.
- `vite.config.js`: build multipagina per home e risultati.

## TMDB (fase successiva)

Per ottenere il Read Access Token, crea un account su [themoviedb.org](https://www.themoviedb.org/), apri le impostazioni API e richiedi le credenziali API v3. Inserisci il token solo nel file `.env` locale, escluso da Git.

L'attribuzione richiesta da TMDB è riportata nella pagina dei risultati. Questo prodotto utilizza la TMDB API ma non è approvato né certificato da TMDB.
