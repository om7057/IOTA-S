'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  async up(queryInterface) {
    try {
      const existingTables = await queryInterface.showAllTables();
      console.log(`📊 Found ${existingTables.length} existing tables: ${existingTables.join(', ')}`);
      
      // Check for actual application tables, not just sequelize_meta
      const hasApplicationTables = existingTables.some(table => 
        table !== 'sequelize_meta' && table !== 'SequelizeMeta'
      );
      
      if(hasApplicationTables) {
        console.log('✅ Application tables already exist, skipping schema initialization');
        return;
      }

      console.log('📋 Loading database schema from init-db.sql...');
      const schemaPath = path.resolve(__dirname, '..', '..', 'init-db.sql');
      console.log(`📁 Schema path: ${schemaPath}`);
      
      if (!fs.existsSync(schemaPath)) {
        throw new Error(`Schema file not found: ${schemaPath}`);
      }
      
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      console.log(`📖 Loaded ${schemaSql.length} bytes from schema file`);
      
      await queryInterface.sequelize.query(schemaSql);
      console.log('✅ Database schema initialized successfully');
    } catch (error) {
      console.error('❌ Schema initialization failed:', error.message);
      throw error;
    }
  },

  async down(queryInterface) {
    console.log('🧹 Dropping public schema...');
    await queryInterface.sequelize.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
    console.log('✅ Schema dropped');
  },
};
