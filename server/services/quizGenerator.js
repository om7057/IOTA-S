/**
 * Quiz Generator Service
 * Generates quizzes using Google Gemini API following the same pattern as story_generator.py
 * Includes retry logic, caching, and fallback demo mode
 */

import { logger } from '../utils/logger.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';
const BASE_GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Simple in-memory cache (fallback if node-cache not available)
const quizCache = new Map();
const cacheTimestamps = new Map();
const CACHE_TTL = 3600000; // 1 hour in milliseconds

/**
 * Check and clean expired cache entries
 */
function cleanCache() {
  const now = Date.now();
  for (const [key, timestamp] of cacheTimestamps.entries()) {
    if (now - timestamp > CACHE_TTL) {
      quizCache.delete(key);
      cacheTimestamps.delete(key);
    }
  }
}

/**
 * Generate quiz from story content using Gemini API
 * @param {Object} storyData - Story object with title, description, content, category
 * @param {string} storyId - Story UUID for cache key
 * @returns {Promise<Object>} Generated quiz with questions
 */
export const generateQuizFromStory = async (storyData, storyId) => {
  if (!GEMINI_API_KEY) {
    logger.warn('No GEMINI_API_KEY provided, using demo quiz');
    return getDemoQuiz(storyData);
  }

  // Clean expired cache entries
  cleanCache();

  // Check cache first
  const cacheKey = `quiz_${storyId}`;
  if (quizCache.has(cacheKey)) {
    logger.info(`Using cached quiz for story ${storyId}`);
    return quizCache.get(cacheKey);
  }

  // Retry logic with exponential backoff
  const maxRetries = 3;
  const retryDelay = 2000; // milliseconds

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const quiz = await callGeminiAPI(storyData);
      quizCache.set(cacheKey, quiz);
      cacheTimestamps.set(cacheKey, Date.now());
      return quiz;
    } catch (error) {
      if (attempt < maxRetries - 1) {
        const delay = retryDelay * Math.pow(2, attempt);
        logger.warn(
          `Quiz generation attempt ${attempt + 1} failed, retrying in ${delay}ms:`,
          error.message
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        logger.error(`Quiz generation failed after ${maxRetries} attempts:`, error);
        // Fallback to demo quiz
        return getDemoQuiz(storyData);
      }
    }
  }
};

/**
 * Call Google Gemini API to generate quiz
 * @param {Object} storyData - Story content to generate quiz from
 * @returns {Promise<Object>} Generated quiz structure
 */
async function callGeminiAPI(storyData) {
  const storyContent = `
Title: ${storyData.title}
Description: ${storyData.description || ''}
Content: ${storyData.content || ''}
Category: ${storyData.category || 'general'}
  `.trim();

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `Create an educational quiz based on this story:

${storyContent}

REQUIREMENTS - STRICTLY FOLLOW:
1. Generate 4-6 quiz questions that test understanding of the story
2. Focus on key learning outcomes and safety lessons from the story
3. Question types: Use mix of multiple-choice (2-4 options), true-false
4. Each question should have:
   - "question": The question text (clear, child-friendly)
   - "type": "multiple-choice" or "true-false"
   - "options": Array of option strings (2-4 for multiple-choice, ["True", "False"] for true-false)
   - "correctAnswer": The correct option text or index
   - "points": 10 or 20 (based on difficulty)
   - "explanation": 1-2 sentence explanation of why answer is correct

5. Content requirements:
   - Match difficulty level of the story
   - Test comprehension, not trivial recall
   - Include at least one "consequence" question (what would happen if...)
   - At least one question about the lesson/safety concept
   - Avoid trick questions; focus on learning

6. Structure for response:
   - "title": "{Story Title} - Learning Quiz" 
   - "description": "Test your understanding of {story topic}"
   - "category": Same as story (anxiety/depression/social/academic/family/health/identity/general)
   - "difficultyLevel": "beginner" or "intermediate" (match story difficulty)
   - "timeLimit": 10 (minutes - reasonable for 4-6 questions)
   - "passingScore": 70
   - "questions": Array of question objects

RETURN FORMAT - ONLY VALID JSON, NO MARKDOWN:
{
  "title": "Story Title - Learning Quiz",
  "description": "Test your understanding...",
  "category": "anxiety|depression|social|academic|family|health|identity|general",
  "difficultyLevel": "beginner|intermediate|advanced",
  "timeLimit": 10,
  "passingScore": 70,
  "questions": [
    {
      "question": "Question text here?",
      "type": "multiple-choice",
      "options": ["Option A", "Option B", "Option C"],
      "correctAnswer": "Option A",
      "points": 20,
      "explanation": "Explanation of correct answer."
    }
  ]
}`,
          },
        ],
      },
    ],
  };

  const url = `${BASE_GEMINI_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Gemini API error (${response.status}): ${
        errorData?.error?.message || response.statusText
      }`
    );
  }

  const data = await response.json();

  // Extract and parse the quiz JSON from the response
  if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid Gemini API response structure');
  }

  const responseText = data.candidates[0].content.parts[0].text;

  // Parse JSON from response (may be wrapped in markdown code blocks)
  let quizJson;
  try {
    // Try direct JSON parse first
    quizJson = JSON.parse(responseText);
  } catch {
    // Try extracting JSON from markdown code blocks
    const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      quizJson = JSON.parse(jsonMatch[1]);
    } else {
      throw new Error('Could not parse quiz JSON from Gemini response');
    }
  }

  // Validate and normalize quiz structure
  return normalizeQuizStructure(quizJson, storyData.category);
}

/**
 * Normalize and validate quiz structure to ensure DB compatibility
 * @param {Object} quiz - Raw quiz from LLM
 * @param {string} storyCategory - Category for default fallback
 * @returns {Object} Normalized quiz
 */
function normalizeQuizStructure(quiz, storyCategory = 'general') {
  const validCategories = ['anxiety', 'depression', 'social', 'academic', 'family', 'health', 'identity', 'general'];
  const validDifficulties = ['beginner', 'intermediate', 'advanced'];
  const validTypes = ['multiple-choice', 'true-false', 'short-answer', 'matching', 'fill-blank'];

  return {
    title: quiz.title || 'Learning Quiz',
    description: quiz.description || 'Test your understanding',
    category: validCategories.includes(quiz.category)
      ? quiz.category
      : validCategories.includes(storyCategory)
      ? storyCategory
      : 'general',
    difficultyLevel: validDifficulties.includes(quiz.difficultyLevel)
      ? quiz.difficultyLevel
      : 'beginner',
    timeLimit: Math.max(5, Math.min(60, quiz.timeLimit || 10)),
    passingScore: Math.max(0, Math.min(100, quiz.passingScore || 70)),
    questions: (quiz.questions || []).map((q, idx) => ({
      question: q.question || `Question ${idx + 1}`,
      type: validTypes.includes(q.type) ? q.type : 'multiple-choice',
      options: sanitizeOptions(q.options || []),
      correctAnswer: q.correctAnswer || (q.options?.[0] || ''),
      points: Math.max(1, Math.min(100, q.points || 10)),
      explanation: q.explanation || '',
    })),
  };
}

/**
 * Sanitize quiz options to remove emoji and special characters from beginning
 * @param {Array} options - Array of option strings
 * @returns {Array} Sanitized options
 */
function sanitizeOptions(options) {
  return options.map((opt) => {
    if (typeof opt !== 'string') {
      return String(opt);
    }
    // Remove leading emoji/symbols (same regex as frontend)
    return opt.replace(/^[\s\uFE0F\u200D\p{Extended_Pictographic}✓✔✗✕☑☒]+/gu, '').trim();
  });
}

/**
 * Get demo/fallback quiz when API is unavailable
 * @param {Object} storyData - Story data to base demo quiz on
 * @returns {Object} Demo quiz structure
 */
function getDemoQuiz(storyData) {
  const title = storyData.title || 'Untitled Story';
  return {
    title: `${title} - Learning Quiz`,
    description: `Test your understanding of ${title}`,
    category: storyData.category || 'general',
    difficultyLevel: 'beginner',
    timeLimit: 10,
    passingScore: 70,
    questions: [
      {
        question: 'What was the main topic of this story?',
        type: 'multiple-choice',
        options: [
          'Personal safety and decision-making',
          'Mathematical concepts',
          'Historical events',
        ],
        correctAnswer: 'Personal safety and decision-making',
        points: 20,
        explanation:
          'This story focused on helping you understand important safety concepts and decision-making skills.',
      },
      {
        question: 'Did the story present both positive and negative outcomes?',
        type: 'true-false',
        options: ['True', 'False'],
        correctAnswer: 'True',
        points: 10,
        explanation:
          'Educational stories show both the consequences of good and poor choices.',
      },
      {
        question: 'What should you do if you encounter a situation like the one in the story?',
        type: 'multiple-choice',
        options: [
          'Ignore it and hope it goes away',
          'React quickly without thinking',
          'Think through your options and seek help from trusted adults',
          'Handle it alone without telling anyone',
        ],
        correctAnswer: 'Think through your options and seek help from trusted adults',
        points: 20,
        explanation:
          'The best response is to pause, think about your choices, and ask trusted adults (parents, teachers, counselors) for help.',
      },
      {
        question: 'Why is it important to understand different perspectives in situations?',
        type: 'multiple-choice',
        options: [
          'It confuses decision-making',
          'It helps you understand consequences before making choices',
          'It is not important',
          'It only matters for adults',
        ],
        correctAnswer: 'It helps you understand consequences before making choices',
        points: 20,
        explanation: 'Understanding different perspectives helps you anticipate outcomes and make better decisions.',
      },
    ],
  };
}

/**
 * Clear cache for a specific quiz or all quizzes
 * @param {string} storyId - Optional story ID to clear specific cache
 */
export const clearQuizCache = (storyId = null) => {
  if (storyId) {
    const key = `quiz_${storyId}`;
    quizCache.delete(key);
    cacheTimestamps.delete(key);
    logger.info(`Cleared quiz cache for story ${storyId}`);
  } else {
    quizCache.clear();
    cacheTimestamps.clear();
    logger.info('Cleared all quiz cache');
  }
};

/**
 * Get cache statistics
 * @returns {Object} Cache info
 */
export const getQuizCacheStats = () => {
  cleanCache();
  return {
    size: quizCache.size,
    keys: Array.from(quizCache.keys()),
  };
};
