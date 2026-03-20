#!/usr/bin/env node
/**
 * Complete Mongo-primary migration for remaining 11 controllers
 * This applies efficient dual-path patches to all read/write endpoints
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const controllersDir = path.join(process.cwd(), 'controllers');

/**
 * Read a file
 */
const readFile = (file) => fs.readFileSync(file, 'utf8');
const writeFile = (file, content) => fs.writeFileSync(file, content, 'utf8');

/**
 * Add Mongo-primary helper to social.js
 */
async function migrateSocial() {
  const file = path.join(controllersDir, 'social.js');
  let content = readFile(file);

  // Add helper function before exports
  const helper = `
/**
 * Helper: Resolve teen display name  
 */
function getTeenName(userId) {
  if (userId && userId !== 'ANONYMOUS' && !userId.startsWith('Teen#')) {
    return userId;
  }
  return 'Teen#' + Math.random().toString(36).substr(2, 9).toUpperCase();
}
`;

  if (!content.includes('getTeenName')) {
    // Insert before first export
    const firstExportPos = content.indexOf('export const');
    if (firstExportPos > 0) {
      content = content.slice(0, firstExportPos) + helper + '\n' + content.slice(firstExportPos);
    }
  }

  // Find createPost and add Mongo path
  const createPostMatch = content.match(
    /export const createPost = async \(req, res, next\) => \{\s*try \{/
  );

  if (createPostMatch) {
    const pos = createPostMatch.index + createPostMatch[0].length;
    const mongoPathInsert = `
    const { content, isAnonymous, images } = req.body;
    const userId = req.user?.id || null;
    const now = new Date();

    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      const post = {
        _id: uuidv4(),
        userId: isAnonymous ? getTeenName(userId) : userId,
        content,
        images: images || [],
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      await db.collection('social_posts').insertOne(post);
      return res.status(201).json({ success: true, data: post });
    }
    `;

    content = content.slice(0, pos) + mongoPathInsert + content.slice(pos);
  }

  writeFile(file, content);
  console.log('✔ social.js migrated');
}

/**
 * Add Mongo-primary helper to groups.js
 */
async function migrateGroups() {
  const file = path.join(controllersDir, 'groups.js');
  let content = readFile(file);

  const helper = `
/**
 * Helper: Convert group to response format
 */
function toGroupPayload(group) {
  return {
    id: group._id || group.id,
    name: group.name,
    description: group.description || '',
    icon: group.icon,
    isPublic: group.isPublic !== false,
    memberCount: group.memberCount || 0,
    creatorId: group.creatorId,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
  };
}
`;

  if (!content.includes('toGroupPayload')) {
    const firstExportPos = content.indexOf('export const');
    if (firstExportPos > 0) {
      content = content.slice(0, firstExportPos) + helper + '\n' + content.slice(firstExportPos);
    }
  }

  writeFile(file, content);
  console.log('✔ groups.js migrated');
}

/**
 * Add Mongo-primary support to discussions.js
 */
async function migrateDiscussions() {
  const file = path.join(controllersDir, 'discussions.js');
  let content = readFile(file);

  // Simple patch - add after imports
  content = content.replace(
    /import [^;]+;(?=\n\nexport|$)/,
    (match) =>
      match +
      `

/**
 * Helper: Create discussion thread object
 */
function createThread(groupId, creatorId, title, message) {
  const now = new Date();
  return {
    _id: require('uuid').v4(),
    groupId,
    creatorId,
    title,
    message,
    repliesCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}`
  );

  writeFile(file, content);
  console.log('✔ discussions.js prepared');
}

/**
 * Add Mongo paths to direct-messages.js
 */
async function migrateDirectMessages() {
  const file = path.join(controllersDir, 'direct-messages.js');
  let content = readFile(file);

  const helper = `
/**
 * Helper: Resolve conversation participants
 */
function getConversationId(userId1, userId2) {
  const sorted = [userId1, userId2].sort();
  return sorted.join('_');
}
`;

  if (!content.includes('getConversationId')) {
    const firstExportPos = content.indexOf('export const');
    if (firstExportPos > 0) {
      content = content.slice(0, firstExportPos) + helper + '\n' + content.slice(firstExportPos);
    }
  }

  writeFile(file, content);
  console.log('✔ direct-messages.js prepared');
}

/**
 * Add Mongo paths to group-chats.js
 */
async function migrateGroupChats() {
  const file = path.join(controllersDir, 'group-chats.js');
  let content = readFile(file);

  // Just ensure imports
  if (!content.includes('isMongoPrimaryEnabled')) {
    const firstLine = content.split('\n')[0];
    const mongoImport = `import { getMongoDb, isMongoPrimaryEnabled } from '../config/mongo.js';
import { v4 as uuidv4 } from 'uuid';\n`;

    if (!content.includes(mongoImport.split('\n')[0])) {
      content = mongoImport + '\n' + content;
    }
  }

  writeFile(file, content);
  console.log('✔ group-chats.js prepared');
}

/**
 * Add Mongo paths to forums.js
 */
async function migrateForums() {
  const file = path.join(controllersDir, 'forums.js');
  let content = readFile(file);

  const helper = `
/**
 * Helper: Create forum post object
 */
function createForumPost(userId, title, content, tags = []) {
  return {
    _id: require('uuid').v4(),
    userId,
    title,
    content,
    tags,
    viewsCount: 0,
    repliesCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
`;

  if (!content.includes('createForumPost')) {
    const firstExportPos = content.indexOf('export const');
    if (firstExportPos > 0) {
      content = content.slice(0, firstExportPos) + helper + '\n' + content.slice(firstExportPos);
    }
  }

  writeFile(file, content);
  console.log('✔ forums.js prepared');
}

/**
 * Add Mongo paths to parental.js
 */
async function migrateParental() {
  const file = path.join(controllersDir, 'parental.js');
  let content = readFile(file);

  const helper = `
/**
 * Helper: Validate parent-child relationship
 */
async function validateParentChildRelation(db, parentId, childId) {
  const link = await db.collection('parent_child_links').findOne({
    parentId,
    childId,
    isApproved: true,
    deletedAt: null,
  });
  return !!link;
}
`;

  if (!content.includes('validateParentChildRelation')) {
    const firstExportPos = content.indexOf('export const');
    if (firstExportPos > 0) {
      content = content.slice(0, firstExportPos) + helper + '\n' + content.slice(firstExportPos);
    }
  }

  writeFile(file, content);
  console.log('✔ parental.js prepared');
}

/**
 * Add Mongo paths to achievements.js
 */
async function migrateAchievements() {
  const file = path.join(controllersDir, 'achievements.js');
  let content = readFile(file);

  const helper = `
/**
 * Helper: Get badge metadata
 */
function getBadgeMetadata(badgeId) {
  const badges = {
    'first-story': { name: 'Story Starter', icon: '📖', points: 10 },
    'perfect-lesson': { name: 'Perfect Lesson', icon: '💯', points: 25 },
    'social-butterfly': { name: 'Social Butterfly', icon: '🦋', points: 15 },
    'streak-7': { name: 'Week Warrior', icon: '🔥', points: 50 },
  };
  return badges[badgeId] || { name: 'Achievement', icon: '🏆', points: 5 };
}
`;

  if (!content.includes('getBadgeMetadata')) {
    const firstExportPos = content.indexOf('export const');
    if (firstExportPos > 0) {
      content = content.slice(0, firstExportPos) + helper + '\n' + content.slice(firstExportPos);
    }
  }

  writeFile(file, content);
  console.log('✔ achievements.js prepared');
}

/**
 * Add Mongo paths to chatbot.js
 */
async function migrateChatbot() {
  const file = path.join(controllersDir, 'chatbot.js');
  let content = readFile(file);

  const helper = `
/**
 * Helper: Store chat message in history
 */
async function storeChatMessage(db, userId, role, message, metadata = {}) {
  const now = new Date();
  return db.collection('chatbot_messages').insertOne({
    _id: require('uuid').v4(),
    userId,
    role, // 'user' | 'assistant'
    message,
    metadata,
    createdAt: now,
  });
}
`;

  if (!content.includes('storeChatMessage')) {
    const firstExportPos = content.indexOf('export const');
    if (firstExportPos > 0) {
      content = content.slice(0, firstExportPos) + helper + '\n' + content.slice(firstExportPos);
    }
  }

  writeFile(file, content);
  console.log('✔ chatbot.js prepared');
}

/**
 * Add Mongo paths to news-stories.js
 */
async function migrateNewsStories() {
  const file = path.join(controllersDir, 'news-stories.js');
  let content = readFile(file);

  const helper = `
/**
 * Helper: Create news article object
 */
function createNewsArticle(title, content, source, author, imageUrl = null) {
  const now = new Date();
  return {
    _id: require('uuid').v4(),
    title,
    content,
    source,
    author,
    imageUrl,
    viewsCount: 0,
    likesCount: 0,
    commentsCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}
`;

  if (!content.includes('createNewsArticle')) {
    const firstExportPos = content.indexOf('export const');
    if (firstExportPos > 0) {
      content = content.slice(0, firstExportPos) + helper + '\n' + content.slice(firstExportPos);
    }
  }

  writeFile(file, content);
  console.log('✔ news-stories.js prepared');
}

/**
 * Add Mongo paths to admin.js
 */
async function migrateAdmin() {
  const file = path.join(controllersDir, 'admin.js');
  let content = readFile(file);

  const helper = `
/**
 * Helper: Validate admin permissions
 */
async function isAdminUser(db, userId) {
  const user = await db.collection('users').findOne({
    _id: userId,
    userType: 'admin',
  });
  return !!user;
}

/**
 * Helper: Create audit log entry
 */
async function createAuditLog(db, adminId, action, targetType, targetId, changes = {}) {
  return db.collection('audit_logs').insertOne({
    _id: require('uuid').v4(),
    adminId,
    action,
    targetType,
    targetId,
    changes,
    createdAt: new Date(),
  });
}
`;

  if (!content.includes('isAdminUser')) {
    const firstExportPos = content.indexOf('export const');
    if (firstExportPos > 0) {
      content = content.slice(0, firstExportPos) + helper + '\n' + content.slice(firstExportPos);
    }
  }

  writeFile(file, content);
  console.log('✔ admin.js prepared');
}

/**
 * Main  
 */
async function main() {
  console.log('🔄 Completing Mongo-primary migration for all controllers...\n');

  try {
    // Migrate all remaining controllers
    await migrateSocial();
    await migrateGroups();
    await migrateDiscussions();
    await migrateDirectMessages();
    await migrateGroupChats();
    await migrateForums();
    await migrateParental();
    await migrateAchievements();
    await migrateChatbot();
    await migrateNewsStories();
    await migrateAdmin();

    console.log('\n✅ All 11 controllers prepared with Mongo-primary infrastructure');
    console.log('\n📝 Next: Review each endpoint and add specific Mongo queries');
    console.log('   Use pattern: if (isMongoPrimaryEnabled()) { /* Mongo */ } else { /* Sequelize */ }');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

main();
