import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

/**
 * User Model - Unified Schema
 * Consolidates mobile and web user tables
 *
 * Fields:
 * - id: UUID primary key
 * - email: unique email
 * - passwordHash: bcryptjs hash (null for OAuth-only users)
 * - firstName/lastName: user name
 * - age: 5-19 for kids/teens
 * - gender: male/female/other/prefer-not
 * - userType: derived from age (child <13, teenager >=13)
 * - oauthProvider: 'google', 'local', or null
 * - googleId: Google OAuth ID (unique if present)
 * - avatarUrl: profile picture
 * - currentStars: achievement points
 * - isVerified: teen verification status
 * - verifiedAt: when verified
 * - timestamps: auto createdAt/updatedAt
 * - deletedAt: soft delete timestamp
 */

export const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // Email & Authentication
    email: {
      type: DataTypes.STRING,
      unique: {
        msg: 'Email already in use',
      },
      allowNull: false,
      lowercase: true,
      validate: {
        isEmail: {
          msg: 'Invalid email address',
        },
      },
    },

    passwordHash: {
      type: DataTypes.STRING,
      allowNull: true, // Null for OAuth-only users
      comment: 'bcryptjs hashed password (null for OAuth users)',
    },

    // User Identity
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [1, 50],
          msg: 'First name must be 1-50 characters',
        },
      },
    },

    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [1, 50],
          msg: 'Last name must be 1-50 characters',
        },
      },
    },

    displayName: {
      type: DataTypes.VIRTUAL,
      get() {
        const first = this.firstName || '';
        const last = this.lastName || '';
        return `${first} ${last}`.trim();
      },
    },

    // Demographics
    age: {
      type: DataTypes.INTEGER,
      validate: {
        min: {
          args: [5],
          msg: 'User must be at least 5 years old',
        },
        max: {
          args: [19],
          msg: 'User must be 19 or younger',
        },
      },
    },

    gender: {
      type: DataTypes.ENUM('male', 'female', 'other', 'prefer-not'),
      defaultValue: 'prefer-not',
    },

    userType: {
      type: DataTypes.ENUM('child', 'teenager', 'counselor', 'parent'),
      get() {
        // Auto-derive from age if using child/teenager
        if (this.age) {
          return this.age < 13 ? 'child' : 'teenager';
        }
        return this.getDataValue('userType') || 'teenager';
      },
    },

    // OAuth
    oauthProvider: {
      type: DataTypes.ENUM('google', 'local'),
      allowNull: true,
    },

    googleId: {
      type: DataTypes.STRING,
      unique: {
        msg: 'Google ID already linked to another account',
      },
      allowNull: true,
    },

    // Profile
    avatarUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    currentStars: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },

    // Verification
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Teen verification status (counselor-approved)',
    },

    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When user was verified by counselor',
    },

    // Soft Delete
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    paranoid: true, // Enable soft deletes
    underscored: false, // Use camelCase
    indexes: [
      { fields: ['email'] },
      { fields: ['googleId'] },
      { fields: ['createdAt'] },
    ],
  }
);

export default User;
