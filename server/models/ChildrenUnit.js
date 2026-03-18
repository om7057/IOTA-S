import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const ChildrenUnit = sequelize.define(
  'ChildrenUnit',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'children_courses',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Unit title (e.g., "Before Puberty")',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'What this unit teaches',
    },
    icon: {
      type: DataTypes.STRING(50),
      defaultValue: '📖',
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'children_units',
    timestamps: true,
    paranoid: true,
  }
);

export default ChildrenUnit;
