import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

export const TeenGroupMessage = sequelize.define('TeenGroupMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  groupId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readBy: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  }
}, {
  timestamps: true,
  tableName: 'teen_group_messages'
});

export default TeenGroupMessage;
