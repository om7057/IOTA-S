import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

/**
 * Psychiatrist Model
 * Represents available psychiatrists/psychologists for teen support
 */
export const Psychiatrist = sequelize.define(
  'Psychiatrist',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    
    displayName: {
      type: DataTypes.VIRTUAL,
      get() {
        return `Dr. ${this.firstName} ${this.lastName}`;
      },
    },
    
    specialization: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'e.g., Anxiety, Depression, Trauma, General Counseling',
    },
    
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Professional biography',
    },
    
    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Profile picture URL',
    },
    
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Contact email',
    },
    
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether available for new conversations',
    },
    
    responseTimeAvg: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Average response time in minutes',
    },
    
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      comment: 'Average rating from users (0-5)',
    },
    
    totalConsultations: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Total number of consultations',
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
    tableName: 'psychiatrists',
    timestamps: true,
  }
);

export default Psychiatrist;
