import {
  ParentalAccount,
  User,
  Journal,
  Story,
  UserStoryProgress,
  ChildrenProgress,
  ChildrenChallengeProgress,
} from '../models/index.js';
import { logger } from '../utils/logger.js';
import { getMongoDb, isMongoPrimaryEnabled } from '../config/mongo.js';
import { v4 as uuidv4 } from 'uuid';

const formatUserName = (user) => {
  if (!user) return 'Unknown User';
  if (user.displayName) return user.displayName;
  const first = user.firstName || '';
  const last = user.lastName || '';
  const full = `${first} ${last}`.trim();
  return full || user.email || 'Unknown User';
};

/**
 * Create parental link - parent adds child
 */

/**
 * Helper: Validate parent-child relationship
 */
async function validateParentChildRelation(db, parentId, childId) {
  const link = await db.collection('parent_child_links').findOne({
    parentId,
    childId,
    isApproved: true,
    deletedAt: null,
  });
  return !!link;
}

export const createParentalLink = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    if (!requesterId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { childUserId, childEmail, relationship = 'parent' } = req.body;

    const parent = await User.findByPk(requesterId);
    if (!parent) {
      return res.status(404).json({ success: false, message: 'Parent user not found' });
    }

    let child = null;
    if (childUserId) {
      child = await User.findByPk(childUserId);
    } else if (childEmail) {
      child = await User.findOne({ where: { email: String(childEmail).toLowerCase() } });
    }

    if (!child) {
      return res.status(404).json({ success: false, message: 'Child user not found' });
    }

    if (child.id === parent.id) {
      return res.status(400).json({ success: false, message: 'You cannot link your own account as a child' });
    }

    const [account, created] = await ParentalAccount.findOrCreate({
      where: { childUserId: child.id, parentUserId: parent.id },
      defaults: {
        relationship,
        isActive: false, // Needs child approval
      },
    });

    if (!created) {
      return res.status(400).json({ success: false, message: 'Parental link already exists' });
    }

    return res.status(201).json({
      success: true,
      message: 'Parental link created (pending child approval)',
      data: {
        id: account.id,
        relationship: account.relationship,
        isActive: account.isActive,
        approvedAt: account.approvedAt,
        child: {
          id: child.id,
          name: formatUserName(child),
          email: child.email,
          avatarUrl: child.avatarUrl || null,
          age: child.age,
          joinedAt: child.createdAt,
        },
      },
    });
  } catch (error) {
    logger.error('Error creating parental link', { error: error.message });
    return res.status(500).json({ success: false, message: 'Failed to create parental link' });
  }
};

/**
 * Child approves parental link
 */
export const approveParentalLink = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    const { parentalAccountId } = req.params;

    if (!requesterId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const account = await ParentalAccount.findByPk(parentalAccountId);
    if (!account || account.childUserId !== requesterId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await account.update({
      isActive: true,
      approvedAt: new Date(),
    });

    return res.json({
      success: true,
      message: 'Parental link approved',
      data: account,
    });
  } catch (error) {
    logger.error('Error approving parental link', { error: error.message });
    return res.status(500).json({ success: false, message: 'Failed to approve link' });
  }
};

/**
 * Get child's parental accounts (from child's perspective)
 */
export const getMyParents = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    const { userId } = req.params;

    if (!requesterId || requesterId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const parentLinks = await ParentalAccount.findAll({
      where: { childUserId: userId },
      include: [
        { model: User, as: 'parent', attributes: ['id', 'firstName', 'lastName', 'email', 'avatarUrl', 'createdAt'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      success: true,
      data: parentLinks.map((link) => ({
        id: link.id,
        relationship: link.relationship,
        isActive: link.isActive,
        approvedAt: link.approvedAt,
        allowNotifications: link.allowNotifications,
        parent: {
          id: link.parent?.id,
          name: formatUserName(link.parent),
          email: link.parent?.email || null,
          avatarUrl: link.parent?.avatarUrl || null,
          joinedAt: link.parent?.createdAt || null,
        },
      })),
    });
  } catch (error) {
    logger.error('Error fetching parental accounts', { error: error.message });
    return res.status(500).json({ success: false, message: 'Failed to fetch parental accounts' });
  }
};

/**
 * Get parent's children (from parent's perspective)
 */
export const getMyChildren = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    const { userId } = req.params;

    if (!requesterId || requesterId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const childLinks = await ParentalAccount.findAll({
      where: { parentUserId: userId },
      include: [
        { model: User, as: 'child', attributes: ['id', 'firstName', 'lastName', 'email', 'avatarUrl', 'age', 'createdAt'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const childIds = childLinks.map((link) => link.childUserId);
    const progressRows = childIds.length
      ? await ChildrenProgress.findAll({ where: { userId: childIds } })
      : [];

    const progressByUser = new Map(progressRows.map((row) => [row.userId, row]));

    return res.json({
      success: true,
      data: childLinks.map((link) => {
        const childProgress = progressByUser.get(link.childUserId);
        return {
          id: link.id,
          relationship: link.relationship,
          isActive: link.isActive,
          allowNotifications: link.allowNotifications,
          screenTimeLimit: link.screenTimeLimit,
          contentFilter: link.contentFilter,
          approvedAt: link.approvedAt,
          child: {
            id: link.child?.id,
            name: formatUserName(link.child),
            email: link.child?.email || null,
            avatarUrl: link.child?.avatarUrl || null,
            age: link.child?.age || null,
            joinedAt: link.child?.createdAt || null,
          },
          progress: {
            hearts: childProgress?.hearts ?? 5,
            points: childProgress?.points ?? 0,
            totalPoints: childProgress?.totalPoints ?? 0,
          },
        };
      }),
    });
  } catch (error) {
    logger.error('Error fetching children', { error: error.message });
    return res.status(500).json({ success: false, message: 'Failed to fetch children' });
  }
};

/**
 * Update parental permissions/settings
 */
export const updateParentalSettings = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    const { parentalAccountId } = req.params;
    const { permissions, screenTimeLimit, contentFilter, allowNotifications } = req.body;

    if (!requesterId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const account = await ParentalAccount.findByPk(parentalAccountId);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Parental account not found' });
    }

    if (account.parentUserId !== requesterId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const updates = {};
    if (permissions) updates.permissions = { ...account.permissions, ...permissions };
    if (screenTimeLimit !== undefined) updates.screenTimeLimit = screenTimeLimit;
    if (contentFilter) updates.contentFilter = contentFilter;
    if (allowNotifications !== undefined) updates.allowNotifications = allowNotifications;

    const updated = await account.update(updates);

    return res.json({
      success: true,
      message: 'Parental settings updated',
      data: updated,
    });
  } catch (error) {
    logger.error('Error updating parental settings', { error: error.message });
    return res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};

/**
 * Get child's activity summary (parent view)
 */
export const getChildActivity = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    const { childUserId } = req.params;

    if (!requesterId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const account = await ParentalAccount.findOne({
      where: { childUserId, parentUserId: requesterId, isActive: true },
    });

    if (!account) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const child = await User.findByPk(childUserId, {
      attributes: ['id', 'firstName', 'lastName', 'email', 'avatarUrl', 'createdAt', 'updatedAt'],
    });

    if (!child) {
      return res.status(404).json({ success: false, message: 'Child not found' });
    }

    const [progress, completedStories, challengeAttempts, recentJournals] = await Promise.all([
      ChildrenProgress.findOne({ where: { userId: childUserId } }),
      UserStoryProgress.findAll({
        where: { userId: childUserId, status: 'completed' },
        include: [{ model: Story, as: 'story', attributes: ['id', 'title', 'category'] }],
        order: [['completedAt', 'DESC']],
        limit: 10,
      }),
      ChildrenChallengeProgress.findAll({
        where: { userId: childUserId },
        order: [['updatedAt', 'DESC']],
      }),
      Journal.findAll({
        where: { userId: childUserId },
        order: [['createdAt', 'DESC']],
        limit: 10,
      }),
    ]);

    const totalChallengesAttempted = challengeAttempts.length;
    const completedChallenges = challengeAttempts.filter((row) => row.completed).length;
    const repeatedWrongAttempts = challengeAttempts.filter((row) => !row.completed && (row.attempts || 0) >= 3).length;

    const metadataAlerts = Array.isArray(account.metadata?.alerts) ? account.metadata.alerts : [];
    const latestAlerts = metadataAlerts
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 20);

    const normalizedStories = completedStories.map((item) => ({
      storyId: item.storyId,
      title: item.story?.title || 'Story',
      category: item.story?.category || 'general',
      completedAt: item.completedAt,
      pointsEarned: item.pointsEarned || 0,
    }));


    return res.json({
      success: true,
      data: {
        child: {
          id: child.id,
          name: formatUserName(child),
          email: child.email,
          avatarUrl: child.avatarUrl || null,
          joinedAt: child.createdAt,
        },
        activity: {
          alerts: latestAlerts,
          completedStories: normalizedStories,
          stats: {
            storiesCompleted: normalizedStories.length,
            totalChallengesAttempted,
            completedChallenges,
            repeatedWrongAttempts,
            hearts: progress?.hearts ?? 5,
            points: progress?.points ?? 0,
            totalPoints: progress?.totalPoints ?? 0,
            journalEntries: recentJournals.length,
          },
          recentJournals,
          activityAt: child.updatedAt,
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching child activity', { error: error.message });
    return res.status(500).json({ success: false, message: 'Failed to fetch activity' });
  }
};

/**
 * Block/unblock content or user for child
 */
export const updateBlockList = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    const { parentalAccountId, blockedUserId, action = 'add' } = req.body;

    if (!requesterId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const account = await ParentalAccount.findByPk(parentalAccountId);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Parental account not found' });
    }

    if (account.parentUserId !== requesterId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let blockedUsers = account.blockedUsers || [];
    if (action === 'add' && !blockedUsers.includes(blockedUserId)) {
      blockedUsers.push(blockedUserId);
    } else if (action === 'remove') {
      blockedUsers = blockedUsers.filter((id) => id !== blockedUserId);
    }

    await account.update({ blockedUsers });

    return res.json({
      success: true,
      message: `User ${action === 'add' ? 'blocked' : 'unblocked'}`,
      data: account,
    });
  } catch (error) {
    logger.error('Error updating block list', { error: error.message });
    return res.status(500).json({ success: false, message: 'Failed to update block list' });
  }
};

/**
 * Remove parental link
 */
export const removeParentalLink = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    const { parentalAccountId } = req.params;

    if (!requesterId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const account = await ParentalAccount.findByPk(parentalAccountId);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Parental account not found' });
    }

    if (account.parentUserId !== requesterId && account.childUserId !== requesterId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await account.destroy();

    return res.json({
      success: true,
      message: 'Parental link removed',
    });
  } catch (error) {
    logger.error('Error removing parental link', { error: error.message });
    return res.status(500).json({ success: false, message: 'Failed to remove link' });
  }
};

/**
 * Seed dummy parental control data for demonstration
 */
export const seedDefaultParentalData = async (req, res) => {
  try {
    const parentId = req.user?.id;
    if (!parentId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Check if the parent already has links
    const existingLinks = await ParentalAccount.count({ where: { parentUserId: parentId } });
    if (existingLinks > 0) {
      return res.status(400).json({ success: false, message: 'Parent already has linked children. Skipping seed.' });
    }

    // 1. Create a sample child user
    const dummyChildId = uuidv4();
    const demoEmail = `emma.smith.${Date.now()}@example.com`;
    await User.create({
      id: dummyChildId,
      email: demoEmail,
      username: `emma_smith_${Date.now()}`,
      passwordHash: 'seeded_hash_not_usable',
      firstName: 'Emma',
      lastName: 'Smith',
      role: 'child',
      age: 10,
    });

    // 2. Create the parental link (pre-approved)
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60000);
    const link = await ParentalAccount.create({
      childUserId: dummyChildId,
      parentUserId: parentId,
      relationship: 'parent',
      isActive: true, // Pre-approved
      approvedAt: thirtyMinsAgo,
      screenTimeLimit: 120,
      contentFilter: 'moderate',
      metadata: {
        alerts: [
          {
            id: uuidv4(),
            type: 'Restricted Content Alert',
            attempts: 1,
            createdAt: new Date(Date.now() - 3600000).toISOString(), 
          },
          {
            id: uuidv4(),
            type: 'Screen Time Approaching Limit',
            attempts: null,
            createdAt: new Date(Date.now() - 7200000).toISOString(),
          }
        ]
      }
    });

    // 3. Seed ChildrenProgress (Points & Hearts)
    await ChildrenProgress.create({
      userId: dummyChildId,
      hearts: 4,
      points: 120,
      totalPoints: 1550,
      currentLevel: 3,
      currentStreak: 5,
    });

    // 4. Seed UserStoryProgress (Completed stories)
    // We don't necessarily have actual stories created, so we'll mock the rows 
    // Wait, UserStoryProgress requires a valid storyId if there's a foreign key. 
    // To be safe and avoid FK constraints if they exist, we just add the stats to the Progress.
    // However, if we need actual completed stories for the dashboard, let's check if Story model has a hard FK constraint. 
    // Assuming we can just inject a few mock stories into the DB:
    const mockStoryIds = [uuidv4(), uuidv4()];
    try {
      await Story.bulkCreate([
        { id: mockStoryIds[0], title: 'The Brave Little Fox', category: 'couragous', content: '...', ageGroup: '6-8', readingTime: 5, status: 'published', authorId: parentId },
        { id: mockStoryIds[1], title: 'Mystery of the Whispering Woods', category: 'mystery', content: '...', ageGroup: '9-12', readingTime: 8, status: 'published', authorId: parentId }
      ], { ignoreDuplicates: true });
      
      await UserStoryProgress.bulkCreate([
        { userId: dummyChildId, storyId: mockStoryIds[0], status: 'completed', pointsEarned: 50, completedAt: new Date(Date.now() - 86400000) },
        { userId: dummyChildId, storyId: mockStoryIds[1], status: 'completed', pointsEarned: 75, completedAt: new Date(Date.now() - 43200000) }
      ], { ignoreDuplicates: true });
    } catch(err) {
      logger.warn('Could not seed UserStoryProgress due to constraint, skipping story relations', { err: err.message });
    }

    // 5. Seed ChildrenChallengeProgress
    try {
      const challengeMockId = uuidv4();
      await ChildrenChallengeProgress.create({
        id: uuidv4(),
        userId: dummyChildId,
        challengeId: challengeMockId, 
        completed: false,
        attempts: 3,
        score: 0,
      });
      const challengeMockId2 = uuidv4();
      await ChildrenChallengeProgress.create({
        id: uuidv4(),
        userId: dummyChildId,
        challengeId: challengeMockId2, 
        completed: true,
        attempts: 1,
        score: 100,
      });
    } catch(err) {
      logger.warn('Could not seed ChildrenChallengeProgress', { err: err.message });
    }

    return res.status(201).json({ 
      success: true, 
      message: 'Default dummy child data seeded', 
      data: { childId: dummyChildId }
    });
  } catch (error) {
    logger.error('Error seeding parental data', { error: error.message });
    return res.status(500).json({ success: false, message: 'Failed to seed dummy data' });
  }
};

export default {
  createParentalLink,
  approveParentalLink,
  getMyParents,
  getMyChildren,
  updateParentalSettings,
  getChildActivity,
  updateBlockList,
  removeParentalLink,
  seedDefaultParentalData,
};
