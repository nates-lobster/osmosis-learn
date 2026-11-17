# Osmosis

A local-first adaptive MCQ practice app. Open `index.html` in a modern browser; no account, API, build step, or server is required. Progress and question banks are stored in the ignored `user_data/osmosis-state.json` file by the local server. A browser `localStorage` copy is kept as a fallback and migration source.

## What it does

- Runs short adaptive sessions that prioritize unseen, weak, and overdue ideas.
- Tracks accuracy, response time, and recency for each parent idea. Related questions share a small confidence signal when a response is missed.
- Keeps mastered ideas in the rotation (adjustable known-question mix); picks at most one phrasing variant from a parent idea per run.
- Lets you pause without counting break time, set batch size and sprint timing, and inspect topic-level strength.
- Imports and exports JSON locally. Download **Question format** in Settings for the full schema.

## Question bank format

An import can be a JSON array, or an object with a `questions` array. `answer` is a zero-based index into `options`. Variants use the same fields and are alternate phrasings of the same underlying idea.

```json
[
  {
    "id": "bio-01",
    "chapter": "Cell biology",
    "topic": "Membranes",
    "keywords": ["osmosis", "transport"],
    "question": "A cell is placed in a hypotonic solution. What happens?",
    "options": ["It shrinks", "It gains water", "Nothing", "It pumps water out"],
    "answer": 1,
    "explanation": "Water moves toward the higher solute concentration.",
    "variants": [
      {"question": "Which direction does water move in a hypotonic solution?", "options": ["Out", "Into the cell", "No net movement", "It depends on ATP"], "answer": 1}
    ]
  }
]
```

This is a transparent heuristic, not an AI or validated spaced-repetition algorithm. A fresh browser profile starts with the included sample biology bank. Use Export JSON to keep a backup before clearing browser data.

## Run locally

Because the app uses ES modules and needs to persist data into a file, run the included standard-library Python server rather than opening `index.html` directly:

```sh
python server.py
```

Then open `http://localhost:8000`. It creates `user_data/osmosis-state.json` on the first save. That directory is excluded by `.gitignore`, so syncing or updating the repository does not overwrite your question bank or progress. Back up that file if you want a separate copy of your study data. The server binds to `127.0.0.1` by default, so it is only available on your laptop.

## Code layout

- `index.html` — app shell and view markup
- `server.py` — local static server plus JSON persistence API
- `user_data/` — generated per-user state; intentionally git-ignored
- `ARCH-LINUX.md` — Arch Linux install, run, and update steps
- `css/app.css` — styling and themes
- `js/app.js` — navigation, run configuration, session flow, and interactions
- `js/data.js` — local persistence and recall scoring
- `js/sample-bank.js` — bundled sample questions
- `js/map.js` — constellation layout and interactive dots
