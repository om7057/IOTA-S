import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

export const TeenVerification = sequelize.define('TeenVerification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('verified-counselor', 'verified-mentor', 'trusted-peer'),
    allowNull: false
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verificationExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  verifiedBy: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'teen_verifications'
});

export default TeenVerification;
