import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

export const Lesson = sequelize.define('Lesson', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  unitId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true,
  tableName: 'lessons'
});

export default Lesson;
