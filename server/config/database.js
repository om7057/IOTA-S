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
    logging: environment.isDevelopment() ? console.log : false,
    define: {
      timestamps: true,
      underscored: false, // Use camelCase (not snake_case)
      paranoid: true, // Enable soft deletes
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
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};

export default dbConfig[environment.NODE_ENV];
