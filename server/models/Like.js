import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

/**
 * Like Model
 * Represents likes on discussions and replies
 */
export const Like = sequelize.define(
  'Like',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    targetType: {
      type: DataTypes.ENUM('discussion', 'reply', 'post'),
      allowNull: false,
      comment: 'Type of content being liked',
    },
    targetId: {
      type: DataTypes.UUID,
      allowNull: false,
      index: true,
      comment: 'ID of the content (discussion/reply/post)',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'likes',
    timestamps: false,
    indexes: [
      { fields: ['userId', 'targetType', 'targetId'], unique: true },
      { fields: ['targetType', 'targetId'] },
    ],
  }
);

export default Like;
