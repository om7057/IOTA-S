import { Sequelize, DataTypes } from 'sequelize';
import dbConfig from '../config/database.js';

// Create Sequelize instance
export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
    logging: dbConfig.logging,
    define: dbConfig.define,
  }
);

// Import all models
export { User } from './User.js';
export { RefreshToken } from './RefreshToken.js';
export { Mood } from './Mood.js';
export { Journal } from './Journal.js';
export { Story } from './Story.js';
export { Unit } from './Unit.js';
export { Lesson } from './Lesson.js';
export { Challenge } from './Challenge.js';
export { Quiz } from './Quiz.js';
export { QuizQuestion } from './QuizQuestion.js';
export { QuizProgress } from './QuizProgress.js';
export { UserStoryProgress } from './UserStoryProgress.js';
export { Leaderboard } from './Leaderboard.js';
export { Group } from './Group.js';
export { GroupMember } from './GroupMember.js';
export { Discussion } from './Discussion.js';
export { DiscussionReply } from './DiscussionReply.js';
export { Conversation } from './Conversation.js';
export { DirectMessage } from './DirectMessage.js';
export { GroupChat } from './GroupChat.js';
export { Like } from './Like.js';

// Import models to ensure they're registered
import User from './User.js';
import RefreshToken from './RefreshToken.js';
import Mood from './Mood.js';
import Journal from './Journal.js';
import Story from './Story.js';
import Unit from './Unit.js';
import Lesson from './Lesson.js';
import Challenge from './Challenge.js';
import Quiz from './Quiz.js';
import QuizQuestion from './QuizQuestion.js';
import QuizProgress from './QuizProgress.js';
import UserStoryProgress from './UserStoryProgress.js';
import Leaderboard from './Leaderboard.js';
import Group from './Group.js';
import GroupMember from './GroupMember.js';
import Discussion from './Discussion.js';
import DiscussionReply from './DiscussionReply.js';
import Conversation from './Conversation.js';
import DirectMessage from './DirectMessage.js';
import GroupChat from './GroupChat.js';
import Like from './Like.js';

// Establish relationships
// User relationships
User.hasMany(RefreshToken, { as: 'refreshTokens', foreignKey: 'userId' });
RefreshToken.belongsTo(User, { as: 'user', foreignKey: 'userId' });

User.hasMany(Mood, { as: 'moods', foreignKey: 'userId' });
Mood.belongsTo(User, { as: 'user', foreignKey: 'userId' });

User.hasMany(Journal, { as: 'journals', foreignKey: 'userId' });
Journal.belongsTo(User, { as: 'user', foreignKey: 'userId' });

// Quiz relationships
Quiz.hasMany(QuizQuestion, { as: 'questions', foreignKey: 'quizId' });
QuizQuestion.belongsTo(Quiz, { as: 'quiz', foreignKey: 'quizId' });

User.hasMany(QuizProgress, { as: 'quizAttempts', foreignKey: 'userId' });
QuizProgress.belongsTo(User, { as: 'user', foreignKey: 'userId' });

Quiz.hasMany(QuizProgress, { as: 'attempts', foreignKey: 'quizId' });
QuizProgress.belongsTo(Quiz, { as: 'quiz', foreignKey: 'quizId' });

// Story progress relationships
User.hasMany(UserStoryProgress, { as: 'storyProgress', foreignKey: 'userId' });
UserStoryProgress.belongsTo(User, { as: 'user', foreignKey: 'userId' });

Story.hasMany(UserStoryProgress, { as: 'userProgress', foreignKey: 'storyId' });
UserStoryProgress.belongsTo(Story, { as: 'story', foreignKey: 'storyId' });

Unit.hasMany(UserStoryProgress, { as: 'userProgress', foreignKey: 'unitId' });
UserStoryProgress.belongsTo(Unit, { as: 'unit', foreignKey: 'unitId' });

Lesson.hasMany(UserStoryProgress, { as: 'userProgress', foreignKey: 'lessonId' });
UserStoryProgress.belongsTo(Lesson, { as: 'lesson', foreignKey: 'lessonId' });

Challenge.hasMany(UserStoryProgress, { as: 'userProgress', foreignKey: 'challengeId' });
UserStoryProgress.belongsTo(Challenge, { as: 'challenge', foreignKey: 'challengeId' });

// Leaderboard relationships
User.hasMany(Leaderboard, { as: 'leaderboardEntries', foreignKey: 'userId' });
Leaderboard.belongsTo(User, { as: 'user', foreignKey: 'userId' });

// Story hierarchy relationships
Story.hasMany(Unit, { as: 'units', foreignKey: 'storyId' });
Unit.belongsTo(Story, { as: 'story', foreignKey: 'storyId' });

Unit.hasMany(Lesson, { as: 'lessons', foreignKey: 'unitId' });
Lesson.belongsTo(Unit, { as: 'unit', foreignKey: 'unitId' });

Lesson.hasMany(Challenge, { as: 'challenges', foreignKey: 'lessonId' });
Challenge.belongsTo(Lesson, { as: 'lesson', foreignKey: 'lessonId' });

// Group relationships (Phase 6)
User.hasMany(Group, { as: 'ownedGroups', foreignKey: 'creatorId' });
Group.belongsTo(User, { as: 'creator', foreignKey: 'creatorId' });

Group.hasMany(GroupMember, { as: 'members', foreignKey: 'groupId' });
GroupMember.belongsTo(Group, { as: 'group', foreignKey: 'groupId' });

User.hasMany(GroupMember, { as: 'groupMemberships', foreignKey: 'userId' });
GroupMember.belongsTo(User, { as: 'user', foreignKey: 'userId' });

// Discussion relationships (Phase 6)
Group.hasMany(Discussion, { as: 'discussions', foreignKey: 'groupId' });
Discussion.belongsTo(Group, { as: 'group', foreignKey: 'groupId' });

User.hasMany(Discussion, { as: 'discussions', foreignKey: 'creatorId' });
Discussion.belongsTo(User, { as: 'creator', foreignKey: 'creatorId' });

Discussion.hasMany(DiscussionReply, { as: 'replies', foreignKey: 'discussionId' });
DiscussionReply.belongsTo(Discussion, { as: 'discussion', foreignKey: 'discussionId' });

User.hasMany(DiscussionReply, { as: 'replies', foreignKey: 'creatorId' });
DiscussionReply.belongsTo(User, { as: 'creator', foreignKey: 'creatorId' });

DiscussionReply.hasMany(DiscussionReply, { as: 'nestedReplies', foreignKey: 'parentReplyId' });
DiscussionReply.belongsTo(DiscussionReply, { as: 'parentReply', foreignKey: 'parentReplyId' });

// Direct Message relationships (Phase 6)
User.hasMany(Conversation, { as: 'conversationsAsUser1', foreignKey: 'user1Id' });
User.hasMany(Conversation, { as: 'conversationsAsUser2', foreignKey: 'user2Id' });

Conversation.hasMany(DirectMessage, { as: 'messages', foreignKey: 'conversationId' });
DirectMessage.belongsTo(Conversation, { as: 'conversation', foreignKey: 'conversationId' });

User.hasMany(DirectMessage, { as: 'sentMessages', foreignKey: 'senderId' });
DirectMessage.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });

// Group Chat relationships (Phase 6)
Group.hasMany(GroupChat, { as: 'chats', foreignKey: 'groupId' });
GroupChat.belongsTo(Group, { as: 'group', foreignKey: 'groupId' });

User.hasMany(GroupChat, { as: 'sentChats', foreignKey: 'senderId' });
GroupChat.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });

// Like relationships (Phase 6)
User.hasMany(Like, { as: 'likes', foreignKey: 'userId' });
Like.belongsTo(User, { as: 'user', foreignKey: 'userId' });
const db = {
  User,
  RefreshToken,
  Mood,
  Journal,
  Story,
  Unit,
  Lesson,
  Challenge,
  Quiz,
  QuizQuestion,
  QuizProgress,
  UserStoryProgress,
  Leaderboard,  Group,
  GroupMember,
  Discussion,
  DiscussionReply,
  Conversation,
  DirectMessage,
  GroupChat,
  Like,};

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Sync models (development only)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('✅ Database models synchronized');
    }

    return sequelize;
  } catch (error) {
    console.error('❌ Unable to connect to database:', error.message);
    process.exit(1);
  }
};

export default db;
