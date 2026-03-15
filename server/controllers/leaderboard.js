import { Leaderboard, User, QuizProgress, UserStoryProgress, Mood } from '../models/index.js';
import { sequelize } from '../models/index.js';

/**
 * Get leaderboard by period
 */
export const getLeaderboard = async (req, res) => {
  try {
    const { period = 'all-time', limit = 50 } = req.query;
    const maxLimit = Math.min(parseInt(limit) || 50, 100);

    const entries = await Leaderboard.findAll({
      where: { period },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar', 'age'],
        },
      ],
      order: [['totalPoints', 'DESC']],
      limit: maxLimit,
    });

    res.json({
      success: true,
      data: entries,
    });
  } catch (error) {
    console.error('GetLeaderboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard',
    });
  }
};

/**
 * Get user's rank
 */
export const getUserRank = async (req, res) => {
  try {
    const { period = 'all-time' } = req.query;
    const userId = req.user.id;

    const entry = await Leaderboard.findOne({
      where: { userId, period },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar', 'age'],
        },
      ],
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'User not in leaderboard',
      });
    }

    res.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error('GetUserRank error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user rank',
    });
  }
};

/**
 * Update leaderboard (should be called periodically or on user activity)
 */
export const updateLeaderboard = async (req, res) => {
  try {
    const periods = ['all-time', 'monthly', 'weekly'];

    for (const period of periods) {
      // Get the date range
      let startDate = new Date('2000-01-01');
      if (period === 'weekly') {
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      } else if (period === 'monthly') {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }

      // Get all users
      const users = await User.findAll({
        attributes: ['id'],
      });

      const leaderboardData = [];

      for (const user of users) {
        // Calculate stats
        const quizzes = await QuizProgress.findAll({
          where: {
            userId: user.id,
            completedAt: { [sequelize.Sequelize.Op.gte]: startDate },
          },
        });

        const stories = await UserStoryProgress.findAll({
          where: {
            userId: user.id,
            status: 'completed',
            completedAt: { [sequelize.Sequelize.Op.gte]: startDate },
          },
        });

        const moods = await Mood.findAll({
          where: {
            userId: user.id,
            createdAt: { [sequelize.Sequelize.Op.gte]: startDate },
          },
        });

        const totalQuizPoints = quizzes.reduce((sum, q) => sum + q.pointsEarned, 0);
        const totalStoryPoints = stories.reduce((sum, s) => sum + s.pointsEarned, 0);
        const moodPoints = moods.length * 5; // 5 points per mood log

        const totalPoints = totalQuizPoints + totalStoryPoints + moodPoints;

        if (totalPoints > 0) {
          leaderboardData.push({
            userId: user.id,
            period,
            totalPoints,
            quizzesCompleted: new Set(quizzes.map(q => q.quizId)).size,
            storiesCompleted: stories.length,
            journalCount: 0, // TODO: Add journal count
            moodLogsCount: moods.length,
            streak: 0, // TODO: Calculate streak
            lastActivityAt: new Date(),
            periodStartAt: startDate,
          });
        }
      }

      // Sort by total points and assign ranks
      leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);
      
      leaderboardData.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      // Clear existing entries for this period and insert new ones
      await Leaderboard.destroy({ where: { period } });
      
      if (leaderboardData.length > 0) {
        await Leaderboard.bulkCreate(leaderboardData);
      }
    }

    res.json({
      success: true,
      message: 'Leaderboard updated successfully',
    });
  } catch (error) {
    console.error('UpdateLeaderboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update leaderboard',
    });
  }
};

export default {
  getLeaderboard,
  getUserRank,
  updateLeaderboard,
};
