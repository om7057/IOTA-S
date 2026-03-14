import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

export const MoodLog = sequelize.define('MoodLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    index: true
  },
  mood: {
    type: DataTypes.ENUM('happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'confused', 'content')
  },
  moodIntensity: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 10 }
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  notes: DataTypes.TEXT,
  date: {
    type: DataTypes.DATE,
    defaultValue: () => new Date()
  }
}, {
  timestamps: true,
  tableName: 'mood_logs',
  indexes: [
    { fields: ['userId', 'date'], name: 'idx_moodlog_user_date' },
    { fields: ['userId', 'createdAt'], name: 'idx_moodlog_user_created' }
  ]
});

export default MoodLog;
