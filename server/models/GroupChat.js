import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

/**
 * GroupChat Model
 * Represents real-time group messaging
 */
export const GroupChat = sequelize.define(
  'GroupChat',
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
    senderId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
      index: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [1, 2000],
          msg: 'Message must not exceed 2000 characters',
        },
      },
    },
    type: {
      type: DataTypes.ENUM('text', 'image', 'video', 'file', 'emoji', 'system'),
      allowNull: false,
      defaultValue: 'text',
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'For media/file metadata',
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    editedAt: {
      type: DataTypes.DATE,
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
    tableName: 'group_chats',
    timestamps: true,
    indexes: [
      { fields: ['groupId', 'createdAt'] },
      { fields: ['senderId'] },
    ],
  }
);

export default GroupChat;
