import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

/**
 * PsychiatristChat Model
 * Represents chat conversations between teens and psychiatrists
 */
export const PsychiatristChat = sequelize.define(
  'PsychiatristChat',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    
    conversationId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      comment: 'Unique conversation ID for grouping messages',
    },
    
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    
    psychiatristId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'psychiatrists',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Chat message content',
    },
    
    sender: {
      type: DataTypes.ENUM('teen', 'psychiatrist'),
      defaultValue: 'teen',
      allowNull: false,
    },
    
    sentiment: {
      type: DataTypes.ENUM('positive', 'neutral', 'negative'),
      defaultValue: 'neutral',
      comment: 'Sentiment of the message',
    },
    
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether message has been read by recipient',
    },
    
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'psychiatrist_chats',
    timestamps: true,
    paranoid: false, // Disable soft deletes - we don't need deletedAt column
  }
);

export default PsychiatristChat;
