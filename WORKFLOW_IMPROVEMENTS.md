# IOTA-S Workflow Improvements - Implementation Guide

## Overview

The IOTA-S children section has been enhanced with a hierarchical story workflow inspired by dev4chan's lesson/challenge system while preserving all existing emotion detection and story fetching functionality.

## Key Improvements

### 1. **Hierarchical Structure**
```
Topic
  ├── Unit (NEW)
  │   ├── Lesson (NEW)
  │   │   ├── Challenge (NEW)
  │   │   │   ├── Challenge Option (NEW)
  │   │   │   └── Challenge Option
  │   │   └── Challenge
  │   └── Lesson
  └── Unit
```

### 2. **What's New**

#### Models Added
- **Unit**: Organizes lessons within a topic
- **Lesson**: Contains challenges for structured learning
- **Challenge**: Questions/tasks with multiple choice options
- **ChallengeOption**: Individual answer options
- **ChallengeProgress**: Tracks user progress on challenges

#### Components Added (Web)
- `UnitsAndLessons.jsx` - Browse units and lessons hierarchically
- `StoryWithChallenges.jsx` - Complete lesson with challenges and emotion tracking

#### Components Added (Mobile)
- `/app/units/[topicId].tsx` - Browse units and lessons
- `/app/lesson/[lessonId].tsx` - Complete lesson with challenges and emotion detection

#### Backend Routes
- `POST/GET /api/units/` - Manage units
- `POST/GET /api/lessons/` - Manage lessons
- `POST/GET /api/challenges/` - Manage challenges
- `POST/GET /api/challenge-options/` - Manage challenge options

## Preserved Features

✅ **Emotion Detection** - Working on both web and mobile
✅ **Story Fetching** - Existing API structure unchanged
✅ **Emotion Analysis** - Persisted throughout lessons
✅ **User Progress** - Tracked and saved
✅ **Backward Compatibility** - All existing routes work as before

## Database Migration

### Creating Sample Data

The database schema has been extended but not altered. Add units and lessons through the API:

```bash
# Example: Create a Unit for a Topic
POST /api/units
{
  "title": "Sexual Abuse Awareness",
  "description": "Learn about body autonomy and safe/unsafe touch",
  "topicId": "topic-id-here",
  "order": 1
}

# Create a Lesson within a Unit
POST /api/lessons
{
  "title": "Understanding Safe and Unsafe Touch",
  "description": "Identify boundaries and safe/unsafe situations",
  "unitId": "unit-id-here",
  "order": 1
}

# Create a Challenge within a Lesson
POST /api/challenges
{
  "lessonId": "lesson-id-here",
  "question": "Which of these is considered safe touch?",
  "type": "SELECT",
  "order": 1
}

# Add Challenge Options
POST /api/challenge-options
{
  "challengeId": "challenge-id-here",
  "text": "A hug from a trusted family member",
  "correct": true,
  "imageSrc": "optional-image-url",
  "audioSrc": "optional-audio-url"
}
```

## Web Usage

### Navigation Flow
1. **Home** → Click "Learning Topics"
2. **Topics Page** → Select a topic
3. **Units & Lessons** (NEW) → Select a unit → Choose a lesson
4. **Lesson with Challenges** (NEW) → Complete challenges with emotion tracking → View emotion summary

### Routes
- `/units/:topicId` - View units and lessons for a topic
- `/lesson/:lessonId` - Complete lesson with challenges

## Mobile Usage

### Navigation Flow
1. **Stories Tab** → Shows topics with new "Try Units & Lessons" button
2. **Units Screen** (NEW) → Select unit → Choose lesson
3. **Lesson Screen** (NEW) → Complete challenges with facial emotion detection

### Routes
- `/units/:topicId` - View units and lessons for a topic
- `/lesson/:lessonId` - Complete lesson with challenges and emotion tracking

## API Endpoints Reference

### Units
```
GET  /api/units/topic/:topicId          - Get all units for a topic
GET  /api/units/:unitId                 - Get unit with lessons
POST /api/units                         - Create unit (admin)
PATCH /api/units/:unitId                - Update unit (admin)
```

### Lessons
```
GET  /api/lessons/unit/:unitId          - Get all lessons for a unit
GET  /api/lessons/:lessonId             - Get lesson with challenges
POST /api/lessons                       - Create lesson (admin)
PATCH /api/lessons/:lessonId            - Update lesson (admin)
```

### Challenges
```
GET  /api/challenges/lesson/:lessonId   - Get all challenges for a lesson
GET  /api/challenges/:challengeId       - Get challenge with options
POST /api/challenges                    - Create challenge (admin)
PATCH /api/challenges/:challengeId      - Update challenge (admin)
POST /api/challenges/:challengeId/submit - Submit challenge answer
GET  /api/challenges/user/:userId/progress - Get user's challenge progress
```

### Challenge Options
```
POST /api/challenge-options             - Create option (admin)
PATCH /api/challenge-options/:optionId  - Update option (admin)
DELETE /api/challenge-options/:optionId - Delete option (admin)
```

## Features

### Emotion Tracking Integration

Both web and mobile continuously track emotions during lessons:

**Web:**
- Webcam-based emotion detection using `useEmotionDetection` hook
- Emotion timeline updates every 2 seconds
- Emotion summary shown on lesson completion

**Mobile (React Native):**
- Camera-based emotion detection with `expo-camera`
- Emotion sampling during challenges
- Emotion summary display on completion

### Challenge Progress

Users get immediate feedback on answers:
- ✅ Correct - Positive feedback and proceed
- ❌ Incorrect - Encouraging retry message
- Detailed progress tracking per user per challenge

### Progress Visualization

- Real-time progress bar showing lesson completion
- Challenge-by-challenge progress tracking
- User statistics and completion status

## Example: Adding a Complete Lesson Workflow

### 1. Create a Unit
```javascript
const unit = await fetch('/api/units', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: "Understanding Digital Safety",
    description: "Learn how to stay safe online",
    topicId: "topic-123",
    order: 1
  })
});
```

### 2. Create Lessons
```javascript
const lesson = await fetch('/api/lessons', {
  method: 'POST',
  body: JSON.stringify({
    title: "Recognizing Online Predators",
    description: "Identify warning signs",
    unitId: "unit-123",
    order: 1
  })
});
```

### 3. Add Challenges
```javascript
const challenge = await fetch('/api/challenges', {
  method: 'POST',
  body: JSON.stringify({
    lessonId: "lesson-123",
    question: "What should you do if a stranger asks for your location online?",
    type: "SELECT",
    order: 1
  })
});
```

### 4. Add Challenge Options
```javascript
const option = await fetch('/api/challenge-options', {
  method: 'POST',
  body: JSON.stringify({
    challengeId: "challenge-123",
    text: "Tell them you don't share location information",
    correct: true
  })
});
```

## Backward Compatibility

Allexisting features remain unchanged:
- Story browsing and playing
- Quiz functionality
- Mood tracking
- Journal entries
- Leaderboards
- Group discussions

The new hierarchical structure is complementary and optional. Users can continue using stories directly if preferred.

## Next Steps

1. **Seed Database** - Create units, lessons, and challenges for your content
2. **Link Stories** - Optionally link existing stories to lessons via `lessonId`
3. **Test Emotion Tracking** - Verify emotion detection works with the new challenges
4. **Monitor Progress** - Use the challenge progress endpoints to track learning

## Troubleshooting

### Stories Not Loading
- Ensure `topicId` is correct
- Check topic exists in database
- Verify authentication token is valid

### Emotion Detection Not Working
- Grant camera permissions on mobile
- Check webcam access on web
- Verify `useEmotionDetection` hook is initialized

### Challenge Progress Not Saving
- Ensure `userId` is included in request body
- Check user is authenticated
- Verify challenge exists before submitting

## Support

For issues or feature requests, please refer to the IOTA-S README or contact the development team.
