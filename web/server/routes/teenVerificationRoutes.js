import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { TeenVerification, User } from '../models/index.js';

const router = express.Router();

// Get verification status for logged-in user
router.get('/verification/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const verification = await TeenVerification.findOne({
      where: { userId },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar', 'email']
        }
      ]
    });

    if (!verification) {
      return res.json({
        verified: false,
        message: 'No verification record found'
      });
    }

    res.json(verification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request verification (for counselors/mentors)
router.post('/verification/request', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { verificationType, credentials, organization } = req.body;

    if (!['counselor', 'mentor', 'peer-supporter'].includes(verificationType)) {
      return res.status(400).json({ error: 'Invalid verification type' });
    }

    // Check if already has verification request
    const existing = await TeenVerification.findOne({ where: { userId } });
    if (existing) {
      return res.status(400).json({ error: 'Verification request already exists' });
    }

    const verification = await TeenVerification.create({
      userId,
      verificationType,
      credentials: credentials ? JSON.stringify(credentials) : null,
      organization,
      isVerified: false,
      status: 'pending'
    });

    const verificationWithUser = await TeenVerification.findByPk(verification.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar', 'email']
        }
      ]
    });

    res.status(201).json(verificationWithUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all pending verification requests (ADMIN ONLY - would need role check)
router.get('/verification/pending', verifyToken, async (req, res) => {
  try {
    // In production, add role check here to ensure user is admin
    const pendingRequests = await TeenVerification.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar', 'email']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json(pendingRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve verification (ADMIN ONLY)
router.post('/verification/:verificationId/approve', verifyToken, async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { verificationBadge } = req.body;
    // In production, add role check here to ensure user is admin

    const verification = await TeenVerification.findByPk(verificationId);
    if (!verification) {
      return res.status(404).json({ error: 'Verification request not found' });
    }

    await verification.update({
      isVerified: true,
      status: 'approved',
      verificationBadge: verificationBadge || `${verification.verificationType}_verified`,
      verifiedAt: new Date()
    });

    const updated = await TeenVerification.findByPk(verificationId, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar', 'email']
        }
      ]
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject verification (ADMIN ONLY)
router.post('/verification/:verificationId/reject', verifyToken, async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { reason } = req.body;
    // In production, add role check here to ensure user is admin

    const verification = await TeenVerification.findByPk(verificationId);
    if (!verification) {
      return res.status(404).json({ error: 'Verification request not found' });
    }

    await verification.update({
      isVerified: false,
      status: 'rejected',
      rejectionReason: reason || 'Application does not meet requirements'
    });

    const updated = await TeenVerification.findByPk(verificationId, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar', 'email']
        }
      ]
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Revoke verification (ADMIN ONLY)
router.post('/verification/:verificationId/revoke', verifyToken, async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { reason } = req.body;
    // In production, add role check here to ensure user is admin

    const verification = await TeenVerification.findByPk(verificationId);
    if (!verification) {
      return res.status(404).json({ error: 'Verification record not found' });
    }

    await verification.update({
      isVerified: false,
      status: 'revoked',
      revokedAt: new Date(),
      revocationReason: reason || 'Verification revoked'
    });

    const updated = await TeenVerification.findByPk(verificationId, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar', 'email']
        }
      ]
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get verified users by type
router.get('/verification/type/:type', async (req, res) => {
  try {
    const { type } = req.params;

    const verified = await TeenVerification.findAll({
      where: {
        verificationType: type,
        isVerified: true
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar']
        }
      ],
      attributes: ['id', 'verificationType', 'verificationBadge', 'verifiedAt']
    });

    res.json(verified);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if user is verified
router.get('/verification/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const verification = await TeenVerification.findOne({
      where: {
        userId: parseInt(userId),
        isVerified: true
      },
      attributes: ['id', 'verificationType', 'verificationBadge', 'verifiedAt']
    });

    if (!verification) {
      return res.json({
        isVerified: false,
        userId: parseInt(userId)
      });
    }

    res.json({
      isVerified: true,
      ...verification.dataValues,
      userId: parseInt(userId)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get verification statistics (ADMIN ONLY)
router.get('/verification/stats', verifyToken, async (req, res) => {
  try {
    // In production, add role check here to ensure user is admin

    const stats = {
      total: await TeenVerification.count(),
      verified: await TeenVerification.count({ where: { isVerified: true } }),
      pending: await TeenVerification.count({ where: { status: 'pending' } }),
      rejected: await TeenVerification.count({ where: { status: 'rejected' } }),
      byType: await TeenVerification.findAll({
        attributes: [
          'verificationType',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['verificationType'],
        raw: true
      })
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
