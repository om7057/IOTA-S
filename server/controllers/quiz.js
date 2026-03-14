import { Quiz, QuizQuestion, QuizProgress } from '../models/index.js';
import { User } from '../models/index.js';

/**
 * Get all quizzes with filtering
 */
export const getAllQuizzes = async (req, res) => {
  try {
    const { category, difficulty, published = true } = req.query;
    
    const where = {};
    if (published === 'true' || published === true) {
      where.isPublished = true;
    }
    if (category) where.category = category;
    if (difficulty) where.difficultyLevel = difficulty;

    const quizzes = await Quiz.findAll({
      where,
      include: [
        {
          model: QuizQuestion,
          as: 'questions',
          attributes: ['id', 'sequence', 'type', 'prompt', 'points'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: quizzes,
      total: quizzes.length,
    });
  } catch (error) {
    console.error('GetAllQuizzes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quizzes',
    });
  }
};

/**
 * Get quiz by ID
 */
export const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findByPk(id, {
      include: [
        {
          model: QuizQuestion,
          as: 'questions',
          attributes: ['id', 'sequence', 'type', 'prompt', 'options', 'points', 'hints'],
          order: [['sequence', 'ASC']],
        },
      ],
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
      });
    }

    res.json({ success: true, data: quiz });
  } catch (error) {
    console.error('GetQuizById error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quiz',
    });
  }
};

/**
 * Create new quiz (ADMIN)
 */
export const createQuiz = async (req, res) => {
  try {
    const { title, description, category, difficultyLevel, timeLimit, passingScore, tags } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        error: 'Title and category are required',
      });
    }

    const quiz = await Quiz.create({
      title,
      description,
      category,
      difficultyLevel: difficultyLevel || 'beginner',
      timeLimit,
      passingScore: passingScore || 70,
      tags: tags || [],
    });

    res.status(201).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error('CreateQuiz error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create quiz',
    });
  }
};

/**
 * Update quiz (ADMIN)
 */
export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, difficultyLevel, timeLimit, passingScore, isPublished, tags } = req.body;

    const quiz = await Quiz.findByPk(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
      });
    }

    if (title) quiz.title = title;
    if (description) quiz.description = description;
    if (category) quiz.category = category;
    if (difficultyLevel) quiz.difficultyLevel = difficultyLevel;
    if (typeof timeLimit !== 'undefined') quiz.timeLimit = timeLimit;
    if (passingScore) quiz.passingScore = passingScore;
    if (typeof isPublished !== 'undefined') quiz.isPublished = isPublished;
    if (tags) quiz.tags = tags;

    await quiz.save();

    res.json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error('UpdateQuiz error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update quiz',
    });
  }
};

/**
 * Delete quiz (ADMIN)
 */
export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findByPk(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
      });
    }

    await quiz.destroy();

    res.json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    console.error('DeleteQuiz error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete quiz',
    });
  }
};

/**
 * Add question to quiz (ADMIN)
 */
export const addQuestionToQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, prompt, options, correctAnswer, explanation, points, hints } = req.body;

    const quiz = await Quiz.findByPk(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
      });
    }

    // Get next sequence number
    const lastQuestion = await QuizQuestion.findOne({
      where: { quizId: id },
      order: [['sequence', 'DESC']],
    });

    const sequence = (lastQuestion?.sequence || 0) + 1;

    const question = await QuizQuestion.create({
      quizId: id,
      sequence,
      type: type || 'multiple-choice',
      prompt,
      options,
      correctAnswer,
      explanation,
      points: points || 1,
      hints: hints || [],
    });

    // Update quiz counters
    quiz.questionCount = (quiz.questionCount || 0) + 1;
    quiz.totalPoints = (quiz.totalPoints || 0) + (points || 1);
    await quiz.save();

    res.status(201).json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error('AddQuestionToQuiz error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add question',
    });
  }
};

/**
 * Update quiz question (ADMIN)
 */
export const updateQuestion = async (req, res) => {
  try {
    const { id, questionId } = req.params;
    const { type, prompt, options, correctAnswer, explanation, points, hints } = req.body;

    const question = await QuizQuestion.findByPk(questionId);

    if (!question || question.quizId !== id) {
      return res.status(404).json({
        success: false,
        error: 'Question not found',
      });
    }

    const pointsDiff = (points || question.points) - question.points;

    if (type) question.type = type;
    if (prompt) question.prompt = prompt;
    if (options) question.options = options;
    if (correctAnswer) question.correctAnswer = correctAnswer;
    if (explanation) question.explanation = explanation;
    if (typeof points !== 'undefined') question.points = points;
    if (hints) question.hints = hints;

    await question.save();

    // Update quiz total points
    if (pointsDiff !== 0) {
      const quiz = await Quiz.findByPk(id);
      quiz.totalPoints = Math.max(0, (quiz.totalPoints || 0) + pointsDiff);
      await quiz.save();
    }

    res.json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error('UpdateQuestion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update question',
    });
  }
};

/**
 * Delete quiz question (ADMIN)
 */
export const deleteQuestion = async (req, res) => {
  try {
    const { id, questionId } = req.params;

    const question = await QuizQuestion.findByPk(questionId);

    if (!question || question.quizId !== id) {
      return res.status(404).json({
        success: false,
        error: 'Question not found',
      });
    }

    const pointsRemoved = question.points;
    await question.destroy();

    // Update quiz counters
    const quiz = await Quiz.findByPk(id);
    quiz.questionCount = Math.max(0, (quiz.questionCount || 0) - 1);
    quiz.totalPoints = Math.max(0, (quiz.totalPoints || 0) - pointsRemoved);
    await quiz.save();

    res.json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    console.error('DeleteQuestion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete question',
    });
  }
};

/**
 * Submit quiz attempt and calculate score
 */
export const submitQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers, timeSpent } = req.body;
    const userId = req.user.id;

    const quiz = await Quiz.findByPk(quizId, {
      include: [
        {
          model: QuizQuestion,
          as: 'questions',
          attributes: ['id', 'correctAnswer', 'points', 'sequence'],
        },
      ],
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
      });
    }

    // Calculate score
    let totalScore = 0;
    let pointsEarned = 0;
    const scoredAnswers = {};

    for (const question of quiz.questions) {
      const userAnswer = answers[question.id];
      const isCorrect = compareAnswers(userAnswer, question.correctAnswer);

      scoredAnswers[question.id] = {
        userAnswer,
        correct: isCorrect,
        points: isCorrect ? question.points : 0,
      };

      pointsEarned += isCorrect ? question.points : 0;
      totalScore += question.points;
    }

    const scorePercentage = Math.round((pointsEarned / quiz.totalPoints) * 100);
    const passed = scorePercentage >= quiz.passingScore;

    // Create progress record
    const lastAttempt = await QuizProgress.findOne({
      where: { userId, quizId },
      order: [['attempt', 'DESC']],
    });

    const attempt = (lastAttempt?.attempt || 0) + 1;

    const progress = await QuizProgress.create({
      userId,
      quizId,
      attempt,
      score: scorePercentage,
      pointsEarned,
      totalPoints: quiz.totalPoints,
      passed,
      timeSpent,
      answers: scoredAnswers,
      completedAt: new Date(),
    });

    // Update quiz stats
    const allAttempts = await QuizProgress.findAll({
      where: { quizId },
    });

    const totalAttempts = allAttempts.length;
    const avgScore = Math.round(
      allAttempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts
    );

    quiz.attemptCount = totalAttempts;
    quiz.averageScore = avgScore;
    await quiz.save();

    res.json({
      success: true,
      data: {
        progress,
        scorePercentage,
        passed,
        pointsEarned,
        totalPoints: quiz.totalPoints,
        attempt,
      },
    });
  } catch (error) {
    console.error('SubmitQuizAttempt error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit quiz',
    });
  }
};

/**
 * Get user's quiz attempts
 */
export const getUserQuizAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const attempts = await QuizProgress.findAll({
      where: { userId, quizId },
      order: [['attempt', 'DESC']],
    });

    res.json({
      success: true,
      data: attempts,
    });
  } catch (error) {
    console.error('GetUserQuizAttempts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quiz attempts',
    });
  }
};

/**
 * Get user's quiz statistics
 */
export const getUserQuizStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await QuizProgress.findAll({
      where: { userId },
      include: [
        {
          model: Quiz,
          as: 'quiz',
          attributes: ['id', 'title', 'category', 'difficultyLevel'],
        },
      ],
      order: [['completedAt', 'DESC']],
    });

    const quizzesCompleted = new Set(stats.map(s => s.quizId)).size;
    const totalPoints = stats.reduce((sum, s) => sum + s.pointsEarned, 0);
    const avgScore = stats.length > 0
      ? Math.round(stats.reduce((sum, s) => sum + s.score, 0) / stats.length)
      : 0;
    const passCount = stats.filter(s => s.passed).length;

    res.json({
      success: true,
      data: {
        totalAttempts: stats.length,
        quizzesCompleted,
        totalPoints,
        avgScore,
        passCount,
        attempts: stats,
      },
    });
  } catch (error) {
    console.error('GetUserQuizStats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quiz statistics',
    });
  }
};

/**
 * Helper function to compare user answer with correct answer
 */
function compareAnswers(userAnswer, correctAnswer) {
  if (!userAnswer || !correctAnswer) return false;

  // For multiple choice / true false
  if (typeof correctAnswer === 'string' || typeof correctAnswer === 'boolean') {
    return userAnswer === correctAnswer;
  }

  // For arrays (multiple answers)
  if (Array.isArray(correctAnswer)) {
    if (!Array.isArray(userAnswer)) return false;
    if (userAnswer.length !== correctAnswer.length) return false;
    return userAnswer.sort().every((a, i) => a === correctAnswer.sort()[i]);
  }

  // For objects (matching, complex answers)
  if (typeof correctAnswer === 'object') {
    return JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
  }

  return false;
}

export default {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestionToQuiz,
  updateQuestion,
  deleteQuestion,
  submitQuizAttempt,
  getUserQuizAttempts,
  getUserQuizStats,
};
