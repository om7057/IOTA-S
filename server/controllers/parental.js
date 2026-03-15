import { ParentalAccount, User } from '../models/index.js';
import { logger } from '../utils/logger.js';

/**
 * Create parental link - parent adds child
 */
export const createParentalLink = async (req, res) => {
  try {
    const { parentUserId, childUserId, relationship = 'parent' } = req.body;

    // Verify both users exist
    const parent = await User.findByPk(parentUserId);
    const child = await User.findByPk(childUserId);

    if (!parent || !child) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Create parental account
    const [account, created] = await ParentalAccount.findOrCreate({
      where: { childUserId, parentUserId },
      defaults: {
        relationship,
        isActive: false, // Needs child approval
      },
    });

    if (!created) {
      return res.status(400).json({ success: false, message: 'Parental link already exists' });
    }

    res.status(201).json({
      success: true,
      message: 'Parental link created (pending child approval)',
      data: account,
    });
  } catch (error) {
    logger.error('Error creating parental link', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to create parental link' });
  }
};

/**
 * Child approves parental link
 */
export const approveParentalLink = async (req, res) => {
  try {
    const { parentalAccountId, childUserId } = req.body;

    const account = await ParentalAccount.findByPk(parentalAccountId);
    if (!account || account.childUserId !== childUserId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await account.update({
      isActive: true,
      approvedAt: new Date(),
    });

    res.json({
      success: true,
      message: 'Parental link approved',
      data: account,
    });
  } catch (error) {
    logger.error('Error approving parental link', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to approve link' });
  }
};

/**
 * Get child's parental accounts (from child's perspective)
 */
export const getMyParents = async (req, res) => {
  try {
    const { userId } = req.params;

    const parentLinkis = await ParentalAccount.findAll({
      where: { childUserId: userId },
      include: [
        { model: User, as: 'parent', attributes: ['id', 'name', 'email', 'avatar'] },
      ],
    });

    res.json({
      success: true,
      data: parentLinks,
    });
  } catch (error) {
    logger.error('Error fetching parental accounts', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to fetch parental accounts' });
  }
};

/**
 * Get parent's children (from parent's perspective)
 */
export const getMyChildren = async (req, res) => {
  try {
    const { userId } = req.params;

    const childLinks = await ParentalAccount.findAll({
      where: { parentUserId: userId, isActive: true },
      include: [
        { model: User, as: 'child', attributes: ['id', 'name', 'avatar', 'age', 'createdAt'] },
      ],
    });

    res.json({
      success: true,
      data: childLinks,
    });
  } catch (error) {
    logger.error('Error fetching children', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to fetch children' });
  }
};

/**
 * Update parental permissions/settings
 */
export const updateParentalSettings = async (req, res) => {
  try {
    const { parentalAccountId, permissions, screenTimeLimit, contentFilter, allowNotifications } = req.body;

    const account = await ParentalAccount.findByPk(parentalAccountId);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Parental account not found' });
    }

    const updates = {};
    if (permissions) updates.permissions = { ...account.permissions, ...permissions };
    if (screenTimeLimit) updates.screenTimeLimit = screenTimeLimit;
    if (contentFilter) updates.contentFilter = contentFilter;
    if (allowNotifications !== undefined) updates.allowNotifications = allowNotifications;

    const updated = await account.update(updates);

    res.json({
      success: true,
      message: 'Parental settings updated',
      data: updated,
    });
  } catch (error) {
    logger.error('Error updating parental settings', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};

/**
 * Get child's activity summary (parent view)
 */
export const getChildActivity = async (req, res) => {
  try {
    const { childUserId } = req.params;
    const { parentUserId } = req.query;

    // Verify parent has access
    const account = await ParentalAccount.findOne({
      where: { childUserId, parentUserId, isActive: true },
    });

    if (!account) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get child's activity (you'd fetch from respective controllers)
    const child = await User.findByPk(childUserId, {
      include: [
        { model: Mood, as: 'moods', limit: 10, order: [['createdAt', 'DESC']] },
        { model: Journal, as: 'journals', limit: 10, order: [['createdAt', 'DESC']] },
      ],
    });

    res.json({
      success: true,
      data: {
        child: {
          id: child.id,
          name: child.name,
          joinedAt: child.createdAt,
        },
        activity: {
          recentMoods: child.moods,
          recentJournals: child.journals,
          lastActivityAt: child.updatedAt,
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching child activity', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to fetch activity' });
  }
};

/**
 * Block/unblock content or user for child
 */
export const updateBlockList = async (req, res) => {
  try {
    const { parentalAccountId, blockedUserId, action = 'add' } = req.body;

    const account = await ParentalAccount.findByPk(parentalAccountId);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Parental account not found' });
    }

    let blockedUsers = account.blockedUsers || [];
    if (action === 'add' && !blockedUsers.includes(blockedUserId)) {
      blockedUsers.push(blockedUserId);
    } else if (action === 'remove') {
      blockedUsers = blockedUsers.filter(id => id !== blockedUserId);
    }

    await account.update({ blockedUsers });

    res.json({
      success: true,
      message: `User ${action === 'add' ? 'blocked' : 'unblocked'}`,
      data: account,
    });
  } catch (error) {
    logger.error('Error updating block list', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to update block list' });
  }
};

/**
 * Remove parental link
 */
export const removeParentalLink = async (req, res) => {
  try {
    const { parentalAccountId } = req.params;

    await ParentalAccount.destroy({
      where: { id: parentalAccountId },
    });

    res.json({
      success: true,
      message: 'Parental link removed',
    });
  } catch (error) {
    logger.error('Error removing parental link', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to remove link' });
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
};
