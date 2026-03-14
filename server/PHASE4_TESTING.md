# Phase 4: Mood, Journal, and Story Routes Testing Guide

## Summary

Phase 4 is complete. Implemented:

✅ **Mood Tracking**
- 6 endpoints for mood logging and analytics
- Real-time emotion tracking with intensity (1-10 scale)
- Mood analytics and trend analysis

✅ **Journal Entries**
- 6 endpoints for journal entries with search capability
- Support for tagged, private journal entries
- Full-text search across journal content

✅ **Story Hierarchy**
- Story model with categorization and difficulty levels
- Unit model (chapters within stories)
- Lesson model (lessons within units)
- Challenge model (exercises within lessons)
- 7 endpoints for exploring story hierarchy
- Public access to published stories

**Total Models Added:** 5 new (Mood, Journal, Story, Unit, Lesson, Challenge)
**Total Endpoints:** 19 (6 moods + 6 journals + 7 stories)
**Total Endpoints in System:** 32 (13 auth+user + 19 mood/journal/story)

---

## Prerequisites

1. **Phase 1-3 Complete** - All previous phases must be working
2. **Server Running** - `npm run dev`
3. **Valid User Account** - Create via signup endpoint
4. **Access Token** - From signin or signup response

---

## MOOD Endpoints

### 1. Create Mood Log

**Request:**
```bash
curl -X POST http://localhost:3000/api/moods \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "emotion": "anxious",
    "intensity": 7,
    "context": "Worried about test next week",
    "tags": ["school", "anxiety"],
    "physicalState": {"sleepQuality": "poor", "energy": "low"}
  }'
```

**Valid Emotions:** happy, sad, angry, anxious, calm, excited, neutral, confused, motivated, stressed

**Response (201):**
```json
{
  "message": "Mood logged successfully",
  "mood": {
    "id": "uuid",
    "userId": "uuid",
    "emotion": "anxious",
    "intensity": 7,
    "context": "Worried about test next week",
    "tags": ["school", "anxiety"],
    "physicalState": {"sleepQuality": "poor", "energy": "low"},
    "loggedAt": "2026-03-14T10:00:00.000Z",
    "createdAt": "2026-03-14T10:00:00.000Z",
    "updatedAt": "2026-03-14T10:00:00.000Z"
  }
}
```

### 2. Get User's Moods

**Request:**
```bash
curl "http://localhost:3000/api/moods?page=1&limit=10&emotion=anxious&startDate=2026-03-01&endDate=2026-03-31" \
  -H "Authorization: Bearer <accessToken>"
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `emotion` (optional: happy, sad, angry, anxious, calm, excited, neutral, confused, motivated, stressed)
- `startDate` (optional: ISO date)
- `endDate` (optional: ISO date)

**Response (200):**
```json
{
  "moods": [
    {
      "id": "uuid",
      "emotion": "anxious",
      "intensity": 7,
      "context": "...",
      "tags": ["school", "anxiety"],
      "loggedAt": "2026-03-14T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

### 3. Get Specific Mood

**Request:**
```bash
curl http://localhost:3000/api/moods/{moodId} \
  -H "Authorization: Bearer <accessToken>"
```

**Response (200):** Full mood object

### 4. Update Mood

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/moods/{moodId} \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "emotion": "calm",
    "intensity": 5,
    "context": "Updated after meditation"
  }'
```

**Response (200):** Updated mood object

### 5. Delete Mood

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/moods/{moodId} \
  -H "Authorization: Bearer <accessToken>"
```

**Response (200):** `{ "message": "Mood deleted successfully" }`

### 6. Mood Analytics

**Request:**
```bash
curl "http://localhost:3000/api/moods/analytics/summary?days=7" \
  -H "Authorization: Bearer <accessToken>"
```

**Query Parameters:**
- `days` (default: 7) - Number of days to analyze

**Response (200):**
```json
{
  "period": {
    "days": 7,
    "startDate": "2026-03-07T10:00:00.000Z",
    "endDate": "2026-03-14T10:00:00.000Z"
  },
  "summary": {
    "totalMoods": 12,
    "averageIntensity": 6.3,
    "mostCommonEmotion": "anxious",
    "emotionDistribution": {
      "anxious": 5,
      "calm": 4,
      "happy": 3
    }
  }
}
```

---

## JOURNAL Endpoints

### 1. Create Journal Entry

**Request:**
```bash
curl -X POST http://localhost:3000/api/journals \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Day Today",
    "content": "Today was a great day! I managed to complete all my homework and even helped my friend with math.",
    "emotion": "happy",
    "tags": ["gratitude", "personal-growth"],
    "prompt": "What went well today?",
    "isPrivate": true
  }'
```

**Response (201):**
```json
{
  "message": "Journal entry created successfully",
  "journal": {
    "id": "uuid",
    "userId": "uuid",
    "title": "My Day Today",
    "content": "...",
    "emotion": "happy",
    "tags": ["gratitude", "personal-growth"],
    "prompt": "What went well today?",
    "isPrivate": true,
    "entryDate": "2026-03-14T10:00:00.000Z",
    "createdAt": "2026-03-14T10:00:00.000Z",
    "updatedAt": "2026-03-14T10:00:00.000Z"
  }
}
```

### 2. Get User's Journals

**Request:**
```bash
curl "http://localhost:3000/api/journals?page=1&limit=10&emotion=happy&isPrivate=true&startDate=2026-03-01" \
  -H "Authorization: Bearer <accessToken>"
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `emotion` (optional)
- `isPrivate` (optional: true/false)
- `startDate` (optional: ISO date)
- `endDate` (optional: ISO date)

**Response (200):** Array of journals with pagination

### 3. Get Specific Journal

**Request:**
```bash
curl http://localhost:3000/api/journals/{journalId} \
  -H "Authorization: Bearer <accessToken>"
```

**Response (200):** Full journal entry object

### 4. Update Journal

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/journals/{journalId} \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated content...",
    "emotion": "calm",
    "isPrivate": false
  }'
```

**Response (200):** Updated journal object

### 5. Delete Journal

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/journals/{journalId} \
  -H "Authorization: Bearer <accessToken>"
```

**Response (200):** `{ "message": "Journal entry deleted successfully" }`

### 6. Search Journals

**Request:**
```bash
curl "http://localhost:3000/api/journals/search?q=homework&page=1&limit=10" \
  -H "Authorization: Bearer <accessToken>"
```

**Query Parameters:**
- `q` (required) - Search query
- `page` (default: 1)
- `limit` (default: 10)

**Response (200):** Array of matching journals with pagination

---

## STORY Endpoints

### 1. List All Stories

**Request:**
```bash
curl "http://localhost:3000/api/stories?page=1&limit=10&category=anxiety&difficulty=beginner"
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `category` (optional: anxiety, depression, social, academic, family, health, identity, general)
- `difficulty` (optional: beginner, intermediate, advanced)

**Response (200):**
```json
{
  "stories": [
    {
      "id": "uuid",
      "title": "Managing Anxiety",
      "description": "Learn techniques to manage anxiety...",
      "category": "anxiety",
      "difficultyLevel": "beginner",
      "estimatedDuration": 30,
      "viewCount": 145,
      "completionCount": 32,
      "units": [
        {
          "id": "uuid",
          "sequence": 1,
          "title": "Introduction"
        }
      ]
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 24, "totalPages": 3 }
}
```

### 2. Get Story with Full Hierarchy

**Request:**
```bash
curl http://localhost:3000/api/stories/{storyId}
```

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Managing Anxiety",
  "category": "anxiety",
  "units": [
    {
      "id": "uuid",
      "sequence": 1,
      "title": "Unit 1: Understanding Anxiety",
      "lessons": [
        {
          "id": "uuid",
          "sequence": 1,
          "title": "Lesson 1: What is Anxiety?",
          "challenges": [
            {
              "id": "uuid",
              "sequence": 1,
              "title": "Reflection: My Anxiety",
              "type": "reflection",
              "points": 10
            }
          ]
        }
      ]
    }
  ]
}
```

### 3. Get Story Units

**Request:**
```bash
curl http://localhost:3000/api/stories/{storyId}/units
```

**Response (200):**
```json
{
  "storyId": "uuid",
  "storyTitle": "Managing Anxiety",
  "units": [
    {
      "id": "uuid",
      "sequence": 1,
      "title": "Unit 1: Understanding Anxiety",
      "lessons": [...]
    }
  ]
}
```

### 4. Get Specific Unit

**Request:**
```bash
curl http://localhost:3000/api/stories/{storyId}/units/{unitId}
```

**Response (200):** Unit with all lessons and challenges

### 5. Get Specific Lesson

**Request:**
```bash
curl http://localhost:3000/api/stories/{storyId}/units/{unitId}/lessons/{lessonId}
```

**Response (200):** Lesson with all challenges

### 6. Get Specific Challenge

**Request:**
```bash
curl http://localhost:3000/api/stories/{storyId}/units/{unitId}/lessons/{lessonId}/challenges/{challengeId}
```

**Response (200):**
```json
{
  "id": "uuid",
  "sequence": 1,
  "title": "Reflection: How I Feel",
  "type": "reflection",
  "prompt": "Describe what anxiety feels like to you...",
  "hints": ["Think about physical sensations", "..."],
  "points": 10,
  "isOptional": false
}
```

### 7. Get Stories by Category

**Request:**
```bash
curl "http://localhost:3000/api/stories/by-category/anxiety?page=1&limit=10"
```

**Response (200):** Array of stories in that category with pagination

---

## Error Cases

### Missing Authorization (Protected Endpoints)

**Request:**
```bash
curl -X POST http://localhost:3000/api/moods \
  -H "Content-Type: application/json" \
  -d '{"emotion":"happy","intensity":5}'
```

**Response (401):**
```json
{
  "error": "Not authenticated"
}
```

### Invalid Emotion

**Request:**
```bash
curl -X POST http://localhost:3000/api/moods \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"emotion":"unknown","intensity":5}'
```

**Response (400):**
```json
{
  "error": "Emotion must be one of: happy, sad, angry, anxious, calm, excited, neutral, confused, motivated, stressed"
}
```

### Invalid Intensity

**Request:**
```bash
curl -X POST http://localhost:3000/api/moods \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"emotion":"happy","intensity":15}'
```

**Response (400):**
```json
{
  "error": "Intensity must be between 1 and 10"
}
```

### Non-existent Resource

**Request:**
```bash
curl http://localhost:3000/api/moods/00000000-0000-0000-0000-000000000000 \
  -H "Authorization: Bearer <accessToken>"
```

**Response (404):**
```json
{
  "error": "Mood not found"
}
```

---

## Testing Workflow

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"
TOKEN="<accessToken>"

# 1. Create mood
MOOD=$(curl -s -X POST $BASE_URL/api/moods \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"emotion":"happy","intensity":8,"tags":["good-day"]}')
MOOD_ID=$(echo $MOOD | jq -r '.mood.id')
echo "✅ Created mood: $MOOD_ID"

# 2. List moods
curl -s "$BASE_URL/api/moods?page=1&limit=5" -H "Authorization: Bearer $TOKEN" | jq '.moods[0]'
echo "✅ Listed moods"

# 3. Get mood analytics
curl -s "$BASE_URL/api/moods/analytics/summary?days=7" -H "Authorization: Bearer $TOKEN" | jq '.summary'
echo "✅ Got mood analytics"

# 4. Create journal
JOURNAL=$(curl -s -X POST $BASE_URL/api/journals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Day","content":"Great day today!","emotion":"happy"}')
JOURNAL_ID=$(echo $JOURNAL | jq -r '.journal.id')
echo "✅ Created journal: $JOURNAL_ID"

# 5. Search journals
curl -s "$BASE_URL/api/journals/search?q=great" -H "Authorization: Bearer $TOKEN" | jq '.journals'
echo "✅ Searched journals"

# 6. List stories
curl -s "$BASE_URL/api/stories?category=anxiety&limit=5" | jq '.stories[0]'
echo "✅ Listed stories"

# 7. Get story with hierarchy
STORY_ID=$(curl -s "$BASE_URL/api/stories?limit=1" | jq -r '.stories[0].id')
curl -s "$BASE_URL/api/stories/$STORY_ID" | jq '.units[0].lessons[0]'
echo "✅ Got story hierarchy"
```

---

## Database Verification

### Check Moods Table

```sql
SELECT id, "userId", emotion, intensity, "loggedAt" FROM "Moods" LIMIT 5;
```

### Check Journals Table

```sql
SELECT id, "userId", title, emotion, "entryDate" FROM "Journals" LIMIT 5;
```

### Check Story Hierarchy

```sql
SELECT s.id, s.title, COUNT(u.id) unit_count 
FROM "Stories" s
LEFT JOIN "Units" u ON s.id = u."storyId"
GROUP BY s.id LIMIT 5;
```

### Count Relationships

```sql
SELECT 
  (SELECT COUNT(*) FROM "Moods") moods,
  (SELECT COUNT(*) FROM "Journals") journals,
  (SELECT COUNT(*) FROM "Stories") stories,
  (SELECT COUNT(*) FROM "Units") units,
  (SELECT COUNT(*) FROM "Lessons") lessons,
  (SELECT COUNT(*) FROM "Challenges") challenges;
```

---

## Testing Checklist

### Mood Endpoints
- [ ] POST /api/moods creates mood with valid emotion and intensity
- [ ] GET /api/moods lists paginated moods
- [ ] GET /api/moods?emotion=happy filters by emotion
- [ ] GET /api/moods?startDate=... filters by date
- [ ] GET /api/moods/{moodId} returns specific mood
- [ ] PATCH /api/moods/{moodId} updates mood
- [ ] DELETE /api/moods/{moodId} deletes mood
- [ ] GET /api/moods/analytics/summary returns statistics
- [ ] Invalid emotion returns 400
- [ ] Invalid intensity returns 400

### Journal Endpoints
- [ ] POST /api/journals creates entry
- [ ] GET /api/journals lists paginated entries
- [ ] GET /api/journals?emotion=happy filters by emotion
- [ ] GET /api/journals?isPrivate=true filters by privacy
- [ ] GET /api/journals/{journalId} returns specific entry
- [ ] PATCH /api/journals/{journalId} updates entry
- [ ] DELETE /api/journals/{journalId} deletes entry
- [ ] GET /api/journals/search?q=keyword searches content
- [ ] Content length validation (1-5000 chars)
- [ ] Title length validation

### Story Endpoints
- [ ] GET /api/stories lists all published stories
- [ ] GET /api/stories?category=anxiety filters by category
- [ ] GET /api/stories?difficulty=beginner filters by difficulty
- [ ] GET /api/stories/{storyId} returns full hierarchy
- [ ] viewCount increments on story retrieval
- [ ] GET /api/stories/{storyId}/units lists units
- [ ] GET /api/stories/{storyId}/units/{unitId} returns specific unit
- [ ] GET /api/stories/.../lessons/{lessonId} returns lesson with challenges
- [ ] GET /api/stories/.../challenges/{challengeId} returns challenge
- [ ] GET /api/stories/by-category/{category} filters by category

---

## Endpoint Summary - Phase 4

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/moods` | ✅ | Create mood log |
| GET | `/api/moods` | ✅ | List user moods |
| GET | `/api/moods/:moodId` | ✅ | Get specific mood |
| PATCH | `/api/moods/:moodId` | ✅ | Update mood |
| DELETE | `/api/moods/:moodId` | ✅ | Delete mood |
| GET | `/api/moods/analytics/summary` | ✅ | Mood analytics |
| POST | `/api/journals` | ✅ | Create journal |
| GET | `/api/journals` | ✅ | List journals |
| GET | `/api/journals/:journalId` | ✅ | Get journal |
| PATCH | `/api/journals/:journalId` | ✅ | Update journal |
| DELETE | `/api/journals/:journalId` | ✅ | Delete journal |
| GET | `/api/journals/search` | ✅ | Search journals |
| GET | `/api/stories` | - | List stories |
| GET | `/api/stories/:storyId` | - | Get story |
| GET | `/api/stories/:storyId/units` | - | List units |
| GET | `/api/stories/:storyId/units/:unitId` | - | Get unit |
| GET | `/api/stories/.../lessons/:lessonId` | - | Get lesson |
| GET | `/api/stories/.../challenges/:challengeId` | - | Get challenge |
| GET | `/api/stories/by-category/:category` | - | Stories by category |

**Total Phase 4 Endpoints:** 19
**Total System Endpoints:** 32 (13 auth+user + 19 mood/journal/story)

---

**Generated:** March 14, 2026
**Duration:** Phase 4 complete in this session
