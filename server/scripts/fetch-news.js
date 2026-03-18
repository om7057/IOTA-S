import fetch from 'node-fetch';
import { GoogleGenerativeAI } from '@google/generative-ai';
import environment from '../config/environment.js';

const NEWSAPI_KEY = environment.NEWSAPI_KEY;
const GEMINI_API_KEY = environment.GEMINI_API_KEY;
const BACKEND_URL = 'http://localhost:3000/api/news-stories';

// Keywords for child-safe news related to topics
const SEARCH_KEYWORDS = [
  'child education',
  'child safety',
  'child health awareness',
  'child rights',
  'education initiatives',
];

// NewsAPI categories for child-friendly content
const CATEGORIES = ['health', 'general', 'science'];

/**
 * Fetch news articles from NewsAPI
 */
async function fetchNewsArticles() {
  try {
    console.log('📰 Fetching news from NewsAPI...');
    
    // Fetch general news that's child-friendly
    const params = new URLSearchParams({
      apiKey: NEWSAPI_KEY,
      language: 'en',
      pageSize: 5,
      sortBy: 'publishedAt',
      q: SEARCH_KEYWORDS[Math.floor(Math.random() * SEARCH_KEYWORDS.length)],
    });

    const response = await fetch(`https://newsapi.org/v2/everything?${params}`);
    const data = await response.json();

    if (!data.articles || data.articles.length === 0) {
      console.log('⚠️  No articles found');
      return [];
    }

    console.log(`✅ Found ${data.articles.length} articles`);
    return data.articles.slice(0, 5); // Limit to 5 articles
  } catch (error) {
    console.error('❌ Error fetching news:', error.message);
    return [];
  }
}

/**
 * Generate educational story from article using Gemini
 */
async function generateStoryFromArticle(article) {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
You are an educational content creator for children (ages 7-18). 
Transform the following news article into an engaging, educational story with safety awareness themes.

Article:
Title: ${article.title}
Description: ${article.description}
Content: ${article.content}

Create a JSON response with:
{
  "storyTitle": "A catchy educational title for the story",
  "mainLesson": "The key learning point (1-2 sentences)",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Scene title",
      "narrative": "A paragraph of story narrative suitable for children",
      "lesson": "What children learn from this scene",
      "characterAction": "What the character does in response"
    }
  ],
  "safetyTips": ["tip1", "tip2", "tip3"],
  "discussionQuestions": ["question1", "question2"]
}

Keep the language simple, engaging, and age-appropriate. Focus on positive action and empowerment.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('⚠️  Could not parse Gemini response');
      return null;
    }

    const storyData = JSON.parse(jsonMatch[0]);
    return storyData;
  } catch (error) {
    console.error(`❌ Error generating story: ${error.message}`);
    return null;
  }
}

/**
 * Post news story to backend
 */
async function postNewsStory(article, storyData, topicId) {
  try {
    const payload = {
      title: storyData.storyTitle || article.title,
      description: storyData.mainLesson || article.description,
      content: article.content,
      category: 'general',
      topicId: topicId || null,
      sourceArticleUrl: article.url,
      sourceArticleTitle: article.title,
      imageUrl: article.urlToImage,
      storyJson: storyData,
      isPublished: true,
    };

    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log(`✅ Posted story: ${payload.title}`);
    return result;
  } catch (error) {
    console.error(`❌ Error posting story: ${error.message}`);
    return null;
  }
}

/**
 * Main function: Fetch news, generate stories, post to backend
 */
async function main() {
  console.log('🚀 News Fetcher Service Starting...\n');

  // Validate environment variables
  if (!NEWSAPI_KEY || NEWSAPI_KEY.includes('your-newsapi-key')) {
    console.error('❌ NEWSAPI_KEY not configured. Get one at https://newsapi.org/');
    process.exit(1);
  }

  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('your-gemini-api-key')) {
    console.error('❌ GEMINI_API_KEY not configured. Get one at https://makersuite.google.com/app/apikey');
    process.exit(1);
  }

  // Fetch articles
  const articles = await fetchNewsArticles();
  if (articles.length === 0) {
    console.log('No articles to process');
    process.exit(0);
  }

  // Process each article
  let successCount = 0;
  for (const article of articles) {
    console.log(`\n📝 Processing: ${article.title.substring(0, 50)}...`);

    // Generate story
    const storyData = await generateStoryFromArticle(article);
    if (!storyData) {
      console.log('⏭️  Skipping (generation failed)');
      continue;
    }

    // Post to backend
    const posted = await postNewsStory(article, storyData, null);
    if (posted) {
      successCount++;
    }

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`\n✅ Completed! ${successCount}/${articles.length} stories posted\n`);
  process.exit(0);
}

// Run
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
