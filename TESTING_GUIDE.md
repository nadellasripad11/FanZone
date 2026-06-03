# FanZone Testing Guide - June 2026

## Quick Start Testing

### 1. Guest User Flow (No Sign-in)
**Purpose:** Verify guest data persists and can be accumulated without authentication

Steps:
1. Open app without signing in
2. Click "Skip — browse as guest"
3. Go to React Live tab
4. Post 3+ reactions
5. Open DevTools → Application → LocalStorage
6. Search for "fz_guest_id" - should show a persistent ID
7. Search for "fz_stats_" + the guest ID - should show reactions count
8. Refresh page - verify reactions still there
9. Go to Profile → check stats are preserved

**Expected:** Guest ID persists, stats accumulate, data survives page refresh

---

### 2. Sign-In and Guest Data Migration
**Purpose:** Verify guest data migrates to authenticated user

Steps:
1. As guest user (from test #1), note your XP/reaction count
2. Click Profile → Sign Out
3. Sign in with Google or Email
4. Complete onboarding
5. Check Profile → verify reaction count and XP migrated
6. Search LocalStorage for your user UID - should have all data

**Expected:** Old guest data appears under authenticated user ID, guest ID data cleared

---

### 3. Penalty Game - Solo Mode
**Purpose:** Verify solo penalty game works without video

Steps:
1. Go to React Live tab
2. Click "🥅 Penalty" tab
3. Select "🤖 vs AI"
4. Kick penalties (click direction arrows)
5. Complete 5 kicks
6. Verify score updates
7. Verify XP awarded at game end

**Expected:** Game plays smoothly, kicks animate, scores update, XP increases

---

### 4. Penalty Game - Multiplayer Room Creation
**Purpose:** Verify room creation with proper validation and timeout

Steps:
1. Go to Penalty tab
2. Select "📹 vs Friend"
3. Click "➕ Create Room"
4. Room code appears (6 characters)
5. Copy code and share
6. Verify "⏳ Waiting for Friend..." message
7. Check Firebase: `penalty_rooms/{code}` exists with expiresAt 30min in future
8. Wait or manually test room expiration (check code > expiresAt)
9. Try to join expired room - should get "Room expired" message

**Expected:** Room created, waiting screen shows, code visible, room expires in 30 min

---

### 5. Penalty Game - Multiplayer Join
**Purpose:** Verify joining rooms works with proper validation

Steps:
1. Open app in 2 browser windows (or incognito)
2. Window A: Create penalty room, copy code
3. Window B: Click "Penalty" tab → "📹 vs Friend"
4. Click "🔗 Join Room"
5. Enter code from Window A
6. Verify videos appear in both windows
7. Verify game starts with "You kick first" / "Opponent kicks first"
8. Play kicks and verify both see scores update

**Expected:** Join succeeds, video chat starts, game syncs between players

---

### 6. WebRTC Video Chat - Error Handling
**Purpose:** Verify camera/mic permission errors handled gracefully

Steps:

**Test 6a - Deny Permission:**
1. Create multiplayer penalty room
2. When prompted for camera access, click "Block"
3. Verify message: "❌ Camera/Mic permission denied. You can still play!"
4. Verify game still playable (video grid hidden)

**Test 6b - No Camera (Simulator/VM):**
1. In VM/simulator with no camera, create multiplayer room
2. Verify message: "❌ No camera/mic found on this device"
3. Game still works

**Test 6c - HTTPS Error (If on HTTP):**
1. Try penalty multiplayer on HTTP-only connection
2. Should get: "❌ HTTPS required for camera access"

**Expected:** Specific error messages, game still playable without video

---

### 7. Firebase Retry Logic
**Purpose:** Verify exponential backoff retry mechanism works

Steps (need to simulate network issues):
1. Open DevTools → Network tab
2. Set throttling to "Slow 3G"
3. Post reaction in Live tab
4. Should see POST attempt, potentially auto-retries
5. Eventually succeeds (or fails with "Failed to post")

Alternative (advanced):
1. Use DevTools → Network → Block URL pattern
2. Block `.../live_reactions/...`
3. Try posting reaction
4. Should retry 3 times with exponential backoff
5. Finally show error message

**Expected:** Reaction posts despite network issues (with retry), or clear error after 3 attempts

---

### 8. Room Code Validation
**Purpose:** Verify room code format validation

Steps:
1. Create penalty multiplayer room
2. Go to join in another window
3. Try invalid codes:
   - Too short: "ABC" → "❌ Room codes are 6 characters"
   - Too long: "ABCDEFGH" → Same error
   - Non-existent: "ZZZZZZ" → "❌ Room not found! Check the code"
   - Active game code: Create 2 rooms, join first, try joining second with first code → "❌ Game already in progress"

**Expected:** Clear validation messages for each scenario

---

### 9. Clash Tab
**Purpose:** Verify Clash content displays and voting works

Steps:
1. Go to "🎮 Clash" tab
2. Verify 4 clash cards appear with:
   - Question text
   - Two voting options (A and B)
   - Percentage bars
   - Vote buttons
   - Chat/comments section
3. Click vote button
4. Verify:
   - Button shows checkmark
   - Score updates slightly (±2%)
   - Button becomes disabled
5. Switch to "My Votes" tab - should show your voted clashes
6. Switch to "History" - should show closed clash

**Expected:** All clashes display, voting works, percentages update, tabs work

---

### 10. Profile Data Persistence
**Purpose:** Verify all profile metrics persist across sessions

Steps:
1. Post several reactions
2. Play penalty game(s)
3. Vote on clashes
4. Open Profile page
5. Note down all stats: XP, Reactions, Streak, etc.
6. Clear browser cache (but NOT site data)
7. Reload page
8. Verify stats still showing same values
9. Do one more reaction
10. Stats should increment

**Expected:** All stats persist, new activities increment properly

---

### 11. Streak System
**Purpose:** Verify daily streak counting and per-device validation

Steps:
1. Post 1 reaction
2. Check Profile → streak shows "1"
3. Wait 1 minute
4. Post another reaction on same device
5. Streak should stay "1" (already counted today)
6. Open app in different browser/device
7. Post reaction on new device
8. Check both devices' profiles
9. Each shows "1" (device-specific)

**Expected:** Streaks are per-device, not global

---

### 12. YouTube Prompt
**Purpose:** Verify YouTube subscription prompt appears once per day

Steps:
1. Sign in or continue as guest
2. Navigate to Home page
3. YouTube prompt should appear (red modal with "Subscribe to RESSI")
4. Click "Maybe Later"
5. Reload page
6. Prompt should NOT appear again (already shown today)
7. Change device date forward 1 day (or clear localStorage)
8. Prompt should appear again

**Expected:** Prompt shows once per day per user

---

## Network Condition Testing

### Test with Slow Network
```javascript
// DevTools → Network → Throttling → Slow 3G
// Then test:
// - Posting reactions
// - Creating penalty room
// - Joining penalty room
// - Any Firebase operation
```

**Expected:** Operations eventually succeed with retries, not instant failure

### Test with Offline
```javascript
// DevTools → Network → Offline
// - Try posting reaction → Error message
// - Try creating room → Error message
// - Go back Online
// - Operations should work again
```

---

## Performance Metrics to Monitor

### CPU Usage
- Monitor while WebRTC video chat active
- Should be <30% on modern device
- Check for memory leaks in DevTools (should return to baseline after game ends)

### Memory Usage
- Open DevTools → Memory tab
- Take heap snapshot before game
- Play penalty game with video
- Take heap snapshot after game ends
- Should return close to baseline (not accumulate)

### Network Traffic
- DevTools → Network tab
- Observe request patterns
- Should see Firebase calls, not excessive data

---

## Troubleshooting

### Issue: Guest data not persisting
**Solution:** Check localStorage hasn't been cleared. Look for "fz_guest_id" key.

### Issue: Video chat not working
**Solution:** 
1. Check HTTPS is being used
2. Check camera/mic are not in use by another app
3. Check browser permissions allow camera
4. Try different browser

### Issue: Penalty room join fails
**Solution:**
1. Verify room code is exactly 6 characters
2. Verify room wasn't created >30 minutes ago
3. Check network connection
4. Try creating new room

### Issue: Reactions not posting
**Solution:**
1. Check network in DevTools
2. Look at Firebase error in console
3. Try again (retry logic should work)
4. Check you're signed in

---

## Regression Testing Checklist

- [ ] Guest user can accumulate stats without sign-in
- [ ] Guest data migrates to authenticated user
- [ ] Solo penalty game works and awards XP
- [ ] Multiplayer penalty room creates with code
- [ ] Multiplayer penalty join works with validation
- [ ] Video chat handles permission denials gracefully
- [ ] Video streams clean up (no memory leaks)
- [ ] Reactions post with retry logic
- [ ] Clash tab displays all content
- [ ] Clash voting updates percentages
- [ ] Room codes validate format and expiration
- [ ] Firebase operations retry on network errors
- [ ] WebRTC uses TURN servers for NAT traversal
- [ ] Profile data persists across sessions
- [ ] Streaks are per-device
- [ ] YouTube prompt shows once per day
- [ ] All error messages are user-friendly

---

## Success Criteria

✅ All items in regression testing checklist passing = Ready for production

❌ Any item failing = Investigate and fix before deployment
