import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

export const QuizProgress = sequelize.define('QuizProgress', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quizId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  questionId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  answered: DataTypes.BOOLEAN,
  selectedAnswer: DataTypes.STRING,
  isCorrect: DataTypes.BOOLEAN,
  points: DataTypes.INTEGER
}, {
  timestamps: true,
  tableName: 'quiz_progress'
});

export default QuizProgress;
