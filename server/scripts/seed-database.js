/**
 * Database Seeding Script
 * Usage: npm run seed
 * Populates the database with initial data for development
 */

import { config } from 'dotenv';
import { seedStories } from '../seeds/stories.js';
import { seedQuizzes } from '../seeds/quizzes.js';
import { seedGroups } from '../seeds/groups.js';
import { seedChildrenCourses } from '../seeds/children-courses.js';
import { seedNewsStories } from '../seeds/news-stories.js';
import { sequelize } from '../config/sequelize.js';

config();

const main = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Verify database connection
    await sequelize.authenticate();
    console.log('✅ Database connection verified');

    // Run seed functions
    console.log('\n📚 Seeding stories...');
    await seedStories();
    
    console.log('\n📝 Seeding quizzes...');
    await seedQuizzes();
    
    console.log('\n👥 Seeding groups...');
    await seedGroups();
    
    console.log('\n🧬 Seeding children learning courses...');
    await seedChildrenCourses();
    
    console.log('\n📰 Seeding news stories...');
    await seedNewsStories();
    
    console.log('\n✅ Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

main();
