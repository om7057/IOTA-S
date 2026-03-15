# Phase 3: User Routes Testing Guide

## Summary

Phase 3 is complete. Implemented:

✅ **User Controller** (`controllers/users.js`)
- listUsers(page, limit, sort)
- getCurrentUser(userId) - protected
- getUserById(userId)
- updateUser(userId, firstName, lastName, age, gender, avatarUrl) - protected
- deleteUser(userId) - protected
- getUserProgress(userId)

✅ **User Routes** (`routes/users.js`)
- GET /api/users (public - paginated)
- GET /api/users/me (protected - current user)
- GET /api/users/:userId (public - user profile)
- PATCH /api/users/:userId (protected - update own profile)
- DELETE /api/users/:userId (protected - delete own account)
- GET /api/users/:userId/progress (public - user stats)

✅ **Server Integration** (`server.js`)
- User routes mounted at /api/users

---

## Prerequisites

1. **Phase 2 Complete** - Auth system must be working
2. **Server Running** - `npm run dev`
3. **Valid User Token** - From signup or signin endpoint

---

## Test Steps

### 1. Create Test User

First, create a user using auth endpoint:

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Password123",
    "firstName": "John",
    "lastName": "Doe",
    "age": 15,
    "gender": "male"
  }'
```

**Response:**
```json
{
  "message": "Signup successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "testuser@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John Doe",
    "age": 15,
    "userType": "teenager"
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Save these tokens for testing!**

### 2. Test GET /api/users (Public - List Users)

**Request:**
```bash
curl http://localhost:3000/api/users
```

**Query Parameters:**
- `page=1` (default: 1)
- `limit=10` (default: 10)
- `sort=createdAt` (default: createdAt) - also supports: firstName, lastName, currentStars, age

**With Pagination:**
```bash
curl "http://localhost:3000/api/users?page=1&limit=5&sort=firstName"
```

**Response (200):**
```json
{
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "testuser@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "displayName": "John Doe",
      "age": 15,
      "userType": "teenager",
      "avatarUrl": null,
      "currentStars": 0
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### 3. Test GET /api/users/me (Protected - Current User)

**Request:**
```bash
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer <accessToken>"
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "testuser@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "displayName": "John Doe",
  "age": 15,
  "gender": "male",
  "userType": "teenager",
  "oauthProvider": "local",
  "googleId": null,
  "avatarUrl": null,
  "currentStars": 0,
  "isVerified": false,
  "verifiedAt": null,
  "createdAt": "2026-03-14T10:00:00.000Z",
  "updatedAt": "2026-03-14T10:00:00.000Z"
}
```

### 4. Test GET /api/users/:userId (Public - User Profile)

**Request:**
```bash
curl http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440000
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "John",
  "lastName": "Doe",
  "displayName": "John Doe",
  "age": 15,
  "userType": "teenager",
  "avatarUrl": null,
  "currentStars": 0,
  "createdAt": "2026-03-14T10:00:00.000Z"
}
```

### 5. Test PATCH /api/users/:userId (Protected - Update Profile)

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jonathan",
    "lastName": "Smith",
    "age": 16,
    "avatarUrl": "https://example.com/avatar.jpg"
  }'
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "testuser@example.com",
    "firstName": "Jonathan",
    "lastName": "Smith",
    "displayName": "Jonathan Smith",
    "age": 16,
    "gender": "male",
    "userType": "teenager",
    "avatarUrl": "https://example.com/avatar.jpg"
  }
}
```

### 6. Test DELETE /api/users/:userId (Protected - Delete Account)

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <accessToken>"
```

**Response (200):**
```json
{
  "message": "Account deleted successfully"
}
```

**Note:** After deletion, GET /api/users/:userId will return 404 (soft delete)

### 7. Test GET /api/users/:userId/progress (Public - User Stats)

**Request:**
```bash
curl http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440000/progress
```

**Response (200):**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "currentStars": 0,
  "stats": {
    "moodsLogged": 0,
    "journalsWritten": 0,
    "storiesCompleted": 0,
    "lessonsCompleted": 0,
    "quizzesCompleted": 0
  },
  "badges": {
    "verified": false,
    "counselorVerified": false
  },
  "joinedAt": "2026-03-14T10:00:00.000Z"
}
```

---

## Error Cases

### Missing Auth Header on Protected Route

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane"}'
```

**Response (401):**
```json
{
  "error": "Unauthorized: Missing or invalid authorization header"
}
```

### Unauthorized Update (Different User)

**Scenario:** Try to update another user's profile
```bash
# Use token from User A, try to update User B
curl -X PATCH http://localhost:3000/api/users/user-b-id \
  -H "Authorization: Bearer <User-A-Token>" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Hacker"}'
```

**Response (403):**
```json
{
  "error": "You can only update your own profile"
}
```

### Invalid UUID

**Request:**
```bash
curl http://localhost:3000/api/users/invalid-uuid
```

**Response (400):**
```json
{
  "error": "Invalid user ID format"
}
```

### User Not Found

**Request:**
```bash
curl http://localhost:3000/api/users/550e8400-0000-0000-0000-000000000000
```

**Response (404):**
```json
{
  "error": "User not found"
}
```

### Invalid Name Format

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"A"}'  # Too short
```

**Response (400):**
```json
{
  "error": "Invalid first name"
}
```

### Invalid Age

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"age":25}'  # Outside 5-19 range
```

**Response (400):**
```json
{
  "error": "Age must be between 5 and 19"
}
```

### Invalid Gender

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"gender":"unknown"}'
```

**Response (400):**
```json
{
  "error": "Invalid gender. Must be: male, female, other, prefer-not"
}
```

---

## Testing Checklist

- [ ] GET /api/users returns paginated list
- [ ] GET /api/users?page=2&limit=5 respects pagination
- [ ] GET /api/users/me returns current user's full profile (protected)
- [ ] GET /api/users/:userId returns public profile (no passwordHash)
- [ ] PATCH /api/users/:userId updates own profile (protected)
- [ ] PATCH /api/users/:userId rejects unauthorized updates (different user)
- [ ] DELETE /api/users/:userId deletes own account (soft delete)
- [ ] DELETE /api/users/:userId rejects unauthorized deletes
- [ ] GET /api/users/:userId/progress returns user stats
- [ ] Invalid UUID returns 400
- [ ] User not found returns 404
- [ ] Missing auth header returns 401 on protected routes
- [ ] Unauthorized access returns 403
- [ ] Invalid firstName returns 400
- [ ] Invalid age returns 400
- [ ] Invalid gender returns 400

---

## Database Verification

### Check Users Table

```bash
psql -U postgres -d iota_db
SELECT id, email, "firstName", "lastName", age, "userType", "isVerified" FROM "Users";
```

### Verify Soft Delete

```sql
-- Before DELETE request
SELECT COUNT(*) FROM "Users" WHERE "deletedAt" IS NULL;

-- After DELETE request
SELECT COUNT(*) FROM "Users" WHERE "deletedAt" IS NOT NULL;
```

### Check User Updates

```sql
SELECT id, "firstName", "lastName", age, "avatarUrl", "updatedAt" 
FROM "Users" 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';
```

---

## Script: Automated Testing

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"
EMAIL="test-$(date +%s)@example.com"

# 1. Signup
SIGNUP=$(curl -s -X POST $BASE_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{
    \"email\":\"$EMAIL\",
    \"password\":\"Password123\",
    \"firstName\":\"John\",
    \"lastName\":\"Doe\",
    \"age\":15
  }")

TOKEN=$(echo $SIGNUP | jq -r '.tokens.accessToken')
USER_ID=$(echo $SIGNUP | jq -r '.user.id')

echo "✅ Signup: $USER_ID"

# 2. Get current user
curl -s $BASE_URL/api/users/me \
  -H "Authorization: Bearer $TOKEN" | jq .
echo "✅ Get /me"

# 3. List all users
curl -s "$BASE_URL/api/users?page=1&limit=10" | jq '.users[0]'
echo "✅ List users"

# 4. Get user by ID
curl -s $BASE_URL/api/users/$USER_ID | jq .
echo "✅ Get user by ID"

# 5. Update user
curl -s -X PATCH $BASE_URL/api/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","age":16}' | jq .
echo "✅ Update user"

# 6. Get progress
curl -s $BASE_URL/api/users/$USER_ID/progress | jq .
echo "✅ Get progress"

# 7. Delete user
curl -s -X DELETE $BASE_URL/api/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN" | jq .
echo "✅ Delete user"

# 8. Verify deletion (should return 404)
curl -s $BASE_URL/api/users/$USER_ID | jq .
echo "✅ Verify deletion (404 expected)"
```

---

## Next: Phase 4 - Mood & Journal Routes

When ready, Phase 4 will add:
- Mood model & CRUD routes
- Journal model & CRUD routes
- Story model with hierarchy (Units, Lessons, Challenges)
- Teen-specific routes
- Quiz & Leaderboard routes

---

**Endpoint Summary - Phase 3:**

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/users` | - | List users (paginated) |
| GET | `/api/users/me` | ✅ | Current user profile |
| GET | `/api/users/:userId` | - | User profile by ID |
| PATCH | `/api/users/:userId` | ✅ | Update own profile |
| DELETE | `/api/users/:userId` | ✅ | Delete own account |
| GET | `/api/users/:userId/progress` | - | User progress stats |

**Total Endpoints After Phase 3:** 13 (7 auth + 6 user)
