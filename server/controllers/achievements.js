import { Badge, UserAchievement, User } from '../models/index.js';
import { logger } from '../utils/logger.js';

/**
 * Get all available badges
 */
export const getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.findAll({
      where: { isActive: true },
      order: [['rarity', 'DESC'], ['category', 'ASC']],
    });

    res.json({
      success: true,
      count: badges.length,
      data: badges,
    });
  } catch (error) {
    logger.error('Error fetching badges', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to fetch badges' });
  }
};

/**
 * Get user's achievements/unlocked badges
 */
export const getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;

    const achievements = await UserAchievement.findAll({
      where: { userId },
      include: [
        {
          model: Badge,
          as: 'badge',
          attributes: ['id', 'name', 'description', 'icon', 'category', 'rarity', 'points'],
        },
      ],
      order: [['unlockedAt', 'DESC']],
    });

    // Calculate stats
    const totalPoints = achievements.reduce((sum, ach) => sum + (ach.badge.points || 0), 0);
    const completedCount = achievements.filter(a => a.isCompleted).length;

    res.json({
      success: true,
      data: {
        achievements,
        stats: {
          total: achievements.length,
          completed: completedCount,
          totalPoints,
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching user achievements', { error: error.message, userId: req.params.userId });
    res.status(500).json({ success: false, message: 'Failed to fetch achievements' });
  }
};

/**
 * Get achievement progress
 */
export const getAchievementProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    const allBadges = await Badge.findAll({ where: { isActive: true } });
    const userAchievements = await UserAchievement.findAll({ where: { userId } });

    const userAchievementMap = new Map(userAchievements.map(ua => [ua.badgeId, ua]));

    const progress = allBadges.map(badge => {
      const userAchievement = userAchievementMap.get(badge.id);
      return {
        badgeId: badge.id,
        name: badge.name,
        category: badge.category,
        rarity: badge.rarity,
        isUnlocked: !!userAchievement && userAchievement.isCompleted,
        progress: userAchievement?.progress || 0,
        unlockedAt: userAchievement?.unlockedAt,
      };
    });

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    logger.error('Error fetching achievement progress', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to fetch progress' });
  }
};

/**
 * Award badge to user (admin/system only)
 */
export const awardBadge = async (req, res) => {
  try {
    const { userId, badgeId } = req.body;

    // Verify badge exists
    const badge = await Badge.findByPk(badgeId);
    if (!badge) {
      return res.status(404).json({ success: false, message: 'Badge not found' });
    }

    // Check if already awarded
    const existing = await UserAchievement.findOne({
      where: { userId, badgeId },
    });

    if (existing && existing.isCompleted) {
      return res.status(400).json({ success: false, message: 'Badge already awarded' });
    }

    // Create or update achievement
    const [achievement, created] = await UserAchievement.findOrCreate({
      where: { userId, badgeId },
      defaults: {
        isCompleted: true,
        progress: 100,
        unlockedAt: new Date(),
      },
    });

    if (!created) {
      await achievement.update({
        isCompleted: true,
        progress: 100,
        unlockedAt: new Date(),
      });
    }

    // Emit notification if Socket.io is available
    if (global.notificationService) {
      global.notificationService.notifyUser(userId, {
        type: 'achievement_unlocked',
        title: `🏆 Achievement Unlocked!`,
        message: `You earned the "${badge.name}" badge!`,
        badgeId,
        points: badge.points,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Badge awarded successfully',
      data: achievement,
    });
  } catch (error) {
    logger.error('Error awarding badge', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to award badge' });
  }
};

/**
 * Update achievement progress
 */
export const updateAchievementProgress = async (req, res) => {
  try {
    const { userId, badgeId, progress, metadata } = req.body;

    const achievement = await UserAchievement.findOne({
      where: { userId, badgeId },
    });

    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }

    // Check if should be completed (progress >= 100)
    const isCompleted = Math.min(progress || achievement.progress, 100) >= 100;

    const updated = await achievement.update({
      progress: Math.min(progress || achievement.progress, 100),
      isCompleted,
      unlockedAt: isCompleted && !achievement.isCompleted ? new Date() : achievement.unlockedAt,
      metadata: metadata || achievement.metadata,
    });

    // Notify if just completed
    if (isCompleted && !achievement.isCompleted) {
      const badge = await Badge.findByPk(badgeId);
      if (global.notificationService) {
        global.notificationService.notifyUser(userId, {
          type: 'achievement_unlocked',
          title: `🏆 Achievement Unlocked!`,
          message: `You earned the "${badge.name}" badge!`,
          badgeId,
          points: badge.points,
        });
      }
    }

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    logger.error('Error updating achievement progress', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to update progress' });
  }
};

/**
 * Get leaderboard by badge/category
 */
export const getBadgeLeaderboard = async (req, res) => {
  try {
    const { category, limit = 50 } = req.query;

    let where = { isCompleted: true };
    if (category) {
      where = {
        ...where,
        '$badge.category$': category,
      };
    }

    const leaderboard = await UserAchievement.findAll({
      where,
      include: [
        { model: Badge, as: 'badge' },
        { model: User, as: 'user', attributes: ['id', 'name', 'avatar'] },
      ],
      order: [['unlockedAt', 'DESC']],
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    logger.error('Error fetching badge leaderboard', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
  }
};

export default {
  getAllBadges,
  getUserAchievements,
  getAchievementProgress,
  awardBadge,
  updateAchievementProgress,
  getBadgeLeaderboard,
};
