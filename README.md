# FanZone

Real-time fan platform for World Cup 2026. Live match reactions, multiplayer penalty shootouts, and social XP — built to handle 100K+ concurrent users.

**Live:** https://fanzone-five.vercel.app

---

## Features

- **Live Reactions** — post emoji reactions during matches; feed updates in real-time across all viewers
- **Penalty Shootout** — solo vs. AI or 1v1 multiplayer with WebRTC video/audio chat
- **Match Predictions** — pick winners before kickoff, earn XP on correct calls
- **Auth** — Google, email/password, or guest sign-in with 2-step onboarding
- **XP & Profiles** — earn XP from reactions, goals, and referrals; view personal stats and viral moments

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JS, HTML/CSS |
| Auth & Database | Firebase Auth, Firestore, Realtime Database |
| Multiplayer | WebRTC (peer-to-peer video/audio), STUN/TURN |
| Live Data | football-data.org API, newsapi.org |
| Deploy | Vercel |

## Architecture

Single-page app with Firebase as the backend. Realtime reactions use Firestore with listeners capped at 100 documents to prevent runaway reads at scale. Room-based multiplayer uses Firebase Realtime Database for WebRTC signaling.

```
Browser → Firebase Realtime DB (signaling) → WebRTC (media)
       → Firestore (reactions, profiles, XP)
       → Vercel Functions (API proxy for football/news data)
```

## Running locally

```bash
git clone https://github.com/nadellasripad11/FanZone
cd FanZone
# Open index.html — no build step required
```

For Firebase: create a project, enable Auth + Realtime Database + Firestore, and add your config to `script.js`. See `DATABASE_RULES.json` for the security rules to apply.

## What I built and learned

- WebRTC peer connection setup: offer/answer exchange, ICE candidate gathering, STUN/TURN server configuration for NAT traversal
- Firebase security rules at scale: per-user write isolation, indexed queries for high-throughput reaction feeds
- Multiplayer room lifecycle: creation, joining, real-time score sync, cleanup on disconnect
- Frontend architecture without a framework: module pattern, event-driven state updates, toast notifications, optimistic UI
