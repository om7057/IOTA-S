Youtube Video Link : https://youtu.be/Bu-13p67hZY


TweetNLP Dataset : https://aclanthology.org/2022.emnlp-demos.5/


# 🌟 Learning App Frontend

This is the **frontend** of a learning platform built using **React + Vite + Tailwind CSS**. It includes story-based and quiz-based learning features, a leaderboard, latest news section, and user authentication via Clerk.

---

## 🚀 Tech Stack

- ⚛️ React
- ⚡ Vite
- 💨 Tailwind CSS
- 🔐 Clerk (Authentication)
- 🌐 React Router
- 🍞 react-hot-toast (Toasts)
- 🧠 State Management via Hooks

---

## 📁 Folder Structure

```
src/
├── components/          # Reusable UI components (Sidebar, Navbar, etc.)
├── pages/               # Route-level components (Home, Login, Profile, etc.)
├── assets/              # Static assets
├── App.jsx              # App entry with routing
├── main.jsx             # ReactDOM entry
```

---

## 🛠️ Setup Instructions

### 1. 📦 Install dependencies

```bash
npm install
```

### 2. 🔑 Environment Variables

Create a `.env` file in the root with the following Clerk setup:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

> 💡 Replace `your_clerk_publishable_key_here` with your actual key from [Clerk Dashboard](https://clerk.dev/)

### 3. 🧠 Start the dev server

```bash
npm run dev
```

It should now be running at:

```
http://localhost:5173/
```

---

## 📚 Features

- 📖 **Story-Based Learning** – Interactive storytelling lessons
- 📝 **Quiz-Based Learning** – Topic-wise quizzes with score tracking
- 🏆 **Leaderboard** – Rank users based on quiz performance
- 📰 **Latest Updates** – News and announcements section
- 👤 **Authentication** – Sign up / Sign in via Clerk
- ⚙️ **Sidebar Navigation** – With responsive toggle
- 📊 **Score Display** – Post-quiz results with leaderboard redirect

---

## ✅ Available Scripts

- `npm run dev` – Starts the development server
- `npm run build` – Builds the app for production
- `npm run preview` – Previews the production build

---

## 🔗 Backend API Endpoints (Assumed)

Make sure your backend server is running (e.g. Express API):

```
http://localhost:5000/api
```

Expected endpoints:
- `/api/quiz/story/:storyId`
- `/api/stories/:storyId`
- `/api/leaderboard`
- `/api/users/clerk/:userId`

---



# Akward-edu-web-backend

**Akward-edu-web-backend** is the server-side application for the [Akward Edu Web Platform](https://yourfrontendlink.com). Built using **Node.js** and **Express.js**, this backend powers APIs, manages authentication, handles database operations, and provides services to the frontend application.

---

## Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB / Mongoose** *(if applicable)*
- **JWT** for authentication
- **dotenv** for environment configuration
- **nodemon** for development auto-reloading
- **CORS**, **Helmet**, and other middleware for security and request handling

---

## Project Structure

```bash
Akward-edu-web-backend/
├── config/             # App configuration (e.g., DB, env)
├── controllers/        # Route controllers
├── middleware/         # Custom middleware (e.g., auth, error handling)
├── models/             # Mongoose/ORM data models
├── routes/             # Express route definitions
├── utils/              # Utility/helper functions
├── .env                # Environment variables
├── .gitignore
├── package.json
├── server.js           # Main entry point
└── README.md

'''

```

# Child Safety News API

An API service that fetches and categorizes news articles related to child safety topics.

## Overview

This FastAPI-based service aggregates news articles from various sources using the NewsAPI and automatically categorizes them into relevant child safety topics such as Child Abuse, Sexual Exploitation, Cyberbullying, and more.

## Features

- Fetches recent news articles related to child safety from NewsAPI
- Automatically categorizes articles based on keyword analysis
- Provides a clean REST API endpoint to access categorized news data
- CORS-enabled for frontend integration

## Requirements

- Python 3.7+
- FastAPI
- Uvicorn (ASGI server)
- httpx (Async HTTP client)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/child-safety-news-api.git
   cd child-safety-news-api
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up your NewsAPI key:
   - Get an API key from [NewsAPI](https://newsapi.org/)
   - Replace the `API_KEY` value in `app/news_fetcher.py` with your own key

## Usage

### Starting the Server

```
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

### API Endpoints

#### GET /api/news

Returns a list of news articles related to child safety, categorized by topic.

Example Response:
```json
{
  "articles": [
    {
      "title": "New Child Safety Measures Implemented Online",
      "description": "Tech companies are rolling out new features to protect children.",
      "content": "Several major platforms announced new safety features...",
      "url": "https://example.com/article1",
      "source": "Tech News Daily",
      "publishedAt": "2023-05-20T08:15:00Z",
      "topic": "Safety / Protection"
    },
    {
      "title": "Education Reform Focuses on Digital Literacy",
      "description": "New curriculum to teach children about online dangers.",
      "content": "Schools across the country are implementing new digital literacy programs...",
      "url": "https://example.com/article2",
      "source": "Education Weekly",
      "publishedAt": "2023-05-19T14:30:00Z",
      "topic": "Education"
    }
  ]
}
```

### Interactive API Documentation

FastAPI provides automatic interactive API documentation:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
child-safety-news-api/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application and routes
│   ├── news_fetcher.py      # Handles fetching news from external API
│   └── news_categorizer.py  # Categorizes articles by topic
├── requirements.txt         # Project dependencies
└── README.md                # This file
```

## Categories

The system categorizes articles into the following topics:

- Child Abuse
- Sexual Exploitation
- Online Exploitation
- Cyberbullying
- Child Labour
- Child Marriage
- Mental Health
- Education
- Safety / Protection
- Trafficking
- Uncategorized (default)

## Development

### Adding New Categories

To add new categories, update the `CATEGORY_KEYWORDS` dictionary in `app/news_categorizer.py`:

```python
CATEGORY_KEYWORDS = {
    # Existing categories...
    "New Category": ["keyword1", "keyword2", "keyword3"],
}
```

### Modifying Search Terms

To change which articles are fetched, modify the `QUERY_TERMS` list in `app/news_fetcher.py`.

## Production Deployment Notes

- Replace `allow_origins=["*"]` with specific allowed origins
- Store the API key as an environment variable rather than hardcoding it
- Consider implementing rate limiting for the API endpoint
- Add proper error handling for the news API requests

## License

[MIT License]

## Acknowledgments

- [NewsAPI](https://newsapi.org/) for providing the news data
- [FastAPI](https://fastapi.tiangolo.com/) framework

