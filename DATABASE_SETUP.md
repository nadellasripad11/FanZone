# Firebase Realtime Database Setup

The multiplayer penalty shootout feature requires Firebase Realtime Database to be enabled.

## Manual Setup (Firebase Console)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project **fanzone-worldcup**
3. In the left sidebar, go to **Build** → **Realtime Database**
4. Click **Create Database**
5. Choose location: **us-central1** (or your preferred region)
6. Start in **Test mode** (or copy the security rules below)

## Security Rules

In the Realtime Database Rules tab, paste these rules:

```json
{
  "rules": {
    "mp_games": {
      "$gameId": {
        ".read": "root.child('mp_games').child($gameId).child('players').child('host').child('uid').val() === auth.uid || root.child('mp_games').child($gameId).child('players').child('guest').child('uid').val() === auth.uid",
        ".write": "root.child('mp_games').child($gameId).child('players').child('host').child('uid').val() === auth.uid || root.child('mp_games').child($gameId).child('players').child('guest').child('uid').val() === auth.uid || newData.parent().child('status').val() === 'waiting'",
        ".validate": "newData.hasChildren(['gameId', 'status', 'players'])",
        "players": {
          ".validate": "newData.hasChildren(['host'])",
          "host": {
            ".validate": "newData.hasChildren(['uid', 'name', 'role', 'zone', 'score'])"
          },
          "guest": {
            ".validate": "newData.val() === null || newData.hasChildren(['uid', 'name', 'role', 'zone', 'score'])"
          }
        }
      }
    }
  }
}
```

## How It Works

1. **Player 1** clicks "Multiplayer Penalty" → creates a room in `/mp_games/{gameId}`
2. **Player 2** clicks "Multiplayer Penalty" → joins the waiting room
3. Once connected, both players see each other and independently select zones
4. When both have selected, the round resolves automatically
5. Game continues for 5 rounds
6. XP is awarded based on performance

## Database Structure

```
/mp_games/
  {gameId}/
    gameId: string
    status: "waiting" | "active" | "finished"
    createdAt: number (timestamp)
    kicks: number (0-5)
    history: array
    players:
      host:
        uid: string
        name: string
        role: "taker" | "keeper"
        zone: number (0-5) | null
        score: number
      guest:
        uid: string | null
        name: string | null
        role: "taker" | "keeper" | null
        zone: number (0-5) | null
        score: number | null
```
