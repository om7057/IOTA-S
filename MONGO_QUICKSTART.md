# Quick Start: Mongo-Primary Runtime

## 30-Second Setup

### 1. Configure Environment
```bash
cd IOTA-S/server
cp .env.example .env

# Edit .env:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/iota_db
# USE_MONGO_PRIMARY=true
```

### 2. Install & Run
```bash
npm install
npm start  # Auto-enables Mongo-primary based on env
```

### 3. Verify
```bash
curl http://localhost:5000/api/health
# → {"status": "ok", "db": "mongodb"}
```

## All Implemented (Fully Dual-Path) Endpoints

✅ **Auth** (7 endpoints)
- POST /api/auth/signup
- POST /api/auth/signin  
- POST /api/auth/refresh
- POST /api/auth/logout
- GET /api/auth/google-web
- GET /api/auth/google-mobile
- POST /api/auth/google-callback

✅ **Users** (7 endpoints)
- GET /api/users
- GET /api/users/:id
- GET /api/users/me
- PATCH /api/users/:id
- DELETE /api/users/:id
- GET /api/users/:id/progress
- PATCH /api/users/:id/age

✅ **Children Courses** (12 endpoints)
- GET /api/children-courses
- GET /api/children-courses/dashboard
- GET /api/children-courses/:id
- GET /api/children-courses/category/:category
- POST /api/children-courses
- GET /api/children-courses/lessons/:id
- GET /api/children-courses/lessons/:id/progress
- POST /api/children-courses/challenges/:id/submit
- GET /api/children-courses/user-progress
- PATCH /api/children-courses/active
- PATCH /api/children-courses/hearts
- PATCH /api/children-courses/points

✅ **Topics** (7 endpoints)
- GET /api/topics
- GET /api/topics/:id
- GET /api/topics/:id/stories
- GET /api/topics/category/:category
- POST /api/topics
- PATCH /api/topics/:id
- DELETE /api/topics/:id

✅ **Stories** (7 endpoints)
- GET /api/stories
- GET /api/stories/:id
- GET /api/stories/:id/units
- GET /api/units/:id
- GET /api/lessons/:id
- GET /api/challenges/:id
- GET /api/stories/category/:category

✅ **Stats & Leaderboard** (5 endpoints)
- GET /api/progress/stats
- GET /api/quiz/stats
- GET /api/leaderboard
- GET /api/leaderboard/user/:id/rank

## 🟡 Partially Migrated (Key Endpoints Done)

🟡 **Journals** 
- ✅ POST /api/journals (create entry)
- → GET, PATCH, DELETE need Mongo queries

🟡 **Story Attempts**
- ✅ POST /api/story-attempts (record attempt)
- → GET attempts, analytics need Mongo aggregation

## 🟡 Infrastructure Ready (All Imports + Helpers Added)

🟡 Social, Groups, Discussions, Direct Messages, Group Chats, Forums, Parental, Achievements, Chatbot, News, Admin

All have Mongo infrastructure; endpoints ready for dual-path migration.

## Fallback to PostgreSQL

If Mongo-primary causes issues, **one-line rollback**:

```bash
USE_MONGO_PRIMARY=false npm start
```

All 8 fully-migrated endpoints will use Sequelize/PostgreSQL. No code changes needed.

## Migration Commands

### Migrate Data (Postgres → Mongo)
```bash
npm run migrate:postgres-to-mongo
# Batch processes 1000 rows at a time
```

### With Force Reset
```bash
npm run migrate:postgres-to-mongo -- --drop
# Drops existing Mongo collections, re-imports all data
```

## Environment Variables Needed

```bash
# MongoDB (Required)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
MONGODB_DB_NAME=iota_db

# Toggle
USE_MONGO_PRIMARY=true  # false = PostgreSQL fallback

# Existing (for fallback)
DATABASE_URL=postgresql://...
```

## Testing an Endpoint

### Create Journal (Mongo-Primary)
```bash
curl -X POST http://localhost:5000/api/journals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My Day",
    "content": "Today was great!",
    "emotion": "happy",
    "tags": ["school", "friends"]
  }'
# → 201 Created (from Mongo)
```

### With Fallback Enabled
```bash
USE_MONGO_PRIMARY=false curl ...
# → 201 Created (from PostgreSQL/Sequelize)
```

## Monitoring

### Check Mongo Connection
```javascript
// In server logs
GET /api/health
→ { "status": "ok", "db": "mongodb" }
```

### Check Sequelize Fallback  
```bash
USE_MONGO_PRIMARY=false npm start
# Logs should say: "Connecting to PostgreSQL"
```

## Performance Tips

1. **Create Indexes**
   ```javascript
   await db.collection('users').createIndex({ email: 1 });
   await db.collection('stories').createIndex({ userId: 1, createdAt: -1 });
   ```

2. **Monitor Long Queries**
   - Default timeout: 30s
   - Check MONGODB_URI for slow query logs

3. **Batch Operations**
   - Use 1000-row batches for bulk writes
   - Leverage Mongo bulk insert for performance

## Troubleshooting

### "Cannot Connect to MongoDB"
- Check MONGODB_URI format
- Verify IP whitelisting in Atlas
- Confirm network access rules

### "Collections not found"
- Run migration: `npm run migrate:postgres-to-mongo`
- Check MONGODB_DB_NAME matches

### "Endpoint returns Postgres data when Mongo-primary enabled"
- Restart server: `npm start`
- Verify `USE_MONGO_PRIMARY=true` in active env
- Check logs: `grep isMongoPrimaryEnabled`

## File Locations

- **Config**: `server/config/mongo.js`, `config/environment.js`
- **Migration**: `server/scripts/migrate-postgres-to-mongo.js`
- **Controllers**: `server/controllers/*.js` (all 23 files)
- **Full Docs**: `MONGO_MIGRATION_REPORT.md` (this directory)

## Next Steps

1. ✅ All infrastructure ready
2. 👉 **Test with `USE_MONGO_PRIMARY=true`**
3. 👉 **Migrate data: `npm run migrate:postgres-to-mongo`**
4. 👉 **Verify 8 fully-migrated endpoints work**
5. 👉 **Migrate remaining 13 controllers' endzpoints**
6. 👉 **Load test & deploy to production**

---

**Ready to go Mongo-primary! 🚀**
