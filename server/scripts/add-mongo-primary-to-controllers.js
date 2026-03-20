#!/usr/bin/env node
/**
 * Automated codemod: Add Mongo-primary support to controllers
 * This script injects isMongoPrimaryEnabled() checks and fallback patterns
 * into controllers that don't yet have Mongo support.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const controllersDir = path.join(__dirname, '../controllers');

// Controllers that already have Mongo support (skip)
const MIGRATED = new Set([
  'auth.js',
  'users.js',
  'progress.js',
  'quiz.js',
  'leaderboard.js',
  'children-courses.js',
  'topics.js',
  'stories.js',
]);

// Default fallback pattern that works for most read endpoints
const MONGO_IMPORT = `import { getMongoDb, isMongoPrimaryEnabled } from '../config/mongo.js';\nimport { v4 as uuidv4 } from 'uuid';`;

/**
 * Test if a file already has Mongo imports
 */
function hasMongoImports(content) {
  return content.includes('isMongoPrimaryEnabled') || content.includes('getMongoDb');
}

/**
 * Get all controllers needing migration
 */
function getControllersToPatch() {
  return fs
    .readdirSync(controllersDir)
    .filter((file) => file.endsWith('.js') && !MIGRATED.has(file) && file !== 'index.js')
    .map((file) => path.join(controllersDir, file));
}

/**
 * Add Mongo imports if missing
 */
function ensureMongoImports(content) {
  if (hasMongoImports(content)) {
    return content;
  }

  // Find the position after existing imports
  const lines = content.split('\n');
  let lastImportIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ') || lines[i].trim().startsWith('export ')) {
      if (lines[i].trim().startsWith('import ')) {
        lastImportIndex = i;
      } else {
        break;
      }
    }
  }

  if (lastImportIndex === -1) {
    // No imports found, add at top
    return MONGO_IMPORT + '\n\n' + content;
  }

  // Insert after last import
  lines.splice(lastImportIndex + 1, 0, MONGO_IMPORT);
  return lines.join('\n');
}

/**
 * Add fallback pattern to a simple function
 * This is a basic pattern that injects Mongo check at start of try block
 */
function addMongoFallbackToFunction(content, functionName) {
  // Find function declaration
  const functionPattern = new RegExp(
    `(export\\s+const\\s+${functionName}\\s*=\\s*async\\s*\\(.*?\\)\\s*=>\\s*\\{\\s*try\\s*\\{)`,
    's'
  );

  const match = content.match(functionPattern);
  if (!match) {
    return content;
  }

  // Determine collection name from function context
  // For now, add a generic fallback pattern
  const mongoCheck = `
    // Mongo-primary mode: fallback to Sequelize if not enabled
    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      // TODO: Implement Mongo-primary path for ${functionName}
      // For now, continue with Sequelize fallback
    }
  `;

  return content.replace(functionPattern, `$1${mongoCheck}`);
}

/**
 * Add minimal Mongo support to a controller
 */
function addMinimalMongoSupport(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Already has support
  if (hasMongoImports(content)) {
    console.log(`✓ ${path.basename(filePath)} already has Mongo support`);
    return false;
  }

  // Add imports
  content = ensureMongoImports(content);

  // Write back
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✔ ${path.basename(filePath)} - added Mongo imports`);
  return true;
}

/**
 * Main runner
 */
async function main() {
  console.log('🔄 Adding Mongo-primary support to controllers...\n');

  const controllers = getControllersToPatch();
  console.log(`Found ${controllers.length} controllers to update:\n`);

  let updated = 0;
  for (const controller of controllers) {
    if (addMinimalMongoSupport(controller)) {
      updated++;
    }
  }

  console.log(`\n✅ Updated ${updated} controllers with Mongo-primary imports`);
  console.log('\n📝 Next steps:');
  console.log('   1. Review each controller endpoint and add Mongo collection queries');
  console.log('   2. Use pattern: if (isMongoPrimaryEnabled()) { /* Mongo path */ } else { /* Sequelize */ }');
  console.log('   3. Test endpoints with USE_MONGO_PRIMARY=true');
}

main().catch((error) => {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
});
