import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';
import { User } from './User.js';

/**
 * RefreshToken Model
 * Stores refresh tokens for token rotation & revocation
 *
 * Token Family Pattern (for rotation security):
 * - Client uses refreshToken to get new accessToken + refreshToken pair
 * - All tokens from same login session share tokenFamily ID
 * - If old refreshToken is reused (compromised), we can detect it
 *   because it has a different tokenFamily than current token
 *
 * Example flow:
 * 1. Login: tokenFamily=uuid1, refreshToken=jwt1
 * 2. Refresh with jwt1: generates new pair with tokenFamily=uuid1
 * 3. If attacker uses old jwt1 again: detected as different family
 */

export const RefreshToken = sequelize.define(
  'RefreshToken',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // User Reference
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    // Token Family (for rotation security)
    tokenFamily: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'Groups all tokens from same login session',
      index: true,
    },

    // Expiration
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'When this refresh token expires',
      index: true,
    },

    // Revocation (when user logs out or family is invalidated)
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When this token was revoked (logout or compromised)',
    },

    // IP & User Agent (optional, for extra security)
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'IP address that issued this token',
    },

    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'User-Agent header (browser/platform info)',
    },
  },
  {
    sequelize,
    modelName: 'RefreshToken',
    tableName: 'refresh_tokens',
    timestamps: true,
    underscored: false,
    indexes: [
      { fields: ['userId'] },
      { fields: ['tokenFamily'] },
      { fields: ['expiresAt'] },
      { fields: ['revokedAt'] },
    ],
  }
);

export default RefreshToken;
