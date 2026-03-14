# Mobile App Testing Guide

## Setup & Running

### 1. Database Seeding
Before testing, populate sample data:

```bash
# From your workspace root
psql -U postgres -d iota_db -f seed-data.sql
```

Or if using Docker:
```bash
docker exec -i <container_id> psql -U postgres -d iota_db < seed-data.sql
```

### 2. Start Backend Server
```bash
cd mobile/server
npm install  # if not already done
npm start  # should run on port 3000
```

Verify with:
```bash
curl http://localhost:3000/api/topics
```

### 3. Start Mobile App
```bash
cd mobile/client
npm start  # Starts Expo dev server
```

Press 'i' for iOS simulator or 'a' for Android simulator.

## Testing Scenarios

### Scenario A: Children Mode (Age < 13)

**Setup:**
1. Create new user with age = 10 during sign-up
2. Sign in with that account

**Expected Behavior:**
- Tab navigation shows: **Stories**, **Mood**, **Quizzes**, **Leaderboard**, **Profile**
- No Expression, Journal, Group, Query tabs visible

**Test: Browse Stories**
1. Tap **Stories** tab
2. Should show topic filter with "Science", "History", "Nature"
3. Tap "Science" → see "The Solar System Explorer" story
4. Tap story → opens story player

**Test: Story Player**
1. Camera view on top half (with emoji indicator)
2. Story content "Scene 1: Welcome to the Solar System" below
3. Progress bar at bottom (0% - 20%)
4. Scene counter: "1 of 5"
5. Emotion timeline shows random emoji selected every 2 seconds
6. Tap **Next** → advances to Scene 2 (progress: 20%)
7. Tap **Previous** → back to Scene 1
8. Tap **Next** repeatedly until Scene 5
9. At Scene 5, tap **Next** → Completion screen
   - Shows ✓ checkmark
   - "Story Completed!"
   - Dominant emotion with large emoji
   - Emotion stats: "😊 Happy: 5x", "😢 Sad: 3x", etc.
   - "Back to Stories" button

**Test: Mood Tracker**
1. Tap **Mood** tab
2. First time: See 8 emoji grid (😊😢🤩😌🤔😨😠😴)
3. Select "Happy" → highlight shows
4. Drag intensity slider to "4"
5. Tap tags: "school", "playtime"
6. Optional note: "Great day at school"
7. Tap **Save Mood** → Success alert
8. Form resets to fresh state
9. Return to Mood tab → See "Already checked in today!" message

**Test: Quizzes**
1. Tap **Quizzes** tab
2. See two quiz cards:
   - "Solar System Quiz" - 4 questions
   - "Rainforest Facts Quiz" - 3 questions
3. Tap "Solar System Quiz" → opens quiz player

**Test: Quiz Player**
1. Question 1: "How many planets are in our solar system?"
2. Options: [7], [8], [9], [10]
3. Tap option "8" → highlight shows selection
4. Progress bar: "Question 1 of 4"
5. Tap **Next** → Question 2
6. Answer all 4 questions (can verify on last question)
7. At Question 4, "Next" button changes to **Submit**
8. Tap **Submit** → Results screen
   - Large "75%" score (3 out of 4 correct)
   - "✓ Pass!" or "✗ Fail" depending on answers
   - "Correct: 3 out of 4"
   - Quiz title card
   - "Back to Quizzes" button

**Test: Leaderboard**
1. Tap **Leaderboard** tab
2. See "Your Rank" card at top:
   - Rank: 1
   - Score: 75 (from quiz)
3. Below: Leaderboard list with:
   - 🥇 Top player
   - 🥈 Second place
   - 🥉 Third place
   - 4+ players with rank numbers
4. User's row highlighted

### Scenario B: Teenager Mode (Age ≥ 13)

**Setup:**
1. Create new user with age = 15 during sign-up
2. Sign in with that account

**Expected Behavior:**
- Tab navigation shows: **Query**, **Expression**, **Journal**, **Group**, **Profile**
- No Stories, Mood, Quizzes, Leaderboard tabs visible

**Note:** Existing teenager features should work (these were created earlier)

## API Endpoints Verification

### In browser DevTools or Postman:

```
GET http://localhost:3000/api/topics
Response: [{ id, name, description, created_at }, ...]

GET http://localhost:3000/api/stories
Response: [{ id, title, description, content, topic_id, created_at }, ...]

GET http://localhost:3000/api/stories/{storyId}
Response: { id, title, content: [{ title: "Scene 1", content: "..." }, ...], ... }

GET http://localhost:3000/api/quizzes
Response: [{ id, title, description, topic_id, created_at }, ...]

GET http://localhost:3000/api/quizzes/{quizId}
Response: { id, title, questions: [{ id, question, options: ["a", "b", "c", "d"], correct_answer }, ...] }

POST http://localhost:3000/api/quizzes/{quizId}/submit
Body: { answers: { "question-uuid": "8" } }
Response: { score: 75, correctCount: 3, totalQuestions: 4, progress: {...} }

POST http://localhost:3000/api/moods
Body: { mood: "happy", mood_intensity: 4, tags: ["school", "playtime"], notes: "Great day" }
Response: { id, user_id, mood, mood_intensity, tags, notes, created_at }

GET http://localhost:3000/api/moods/today
Response: { id, user_id, mood, mood_intensity, ... } or null

GET http://localhost:3000/api/leaderboards
Response: [{ user_id, display_name, score, rank }, ...]
```

## Troubleshooting

### No data showing in lists:
- Check database seeding: `psql -d iota_db -c "SELECT COUNT(*) FROM stories;"`
- Restart backend server
- Clear Expo cache: Press 'c' in Expo dev console

### Stories showing but no scenes:
- Check if content is being parsed correctly
- Verify API response includes `content: [{ title, content }]` array
- Check browser console for parsing errors

### Quiz not submitting:
- Verify all questions answered before trying submit
- Check Bearer token is valid (should auto-refresh from AuthContext)
- Check backend logs for errors

### Camera not working:
- Grant camera permission when prompted
- Check iOS/Android permissions in device settings
- Try toggling camera off/on with button

### Age-based tabs not switching:
- Verify user.age is set during signup
- Check AuthContext properly loading user profile
- Reload app after signup (in Expo: press 'r')

## Performance Notes

- Stories with 5 scenes: ~50KB payload
- Quiz with 4 questions: ~20KB payload
- Emotion sampling: Every 2 seconds (adjustable)
- API calls use Bearer token authentication

## What's Working

✅ Age-based tab navigation
✅ Story browsing and reading
✅ Scene progression with camera overlay
✅ Emotion timeline (currently simulated)
✅ Quiz taking and scoring
✅ Leaderboard rankings
✅ Mood logging
✅ Database persistence

## What Needs Work

⏳ Real emotion detection (TensorFlow hook exists but not integrated)
⏳ Animation/transitions between screens
⏳ Offline story reading
⏳ Story completion badges/achievements
⏳ Age verification with parental consent

---

**After testing, provide feedback on:**
1. Which features work smoothly
2. Any crashes or errors
3. UI/UX improvements needed
4. Performance issues
5. Missing data or functionality
