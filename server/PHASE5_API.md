# Phase 5: Quiz, Leaderboard & Progress Tracking API Documentation

## Overview

Phase 5 introduces comprehensive quiz management, leaderboard rankings, and progress tracking systems.

## Models

### Quiz
- `id` (UUID) - Primary key
- `title` (String) - Quiz title
- `description` (Text) - Quiz description
- `category` (Enum) - anxiety|depression|social|academic|family|health|identity|general
- `difficultyLevel` (Enum) - beginner|intermediate|advanced
- `timeLimit` (Integer) - Time limit in minutes (optional)
- `passingScore` (Integer) - Score needed to pass (0-100, default: 70)
- `isPublished` (Boolean) - Published status
- `questionCount` (Integer) - Total questions in quiz
- `totalPoints` (Integer) - Sum of all question points
- `attemptCount` (Integer) - Total attempts by users
- `averageScore` (Float) - Average score across attempts
- `tags` (JSONB) - Array of tag strings
- `metadata` (JSONB) - Custom metadata

### QuizQuestion
- `id` (UUID) - Primary key
- `quizId` (UUID) - Reference to Quiz
- `sequence` (Integer) - Order in quiz
- `type` (Enum) - multiple-choice|true-false|short-answer|matching|fill-blank
- `prompt` (Text) - Question text
- `options` (JSONB) - Answer options array
- `correctAnswer` (JSONB) - Correct answer(s)
- `explanation` (Text) - Answer explanation
- `points` (Integer) - Points awarded for correct answer
- `hints` (JSONB) - Array of hint strings

### QuizProgress
- `id` (UUID) - Primary key
- `userId` (UUID) - User reference
- `quizId` (UUID) - Quiz reference
- `attempt` (Integer) - Attempt number
- `score` (Integer) - Score percentage (0-100)
- `pointsEarned` (Integer) - Points earned
- `totalPoints` (Integer) - Total points possible
- `passed` (Boolean) - Whether user passed
- `timeSpent` (Integer) - Time spent in seconds
- `answers` (JSONB) - User answers indexed by question ID
- `completedAt` (Date) - Completion timestamp

### UserStoryProgress
- `id` (UUID) - Primary key
- `userId` (UUID) - User reference
- `storyId` (UUID) - Story reference
- `unitId` (UUID) - Unit reference (optional)
- `lessonId` (UUID) - Lesson reference (optional)
- `challengeId` (UUID) - Challenge reference (optional)
- `status` (Enum) - not-started|in-progress|completed
- `pointsEarned` (Integer) - Points earned
- `attempts` (Integer) - Number of attempts
- `completedAt` (Date) - Completion timestamp
- `startedAt` (Date) - Start timestamp
- `metadata` (JSONB) - Progress metadata

### Leaderboard
- `id` (UUID) - Primary key
- `userId` (UUID) - User reference (unique per period)
- `period` (Enum) - all-time|monthly|weekly (unique per user)
- `rank` (Integer) - User's rank
- `totalPoints` (Integer) - Total points
- `quizzesCompleted` (Integer) - Quizzes completed
- `storiesCompleted` (Integer) - Stories completed
- `journalCount` (Integer) - Journal entries
- `moodLogsCount` (Integer) - Mood logs
- `streak` (Integer) - Activity streak in days
- `lastActivityAt` (Date) - Last activity timestamp
- `periodStartAt` (Date) - Period start date

## Quiz Endpoints

### Public
- `GET /api/quizzes` - List all published quizzes
  - Query: `category`, `difficulty`, `published` (default: true)
- `GET /api/quizzes/:id` - Get quiz with questions

### User
- `POST /api/quizzes/:quizId/submit` - Submit quiz attempt
  - Body: `{ answers, timeSpent }`
  - Returns: score, passed, points, attempt number
- `GET /api/quizzes/:quizId/attempts` - Get user's attempts for quiz
- `GET /api/quizzes/stats/all` - Get user's quiz statistics

### Admin
- `POST /api/quizzes` - Create quiz
- `PUT /api/quizzes/:id` - Update quiz
- `DELETE /api/quizzes/:id` - Delete quiz
- `POST /api/quizzes/:id/questions` - Add question
- `PUT /api/quizzes/:id/questions/:questionId` - Update question
- `DELETE /api/quizzes/:id/questions/:questionId` - Delete question

## Progress Tracking Endpoints

### User
- `GET /api/progress` - Get user's story progress
- `GET /api/progress/stats` - Get progress statistics
- `GET /api/progress/:type/:id` - Get progress for unit/lesson/challenge
  - Params: `type` = unit|lesson|challenge
- `POST /api/progress/:storyId/update` - Update progress
- `POST /api/progress/:storyId/units/:unitId/complete` - Complete unit
- `POST /api/progress/:storyId/lessons/:lessonId/complete` - Complete lesson

## Leaderboard Endpoints

### Public
- `GET /api/leaderboards` - Get leaderboard
  - Query: `period` (all-time|monthly|weekly, default: all-time), `limit` (1-100, default: 50)

### User
- `GET /api/leaderboards/user/rank` - Get user's rank
  - Query: `period` (default: all-time)

### Admin
- `POST /api/leaderboards/admin/update` - Update leaderboard (recalculate rankings)

## Admin Endpoints

### Story Management
- `POST /api/admin/stories` - Create story
- `PUT /api/admin/stories/:id` - Update story
- `DELETE /api/admin/stories/:id` - Delete story

### Unit Management
- `POST /api/admin/stories/:storyId/units` - Add unit to story
- `PUT /api/admin/stories/:storyId/units/:unitId` - Update unit
- `DELETE /api/admin/stories/:storyId/units/:unitId` - Delete unit

### Lesson Management
- `POST /api/admin/stories/:storyId/units/:unitId/lessons` - Add lesson
- `PUT /api/admin/stories/:storyId/units/:unitId/lessons/:lessonId` - Update lesson
- `DELETE /api/admin/stories/:storyId/units/:unitId/lessons/:lessonId` - Delete lesson

### Challenge Management
- `POST /api/admin/stories/:storyId/units/:unitId/lessons/:lessonId/challenges` - Add challenge
- `PUT /api/admin/stories/:storyId/units/:unitId/lessons/:lessonId/challenges/:challengeId` - Update challenge
- `DELETE /api/admin/stories/:storyId/units/:unitId/lessons/:lessonId/challenges/:challengeId` - Delete challenge

## Example Requests

### Submit Quiz Answer
```bash
POST /api/quizzes/quiz-123/submit
Content-Type: application/json
Authorization: Bearer token

{
  "answers": {
    "question-1": "option-a",
    "question-2": true,
    "question-3": ["option-1", "option-2"]
  },
  "timeSpent": 900
}
```

### Get User Quiz Stats
```bash
GET /api/quizzes/stats/all
Authorization: Bearer token
```

### Update Story Progress
```bash
POST /api/progress/story-123/update
Content-Type: application/json
Authorization: Bearer token

{
  "unitId": "unit-456",
  "status": "in-progress",
  "pointsEarned": 50,
  "metadata": { "notes": "Initial attempt" }
}
```

### Complete Unit
```bash
POST /api/progress/story-123/units/unit-456/complete
Content-Type: application/json
Authorization: Bearer token

{
  "pointsEarned": 100
}
```

### Get Leaderboard
```bash
GET /api/leaderboards?period=weekly&limit=50
```

### Get User Rank
```bash
GET /api/leaderboards/user/rank?period=all-time
Authorization: Bearer token
```

### Create Admin Story
```bash
POST /api/admin/stories
Content-Type: application/json
Authorization: Bearer token

{
  "title": "My Story",
  "description": "Story description",
  "category": "anxiety",
  "ageGroup": ["13-16", "17-19"],
  "difficulty": "beginner",
  "coverImage": "https://...",
  "thumbEmoji": "😊"
}
```

## Response Format

All responses follow this format:

```json
{
  "success": true/false,
  "data": {},
  "error": "Error message if success is false",
  "total": "Count for list endpoints"
}
```

## Error Codes

- `400` - Bad request (missing/invalid parameters)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not found
- `500` - Server error

## Notes

- Quiz answers are compared with correct answers using strict equality
- For array answers, order doesn't matter
- Leaderboard updates should be run periodically (consider cron job)
- Admin endpoints require token (role checking can be added later)
- Progress metadata is flexible JSONB - store custom data as needed
