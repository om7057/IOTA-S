import { Psychiatrist, PsychiatristChat, User } from '../models/index.js';
import { logger } from '../utils/logger.js';

/**
 * Get all available psychiatrists
 */
export const getPsychiatrists = async (req, res) => {
  try {
    const psychiatrists = await Psychiatrist.findAll({
      where: { isAvailable: true },
      attributes: ['id', 'firstName', 'lastName', 'specialization', 'bio', 'avatarUrl', 'rating'],
      order: [['rating', 'DESC']],
    });

    return res.json({
      success: true,
      data: psychiatrists,
    });
  } catch (error) {
    logger.error('Error fetching psychiatrists:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get psychiatrist by ID
 */
export const getPsychiatristById = async (req, res) => {
  try {
    const { psychiatristId } = req.params;

    const psychiatrist = await Psychiatrist.findByPk(psychiatristId, {
      attributes: ['id', 'firstName', 'lastName', 'specialization', 'bio', 'avatarUrl', 'rating', 'isAvailable'],
    });

    if (!psychiatrist) {
      return res.status(404).json({
        success: false,
        error: 'Psychiatrist not found',
      });
    }

    return res.json({
      success: true,
      data: psychiatrist,
    });
  } catch (error) {
    logger.error('Error fetching psychiatrist:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Create psychiatrist (admin only)
 */
export const createPsychiatrist = async (req, res) => {
  try {
    const { firstName, lastName, specialization, bio, avatarUrl } = req.body;

    const psychiatrist = await Psychiatrist.create({
      firstName,
      lastName,
      specialization,
      bio,
      avatarUrl,
      isAvailable: true,
      rating: 4.5,
    });

    return res.status(201).json({
      success: true,
      data: psychiatrist,
    });
  } catch (error) {
    logger.error('Error creating psychiatrist:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export default {
  getPsychiatrists,
  getPsychiatristById,
  createPsychiatrist,
};