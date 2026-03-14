import { DataTypes } from 'sequelize';
import { sequelize } from './index.js';

/**
 * DiscussionReply Model
 * Represents replies/comments on discussion threads
 */
export const DiscussionReply = sequelize.define(
  'DiscussionReply',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    discussionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Discussions',
        key: 'id',
      },
      onDelete: 'CASCADE',
      index: true,
    },
    creatorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'SET NULL',
      index: true,
    },
    parentReplyId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'DiscussionReplies',
        key: 'id',
      },
      onDelete: 'CASCADE',
      comment: 'For nested/threaded replies',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [1, 5000],
          msg: 'Reply must not exceed 5000 characters',
        },
      },
    },
    likeCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    tableName: 'DiscussionReplies',
    timestamps: true,
    indexes: [
      { fields: ['discussionId', 'createdAt'] },
      { fields: ['creatorId'] },
      { fields: ['parentReplyId'] },
    ],
  }
);

export default DiscussionReply;
