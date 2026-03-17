import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

export const ParentalAccount = sequelize.define('ParentalAccount', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  childUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
  },
  parentUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
  },
  relationship: {
    type: DataTypes.ENUM('parent', 'guardian', 'teacher'),
    defaultValue: 'parent',
  },
  permissions: {
    type: DataTypes.JSONB,
    defaultValue: {
      canViewActivity: true,
      canViewMood: true,
      canViewJournal: true,
      canViewProgress: true,
      canSetScreenTime: true,
      canBlockContent: true,
      canManageContacts: false,
    },
    comment: 'Granular permissions for parental controls',
  },
  screenTimeLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 120, // minutes per day
    comment: 'Daily screen time limit in minutes',
  },
  contentFilter: {
    type: DataTypes.ENUM('unrestricted', 'moderate', 'strict'),
    defaultValue: 'moderate',
  },
  blockedUsers: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of blocked user IDs',
  },
  allowNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When child approved parental oversight',
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW,
  },
}, {
  tableName: 'parental_accounts',
  timestamps: true,
  indexes: [
    { fields: ['childUserId'] },
    { fields: ['parentUserId'] },
    { fields: ['childUserId', 'parentUserId'], unique: true },
    { fields: ['isActive'] },
  ],
});

export default ParentalAccount;
