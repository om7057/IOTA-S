import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

/**
 * Group Model
 * Represents user groups/communities
 */
export const Group = sequelize.define(
  'Group',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: {
          args: [3, 100],
          msg: 'Group name must be between 3 and 100 characters',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    creatorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      index: true,
    },
    type: {
      type: DataTypes.ENUM('public', 'private', 'interest-based'),
      allowNull: false,
      defaultValue: 'public',
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'e.g., mental-health, academics, hobbies, support',
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Emoji or icon identifier',
    },
    memberCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    lastActivityAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'groups',
    timestamps: true,
    indexes: [
      { fields: ['creatorId'] },
      { fields: ['type'] },
      { fields: ['category'] },
      { fields: ['isActive'] },
    ],
  }
);

export default Group;
