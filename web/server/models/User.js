import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

export const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  oauthProvider: {
    type: DataTypes.ENUM('google', 'local'),
    allowNull: false
  },
  username: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isEmail: true }
  },
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  imageUrl: DataTypes.STRING,
  passwordHash: DataTypes.STRING,
  age: {
    type: DataTypes.INTEGER,
    validate: { min: 5, max: 19 }
  },
  userType: {
    type: DataTypes.ENUM('child', 'teenager'),
    defaultValue: 'child'
  },
  currentStars: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true,
  tableName: 'users'
});

export default User;
