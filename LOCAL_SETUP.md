# Safe Space - Local Setup Guide

This project has multiple components. Choose which ones to run below.

## Prerequisites
- Node.js 16+ and npm
- MongoDB (local or MongoDB Atlas connection string)
- Python 3.8+ (for newsfetcher service)
- Git

---

## Option 1: Run Web Frontend Only (Client)

### Setup
```bash
cd web/client
npm install
```

### Create/Update `.env` file
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZW5nYWdlZC1sb2JzdGVyLTYyLmNsZXJrLmFjY291bnRzLmRldiQ
```

### Run
```bash
npm run dev
```
Access at `http://localhost:5173`

---

## Option 2: Run Web Backend + Frontend (Recommended for Full Testing)

### Backend Setup
```bash
cd web/server
npm install
```

### Create `.env` file in `web/server/`
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/safe-space
# or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/safe-space
NODE_ENV=development
```

### Start Backend
```bash
npm start
```
Backend runs on `http://localhost:5000`

### Frontend Setup (in another terminal)
```bash
cd web/client
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

---

## Option 3: Full Stack (Web + Python Newsfetcher Service)

### Additional Setup for Python Service
```bash
cd web/newsfetcher-service
python3 -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
pip install -r requirements.txt
```

### Run Python Service
```bash
python app.py
```

---

## Option 4: Run All Project Parts (Mobile + Web + Prototype)

### Mobile Client
```bash
cd mobile/client
npm install
npm start
```

### Prototype (Vite)
```bash
cd prototype
npm install
npm run dev
```

---

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally: `brew services start mongodb-community` (macOS)
- Or use MongoDB Atlas and update the connection string in `.env`

### Port Already in Use
- Backend: Change PORT in `.env`
- Frontend: Run with `npm run dev -- --port 3000`

### Missing Dependencies
```bash
npm install  # in the problematic directory
```

### Python Service Issues
- Ensure Python 3.8+ is installed
- Run from the service directory
- Check `requirements.txt` for all dependencies

---

## Quick Start (Recommended)
```bash
# Terminal 1: Backend
cd web/server
npm install
# Create .env file with MONGODB_URI
npm start

# Terminal 2: Frontend
cd web/client
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.
