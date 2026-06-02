# FanZone Multiplayer Penalty - Quick Start

## 🚀 What's New

The multiplayer penalty shootout is now live! Two players can face off in real-time:
- **Penalty Taker** (🎯): Chooses where to shoot (6 zones)
- **Goalkeeper** (🧤): Chooses where to dive (6 zones)

Game result is instant: if zones differ = GOAL ⚽, if same zone = SAVED 🧤

## 📋 Before You Play

1. **Enable Firebase Realtime Database** (one-time setup):
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Project: `fanzone-worldcup`
   - Build → Realtime Database → Create Database
   - Location: `us-central1`, Start in Test mode
   - Copy security rules from `DATABASE_SETUP.md`

2. **Sign In**: You need to be logged in (Google, Email, or Guest works)

3. **Complete Onboarding**: Just do it once (Country → Team → Username → Interests)

## 🎮 How to Play

### Solo Player:
1. Go to 🎮 Play page
2. Click "🥅 Solo Penalty" card
3. Take 5 penalties vs AI (35% save rate)
4. Earn 100 XP per goal

### Two Players (Online):
1. **Player 1**: Go to 🎮 Play → Click "⚡🥅 Multiplayer Penalty"
   - See "⏳ Waiting for opponent..."
   
2. **Player 2**: Go to 🎮 Play → Click "⚡🥅 Multiplayer Penalty"
   - Auto-joins as goalkeeper
   - Both see "✅ Opponent joined!"

3. **Both take turns**:
   - Taker selects a zone (↖↑↗↙↓↘) → Click "🎯 Shoot"
   - Keeper selects a zone → Click "🧤 Dive"
   - See instant result
   - Repeat 5 times

4. **Earn XP**: 100 XP per goal or save

## 📊 Scoring

| Outcome | Taker XP | Keeper XP |
|---------|----------|-----------|
| Goal (zones differ) | +100 | 0 |
| Save (zones match) | 0 | +100 |
| 5 Kicks | Up to 500 XP | Up to 500 XP |

## 🔧 If Something Breaks

| Problem | Solution |
|---------|----------|
| "Opponent loading..." forever | Check Firebase is enabled in console |
| Zones don't work | Refresh page, check console (F12) |
| Results never appear | Both must select before result shows |
| Opponent name missing | Database security rules might be wrong |

## 📚 Full Docs

- **Database Setup**: See `DATABASE_SETUP.md`
- **Testing Guide**: See `MULTIPLAYER_TESTING.md`
- **Code**: See `game/play.html` (search for "MULTIPLAYER PENALTY GAME")

## 🌐 Live URL

https://fanzone-five.vercel.app

## 👥 Test Account

You can:
- Use your own Google account
- Create a new email/password account
- Play guest (limited features)
- Open two browser windows and play against yourself!

---

**Questions?** Check the console logs (F12) for error messages or contact the dev team.
