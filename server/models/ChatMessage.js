import { DataTypes } from 'sequelize';
import { sequelize } from './index.js';

const ChatMessage = sequelize.define('ChatMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  sender: {
    type: DataTypes.ENUM('user', 'bot'),
    defaultValue: 'user',
    allowNull: false,
  },
  // Bot response (if sender is 'bot')
  botResponse: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Sentiment/mood detected from user message
  sentiment: {
    type: DataTypes.ENUM('positive', 'neutral', 'negative'),
    defaultValue: 'neutral',
  },
  // Tags for categorizing bot conversations
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  // Track helpful feedback
  isHelpful: {
    type: DataTypes.BOOLEAN,
    defaultValue: null,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default ChatMessage;
