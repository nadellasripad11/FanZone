# Multiplayer Penalty Shootout - Testing Guide

## Setup Checklist

- [ ] Firebase Realtime Database is enabled in Firebase console
- [ ] Security rules are applied to `/mp_games` path
- [ ] Both players are signed in (can be same account or different accounts)
- [ ] Both players have completed onboarding
- [ ] App is deployed and accessible at https://fanzone-five.vercel.app

## Testing Steps

### Prerequisites
1. Open TWO browser windows/tabs (or use browser + incognito)
2. Both windows should be on https://fanzone-five.vercel.app/game/
3. Both users should be signed in (can be same user for testing)
4. Both should complete onboarding if needed

### Test Scenario 1: Basic Game Flow

**Window 1 (Penalty Taker):**
1. Sign in / create account
2. Navigate to 🎮 Play → Game Modes
3. Click "⚡🥅 Multiplayer Penalty" card
4. Should see message "🔄 Connecting to a player..."
5. Wait for opponent to join (should show "⏳ Waiting for opponent...")

**Window 2 (Goalkeeper):**
1. Sign in (can be same or different account)
2. Navigate to 🎮 Play → Game Modes
3. Click "⚡🥅 Multiplayer Penalty" card
4. Should see message "🔄 Connecting to a player..."
5. Should find the waiting room and auto-join as goalkeeper
6. Both windows should show "✅ Opponent joined!"

**Both Players - Game Play:**
1. Both should see the multiplayer penalty interface with:
   - "You (X)" and "Opponent (Y)" cards showing roles and scores
   - Left section: "Where to Shoot?" (for taker) - faded for goalkeeper
   - Right section: "Where to Dive?" (for keeper) - faded for taker
2. **Window 1 (Taker):** Click a zone (↖↑↗↙↓↘) → "🎯 Shoot" button enables → Click shoot
3. **Window 2 (Keeper):** Click a zone → "🧤 Dive" button enables → Click dive
4. Once both select, result appears:
   - If zones differ: "⚽ GOAL!" (green) - Taker scores
   - If zones match: "🧤 Saved!" (red) - Keeper scores
5. Zones show with visual feedback (green for successful, red for failure)
6. Next kick (2 of 5) displays

**Repeat for 5 kicks total**

### Test Scenario 2: Score Tracking

- After 5 kicks, game should end
- Both players should see final scores and XP awards
- Window 1 XP should increase by (number of goals × 100)
- Window 2 XP should increase by (number of saves × 100)
- Close button should appear to return to game modes

### Test Scenario 3: Real-time Sync

1. Have Window 1 (Taker) select a zone but DON'T click shoot yet
2. Have Window 2 (Keeper) select a zone and click dive
3. Window 2 should see result immediately (based on Window 1's zone)
4. Window 1 should still be waiting for Button 1 to click (zone selected)
5. Once Window 1 clicks shoot, final result is confirmed

### Test Scenario 4: Player Disconnect

1. Start a game (both players joined)
2. Have one player close the browser/tab mid-game
3. The other player should still see the game (might be waiting indefinitely)
4. Close the game manually with ✕ Close button
5. Both players return to game modes

### Expected Results

✅ **What Should Work:**
- Two players automatically paired
- Both see each other's names and roles
- Zone selection syncs in real-time
- Results calculated correctly (different zones = goal, same = save)
- XP awarded properly
- Game continues for all 5 kicks
- Both players see kick history (dots below goal)

❌ **What Might Need Fixing:**
- Opponent name not updating → Check Firebase security rules
- Zones not responding → Check zone selection click handlers
- Results not showing → Check Firebase data structure
- Infinite waiting → Check that guest player updates are firing

## Debugging Tips

### Check Firebase Realtime Database
1. Go to Firebase Console → fanzone-worldcup → Realtime Database
2. Look for `/mp_games/{gameId}/` entries
3. Verify `status`, `players.host`, `players.guest` are populated
4. Watch for real-time updates as players select zones

### Check Browser Console
1. Open DevTools (F12) in both windows
2. Look for errors related to Firebase
3. Should see success messages like "✅ Opponent joined!"
4. Should see XP updates when game ends

### Test with Console Logs
Add these to play.html for debugging:

```javascript
// In startMultiplayerPenalty():
console.log('Creating game', { gameId: mpState.gameId, role: mpState.role });

// In joinMpGame():
console.log('Joining game', { gameId, role: 'keeper' });

// In listenToMpGame():
console.log('Game state update', { me, opp, game });
```

## Common Issues & Fixes

### "Database loading..." toast
- Firebase modules not imported yet
- Wait a moment and try again
- Check browser console for import errors

### Opponent doesn't appear
- Firestore/Realtime Database not enabled
- Security rules blocking writes
- Check Firebase console for errors
- Try creating fresh game in new windows

### Zones don't highlight
- CSS not loading
- Check app.css for `.mp-zone.selected` class
- Try refreshing page

### Results never show
- Both players must select before result appears
- Check Firebase for zone values updating
- Ensure `mpState.oppZone` is being set

## Performance Notes

- Database is checked for opponent selection every listener update (real-time)
- No polling interval needed (Firebase handles real-time)
- Game rooms auto-cleanup after "finished" status
- Unused games (guests = null after timeout) should be manually deleted
