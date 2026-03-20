import { Leaderboard, User, QuizProgress, UserStoryProgress } from '../models/index.js';
import { sequelize } from '../models/index.js';
import { Op } from 'sequelize';
import { getMongoDb, isMongoPrimaryEnabled } from '../config/mongo.js';

/**
 * Get leaderboard by period
 */
export const getLeaderboard = async (req, res) => {
  try {
    const { period = 'all-time', limit = 50 } = req.query;
    const maxLimit = Math.min(parseInt(limit) || 50, 100);

    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      const entries = await db
        .collection('leaderboards')
        .find({ period })
        .sort({ totalPoints: -1 })
        .limit(maxLimit)
        .toArray();

      const userIds = entries.map((entry) => entry.userId).filter(Boolean);
      const users = await db
        .collection('users')
        .find({ id: { $in: userIds }, deletedAt: null })
        .project({ _id: 0, id: 1, firstName: 1, lastName: 1, avatarUrl: 1, age: 1, email: 1 })
        .toArray();

      const userById = new Map(users.map((user) => [user.id, user]));

      const normalized = entries.map((entry) => {
        const user = userById.get(entry.userId) || null;
        const username = user
          ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Learner'
          : 'Learner';

        return {
          ...entry,
          user: user
            ? {
                ...user,
                username,
                avatar: user.avatarUrl || null,
              }
            : null,
        };
      });

      return res.json({
        success: true,
        data: normalized,
      });
    }

    const entries = await Leaderboard.findAll({
      where: { period },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'avatarUrl', 'age', 'email'],
        },
      ],
      order: [['totalPoints', 'DESC']],
      limit: maxLimit,
    });

    const normalized = entries.map((entry) => {
      const raw = entry.toJSON();
      const user = raw.user || null;
      const username = user
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Learner'
        : 'Learner';

      return {
        ...raw,
        user: user
          ? {
              ...user,
              username,
              avatar: user.avatarUrl || null,
            }
          : null,
      };
    });

    res.json({
      success: true,
      data: normalized,
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

    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      const entry = await db.collection('leaderboards').findOne({ userId, period });

      if (!entry) {
        return res.json({
          success: true,
          data: {
            userId,
            period,
            rank: null,
            totalPoints: 0,
            quizzesCompleted: 0,
            storiesCompleted: 0,
            journalCount: 0,
            moodLogsCount: 0,
            streak: 0,
            user: null,
          },
        });
      }

      const user = await db
        .collection('users')
        .findOne(
          { id: userId, deletedAt: null },
          { projection: { _id: 0, id: 1, firstName: 1, lastName: 1, avatarUrl: 1, age: 1, email: 1 } }
        );

      const username = user
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Learner'
        : 'Learner';

      return res.json({
        success: true,
        data: {
          ...entry,
          user: user
            ? {
                ...user,
                username,
                avatar: user.avatarUrl || null,
              }
            : null,
        },
      });
    }

    const entry = await Leaderboard.findOne({
      where: { userId, period },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'avatarUrl', 'age', 'email'],
        },
      ],
    });

    if (!entry) {
      return res.json({
        success: true,
        data: {
          userId,
          period,
          rank: null,
          totalPoints: 0,
          quizzesCompleted: 0,
          storiesCompleted: 0,
          journalCount: 0,
          moodLogsCount: 0,
          streak: 0,
          user: null,
        },
      });
    }

    const raw = entry.toJSON();
    const user = raw.user || null;
    const username = user
      ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Learner'
      : 'Learner';

    res.json({
      success: true,
      data: {
        ...raw,
        user: user
          ? {
              ...user,
              username,
              avatar: user.avatarUrl || null,
            }
          : null,
      },
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
            completedAt: { [Op.gte]: startDate },
          },
        });

        const stories = await UserStoryProgress.findAll({
          where: {
            userId: user.id,
            status: 'completed',
            completedAt: { [Op.gte]: startDate },
          },
        });

        const totalQuizPoints = quizzes.reduce((sum, q) => sum + q.pointsEarned, 0);
        const totalStoryPoints = stories.reduce((sum, s) => sum + s.pointsEarned, 0);
        const moodPoints = 0;

        const totalPoints = totalQuizPoints + totalStoryPoints + moodPoints;

        if (totalPoints > 0) {
          leaderboardData.push({
            userId: user.id,
            period,
            totalPoints,
            quizzesCompleted: new Set(quizzes.map(q => q.quizId)).size,
            storiesCompleted: stories.length,
            journalCount: 0, // TODO: Add journal count
            moodLogsCount: 0,
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
