# CallIt: Predict the next play. Beat the Analyst.

CallIt turns watching a match into a game. Before each key moment the fan predicts the outcome, a live AI analyst makes its own prediction with reasoning, and afterwards the app explains why it happened at the fan's level (Newcomer or Pro).

**Live demo:** https://call-it-fan-engagement.vercel.app/

## Problem
Fans often watch passively, and casual or new fans get lost in jargon and stats. This project targets the "Fan Engagement & Experience" track: moving users from watching to participating and understanding.

## How it works
1. Pick a fan level (Newcomer or Pro).
2. For each of 7 match moments, predict the outcome within 15 seconds.
3. See the result, the analyst's own call with its reasoning, and "why it happened" in your level's language.
4. Finish with a You vs Analyst score.
5. Use the Analyst Lab to type any match scenario for a live prediction, or chat with the analyst about the match so far.

## What is real vs simulated

| Area | Status |
|---|---|
| Play loop, timer and scoring | Real |
| Analyst predictions and reasoning | Real, live AI (Gemini API) through a server-side function |
| Analyst Lab (scenario and chat) | Real, live AI |
| Automatic fallback to pre-written answers when the AI is unavailable, shown with an OFFLINE badge | Real |
| The match itself ("Blue Hawks vs Red Lions", 7 scripted moments) | Simulated |
| Real-time sports data feed | Not implemented (future scope) |

## Tech stack
- React, TypeScript, Vite and Tailwind CSS for a fast, mobile-first front end.
- Vercel serverless functions to keep the API key off the browser.
- Gemini API for the analyst's predictions and explanations.

## Run locally
```
npm install
npm run dev
```
The `/api` functions run on Vercel, so locally the app uses the offline fallback unless a Vercel dev setup is used.
Other commands:
```
npm run build     # type check and production build
npm run preview   # preview the production build locally
npm run lint      # run the linter
```

## Environment variables
`GEMINI_API_KEY` and `GEMINI_MODEL` (set in Vercel project settings; never committed).

## Limitations and future scope
- Real live data feeds for real matches.
- Support for more sports.
- Squad rooms for predicting with friends.
- A shareable end-of-match story card.
