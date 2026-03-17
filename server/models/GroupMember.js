import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

/**
 * GroupMember Model
 * Represents membership in groups
 */
export const GroupMember = sequelize.define(
  'GroupMember',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    groupId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'groups',
        key: 'id',
      },
      onDelete: 'CASCADE',
      index: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      index: true,
    },
    role: {
      type: DataTypes.ENUM('owner', 'moderator', 'member'),
      allowNull: false,
      defaultValue: 'member',
    },
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    lastReadAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last time user read messages in group',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'group_members',
    timestamps: true,
    indexes: [
      { fields: ['groupId', 'userId'], unique: true },
      { fields: ['groupId', 'role'] },
    ],
  }
);

export default GroupMember;
