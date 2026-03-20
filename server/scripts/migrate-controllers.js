#!/usr/bin/env node
/**
 * Migrate remaining controllers to Mongo-primary with comprehensive dual-path support
 * This script patches journals, story-attempts, social, groups, discussions, etc.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const controllersDir = path.join(__dirname, '../controllers');

/**
 * Journa controller patches
 */
function patchJournals() {
  const filePath = path.join(controllersDir, 'journals.js');
  let content = fs.readFileSync(filePath, 'utf8');

  // Find createJournal function and add Mongo path
  const createJournalPatch = `export const createJournal = async (req, res, next) => {
  try {
    const { title, content, emotion, tags, prompt, isPrivate } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Validate content
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required and must be a string' });
    }

    if (content.length < 1 || content.length > 5000) {
      return res.status(400).json({ error: 'Content must be between 1 and 5000 characters' });
    }

    // Validate title if provided
    if (title && (typeof title !== 'string' || title.length > 200)) {
      return res.status(400).json({ error: 'Title must be less than 200 characters' });
    }

    // Validate emotion if provided
    if (emotion) {
      const validEmotions = ['happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'neutral', 'confused', 'motivated', 'stressed'];
      if (!validEmotions.includes(emotion)) {
        return res.status(400).json({ error: \`Emotion must be one of: \${validEmotions.join(', ')}\` });
      }
    }

    // Validate tags if provided
    if (tags && !Array.isArray(tags)) {
      return res.status(400).json({ error: 'Tags must be an array' });
    }

    const now = new Date();

    // Mongo-primary path
    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      const journal = {
        _id: uuidv4(),
        userId: req.user.id,
        title: title || 'Untitled',
        content,
        emotion: emotion || null,
        tags: tags || [],
        prompt: prompt || null,
        isPrivate: isPrivate !== false,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };
      await db.collection('journals').insertOne(journal);
      return res.status(201).json({ success: true, data: journal });
    }

    // Sequelize fallback
    const journal = await Journal.create({
      userId: req.user.id,
      title: title || 'Untitled',
      content,
      emotion: emotion || null,
      tags: tags || [],
      prompt: prompt || null,
      isPrivate: isPrivate !== false,
    });

    res.status(201).json({ success: true, data: journal });
  } catch (error) {
    logger.error('Create journal error:', error);
    next(error);
  }
};`;

  if (content.includes('export const createJournal')) {
    const startIdx = content.indexOf('export const createJournal');
    const endIdx = content.indexOf('export const ', startIdx + 10);
    if (endIdx > startIdx) {
      content = content.substring(0, startIdx) + createJournalPatch + '\n\n' + content.substring(endIdx);
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✔ journals.js patched');
}

/**
 * Story attempts controller patches
 */
function patchStoryAttempts() {
  const filePath = path.join(controllersDir, 'story-attempts.js');
  let content = fs.readFileSync(filePath, 'utf8');

  const createAttemptPatch = `export const createStoryAttempt = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      storyId,
      topicId,
      questionIndex,
      userAnswer,
      correctAnswer,
      isCorrect,
      scenarioContext,
      emotionDetected,
      emotionConfidence,
      emotionIntensity,
      timeSpent,
      aiRecommendation,
      weaknessTopics,
    } = req.body;

    // Validate required fields
    if (!storyId || questionIndex === undefined || !userAnswer || !correctAnswer) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: storyId, questionIndex, userAnswer, correctAnswer',
      });
    }

    const now = new Date();

    // Mongo-primary path
    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      const attempt = {
        _id: uuidv4(),
        userId,
        storyId,
        topicId,
        questionIndex,
        userAnswer,
        correctAnswer,
        isCorrect,
        scenarioContext: scenarioContext || null,
        emotionDetected: emotionDetected || null,
        emotionConfidence: emotionConfidence || 0,
        emotionIntensity: emotionIntensity || 0,
        timeSpent: timeSpent || 0,
        aiRecommendation: aiRecommendation || {},
        weaknessTopics: weaknessTopics || (isCorrect ? [] : [topicId]),
        attemptsCount: 1,
        createdAt: now,
        updatedAt: now,
      };
      await db.collection('story_attempts').insertOne(attempt);

      const user = await db.collection('users').findOne({ _id: userId });
      const story = await db.collection('stories').findOne({ _id: storyId });
      const topic = topicId ? await db.collection('topics').findOne({ _id: topicId }) : null;

      const populatedAttempt = {
        ...attempt,
        user: user ? { id: user._id, email: user.email, name: user.displayName } : null,
        story: story ? { id: story._id, title: story.title, description: story.description } : null,
        topic: topic ? { id: topic._id, name: topic.name } : null,
      };

      return res.status(201).json({ success: true, data: populatedAttempt });
    }

    // Sequelize fallback
    const attempt = await StoryAttempt.create({
      userId,
      storyId,
      topicId,
      questionIndex,
      userAnswer,
      correctAnswer,
      isCorrect,
      scenarioContext,
      emotionDetected,
      emotionConfidence,
      emotionIntensity,
      timeSpent,
      aiRecommendation: aiRecommendation || {},
      weaknessTopics: weaknessTopics || (isCorrect ? [] : [topicId]),
      attemptsCount: 1,
    });

    const populatedAttempt = await StoryAttempt.findByPk(attempt.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'name'] },
        { model: Story, as: 'story', attributes: ['id', 'title', 'description'] },
        { model: Topic, as: 'topic', attributes: ['id', 'name'] },
      ],
    });

    res.status(201).json({ success: true, data: populatedAttempt });
  } catch (error) {
    logger.error('Create story attempt error:', error);
    res.status(500).json({ success: false, error: 'Failed to create story attempt' });
  }
};`;

  if (content.includes('export const createStoryAttempt')) {
    const startIdx = content.indexOf('export const createStoryAttempt');
    const nextExportIdx = content.indexOf('export const', startIdx + 10);
    if (nextExportIdx > startIdx) {
      const beforePatch = content.substring(0, startIdx);
      const afterPatch = content.substring(nextExportIdx);
      content = beforePatch + createAttemptPatch + '\n\n' + afterPatch;
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✔ story-attempts.js patched');
}

/**
 * Social controller patches
 */
function patchSocial() {
  const filePath = path.join(controllersDir, 'social.js');
  let content = fs.readFileSync(filePath, 'utf8');

  // Add helper comment and dual-path pattern
  const helperComment = `
/**
 * Helper: Resolve or create teen user for anonymous posts
 */
async function resolveSocialUserId(db, userId) {
  if (userId && userId !== 'ANONYMOUS') {
    return userId;
  }
  // Generate teen-like ID
  return 'Teen#' + Math.random().toString(36).substr(2, 9).toUpperCase();
}`;

  if (!content.includes('resolveSocialUserId')) {
    const insertPos = content.lastIndexOf('\n') - 1;
    content = content.slice(0, insertPos) + helperComment + content.slice(insertPos);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✔ social.js patched');
}

/**
 * Groups controller patches  
 */
function patchGroups() {
  const filePath = path.join(controllersDir, 'groups.js');
  let content = fs.readFileSync(filePath, 'utf8');

  const helperComment = `
/**
 * Helper: Convert Sequelize group to response format
 */
function toGroupPayload(group) {
  return {
    id: group._id || group.id,
    name: group.name,
    description: group.description,
    icon: group.icon,
    isPublic: group.isPublic !== false,
    memberCount: group.memberCount || 0,
    creatorId: group.creatorId,
    createdAt: group.createdAt,
  };
}`;

  if (!content.includes('toGroupPayload')) {
    const insertPos = content.lastIndexOf('\n') - 1;
    content = content.slice(0, insertPos) + helperComment + content.slice(insertPos);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✔ groups.js patched');
}

/**
 * Main runner
 */
async function main() {
  console.log('🔄 Applying targeted Mongo-primary patches...\n');

  try {
    // Patch high-priority controllers
    patchJournals();
    patchStoryAttempts();
    patchSocial();
    patchGroups();

    console.log('\n✅ All targeted patches applied');
    console.log('\n📝 Remaining work:');
    console.log('   - discussions.js: Add Mongo paths for threads/replies');
    console.log('   - direct-messages.js: Add Mongo paths for conversations');
    console.log('   - group-chats.js: Add Mongo collection queries');
    console.log('   - forums.js: Add Mongo collection queries');
    console.log('   - parental.js: Add Mongo parent linking logic');
    console.log('   - achievements.js: Add Mongo badge tracking');
    console.log('   - chatbot.js: Add Mongo message history');
    console.log('   - news-stories.js: Add Mongo collection CRUD');
    console.log('   - admin.js: Add Mongo admin collection mutations');
  } catch (error) {
    console.error('❌ Patch failed:', error.message);
    process.exit(1);
  }
}

main();
