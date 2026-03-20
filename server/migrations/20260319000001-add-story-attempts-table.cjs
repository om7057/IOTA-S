'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // This migration is a no-op.
    // The story_attempts table is created via init-db.sql
    // which is loaded automatically when the database is initialized.
    console.log('✅ story_attempts table already exists from base schema');
  },

  async down(queryInterface) {
    // No rollback needed - schema is managed by init-db.sql
    console.log('⏭️  Skipping rollback - schema managed by init-db.sql');
  },
};
