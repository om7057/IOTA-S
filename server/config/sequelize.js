import { Sequelize } from 'sequelize';
import environment from './environment.js';

const dbConfig = {
  development: {
    username: environment.DB.user,
    password: environment.DB.password,
    database: environment.DB.name,
    host: environment.DB.host,
    port: environment.DB.port,
    dialect: 'postgres',
    pool: environment.DB.pool,
    logging: false, // Disable verbose SQL query logging
    define: {
      timestamps: true,
      underscored: false,
      paranoid: true,
    },
  },
  test: {
    username: 'postgres',
    password: '',
    database: 'iota_db_test',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: false,
    define: {
      timestamps: true,
      underscored: false,
      paranoid: true,
    },
  },
  production: {
    username: environment.DB.user,
    password: environment.DB.password,
    database: environment.DB.name,
    host: environment.DB.host,
    port: environment.DB.port,
    dialect: 'postgres',
    pool: environment.DB.pool,
    logging: false,
    define: {
      timestamps: true,
      underscored: false,
      paranoid: true,
    },
  },
};

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

// Create and export sequelize instance
export const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    pool: config.pool,
    logging: config.logging,
    define: config.define,
  }
);

export default sequelize;
