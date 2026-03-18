'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  async up(queryInterface) {
    const existingTables = await queryInterface.showAllTables();
    if (existingTables.length > 0) {
      return;
    }

    const schemaPath = path.resolve(__dirname, '..', '..', 'init-db.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    await queryInterface.sequelize.query(schemaSql);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
  },
};
