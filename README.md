# wordDotPit

wordDotPit is a word-collision game. The player submits one English word for a category, while other players submit their answers independently. The goal is to choose a valid word that collides with as few other players as possible.

## Current functionality

- Play repeated rounds in the `color` category.
- Play against simulated AI players.
- Normalize answers by lowercasing and folding accents. Canonicalize selected spelling variants and regular or irregular plurals.
- Reject empty, malformed, and unknown words with a specific validation reason.
- Calculate collision points for every player. See `Scoring`.

## Requirements

- Node.js
- Python 3

## Run locally

From the project directory:

```powershell
python -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) in a browser.

## AI modes

The default demo uses simulated AI players and does not require an API key.

To enable a real AI player, use an API key from your own provider. Keys are supplied through environment variables and should never be committed to GitHub.

General:

```powershell
$env:AI_PROVIDER="[your-choice]"
$env:OPENAI_API_KEY="[your-real-api-key]"
$env:OPENAI_MODEL="[your-chosen-model]"
python backend/server.py
```

Example 1 (work OK, free):

```powershell
$env:AI_PROVIDER="openrouter"
$env:OPENAI_API_KEY="[your-real-api-key]"
$env:OPENAI_MODEL="gpt-4o-mini"
python backend/server.py
```

Example 2:

```powershell
$env:AI_PROVIDER="openai"
$env:OPENROUTER_API_KEY="[your-real-api-key]"
$env:OPENROUTER_MODEL="gpt-4o-mini"
python backend/server.py
```

Then open [http://localhost:8000](http://localhost:8000). Real AI usage is billed or quota-limited by the provider account belonging to the user.

## Run tests

```powershell
npm test
```

## Scoring

For a valid answer, collision points equal the number of valid players who chose the same canonical word. A unique valid answer scores `1`. An invalid answer receives the number of scored players in that round.

## Beta notice

This is a beta version. Its English word list and category lexicons are intentionally small, so it does not cover the full (or a lot of) English vocabulary yet.

The current seed data focuses on basic words such as {`blue`, `green`, `red`, `brown`, `cyan`, `gray` (or `grey`), `purple`, `yellow`}.
