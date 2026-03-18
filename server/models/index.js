import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

// sequelize instance is imported from config/sequelize.js
// to avoid circular dependencies
export { sequelize };

// Import ALL models BEFORE setting up relationships
// This ensures sequelize is already defined when models load
import User from './User.js';
import RefreshToken from './RefreshToken.js';
import Mood from './Mood.js';
import Journal from './Journal.js';
import Topic from './Topic.js';
import Story from './Story.js';
import NewsStory from './NewsStory.js';
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
import Badge from './Badge.js';
import UserAchievement from './UserAchievement.js';
import ParentalAccount from './ParentalAccount.js';
import ChatMessage from './ChatMessage.js';
import Post from './Post.js';
import Thread from './Thread.js';
import ThreadReply from './ThreadReply.js';
import Comment from './Comment.js';
import ChildrenCourse from './ChildrenCourse.js';
import ChildrenUnit from './ChildrenUnit.js';
import ChildrenLesson from './ChildrenLesson.js';
import ChildrenChallenge from './ChildrenChallenge.js';
import ChildrenChallengeOption from './ChildrenChallengeOption.js';
import ChildrenProgress from './ChildrenProgress.js';
import ChildrenChallengeProgress from './ChildrenChallengeProgress.js';

// Export all models AFTER they're imported
export { User };
export { RefreshToken };
export { Mood };
export { Journal };
export { Topic };
export { Story };
export { NewsStory };
export { Unit };
export { Lesson };
export { Challenge };
export { Quiz };
export { QuizQuestion };
export { QuizProgress };
export { UserStoryProgress };
export { Leaderboard };
export { Group };
export { GroupMember };
export { Discussion };
export { DiscussionReply };
export { Conversation };
export { DirectMessage };
export { GroupChat };
export { Like };
export { Badge };
export { UserAchievement };
export { ParentalAccount };
export { ChatMessage };
export { Post };
export { Thread };
export { ThreadReply };
export { Comment };
export { ChildrenCourse };
export { ChildrenUnit };
export { ChildrenLesson };
export { ChildrenChallenge };
export { ChildrenChallengeOption };
export { ChildrenProgress };
export { ChildrenChallengeProgress };

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

// Topic relationships
Topic.hasMany(Story, { as: 'stories', foreignKey: 'topicId' });
Story.belongsTo(Topic, { as: 'topic', foreignKey: 'topicId' });

Topic.hasMany(NewsStory, { as: 'newsStories', foreignKey: 'topicId' });
NewsStory.belongsTo(Topic, { as: 'topic', foreignKey: 'topicId' });

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

// Achievement relationships (Phase 8 - Child Mode)
Badge.hasMany(UserAchievement, { as: 'userAchievements', foreignKey: 'badgeId' });
UserAchievement.belongsTo(Badge, { as: 'badge', foreignKey: 'badgeId' });

User.hasMany(UserAchievement, { as: 'achievements', foreignKey: 'userId' });
UserAchievement.belongsTo(User, { as: 'user', foreignKey: 'userId' });

// Parental Account relationships (Phase 8 - Child Mode)
User.hasMany(ParentalAccount, { as: 'childAccounts', foreignKey: 'childUserId' });
User.hasMany(ParentalAccount, { as: 'parentAccounts', foreignKey: 'parentUserId' });
ParentalAccount.belongsTo(User, { as: 'child', foreignKey: 'childUserId' });
ParentalAccount.belongsTo(User, { as: 'parent', foreignKey: 'parentUserId' });

// Chat relationships (Phase 8B - Teen Mode)
User.hasMany(ChatMessage, { as: 'chatMessages', foreignKey: 'userId' });
ChatMessage.belongsTo(User, { as: 'user', foreignKey: 'userId' });

// Post relationships (Phase 8B - Teen Mode)
User.hasMany(Post, { as: 'posts', foreignKey: 'userId' });
Post.belongsTo(User, { as: 'creator', foreignKey: 'userId' });

Group.hasMany(Post, { as: 'posts', foreignKey: 'groupId' });
Post.belongsTo(Group, { as: 'group', foreignKey: 'groupId' });

// Thread relationships (Phase 8B - Teen Mode)
Group.hasMany(Thread, { as: 'threads', foreignKey: 'groupId' });
Thread.belongsTo(Group, { as: 'group', foreignKey: 'groupId' });

User.hasMany(Thread, { as: 'threads', foreignKey: 'creatorId' });
Thread.belongsTo(User, { as: 'creator', foreignKey: 'creatorId' });

Thread.hasMany(ThreadReply, { as: 'replies', foreignKey: 'threadId' });
ThreadReply.belongsTo(Thread, { as: 'thread', foreignKey: 'threadId' });

User.hasMany(ThreadReply, { as: 'threadReplies', foreignKey: 'userId' });
ThreadReply.belongsTo(User, { as: 'creator', foreignKey: 'userId' });

ThreadReply.hasMany(ThreadReply, { as: 'nestedReplies', foreignKey: 'parentReplyId' });
ThreadReply.belongsTo(ThreadReply, { as: 'parentReply', foreignKey: 'parentReplyId' });

// Comment relationships (Phase 8B - Teen Mode)
Post.hasMany(Comment, { as: 'comments', foreignKey: 'postId' });
Comment.belongsTo(Post, { as: 'post', foreignKey: 'postId' });

User.hasMany(Comment, { as: 'comments', foreignKey: 'userId' });
Comment.belongsTo(User, { as: 'creator', foreignKey: 'userId' });

Comment.hasMany(Comment, { as: 'replies', foreignKey: 'parentCommentId' });
Comment.belongsTo(Comment, { as: 'parentComment', foreignKey: 'parentCommentId' });

// ==================== Children Learning Course Relationships ====================
// Children Course hierarchy
ChildrenCourse.hasMany(ChildrenUnit, { as: 'units', foreignKey: 'courseId' });
ChildrenUnit.belongsTo(ChildrenCourse, { as: 'course', foreignKey: 'courseId' });

ChildrenUnit.hasMany(ChildrenLesson, { as: 'lessons', foreignKey: 'unitId' });
ChildrenLesson.belongsTo(ChildrenUnit, { as: 'unit', foreignKey: 'unitId' });

ChildrenLesson.hasMany(ChildrenChallenge, { as: 'challenges', foreignKey: 'lessonId' });
ChildrenChallenge.belongsTo(ChildrenLesson, { as: 'lesson', foreignKey: 'lessonId' });

ChildrenChallenge.hasMany(ChildrenChallengeOption, { as: 'options', foreignKey: 'challengeId' });
ChildrenChallengeOption.belongsTo(ChildrenChallenge, { as: 'challenge', foreignKey: 'challengeId' });

// Children Progress tracking
User.hasOne(ChildrenProgress, { as: 'childrenProgress', foreignKey: 'userId' });
ChildrenProgress.belongsTo(User, { as: 'user', foreignKey: 'userId' });

ChildrenProgress.belongsTo(ChildrenCourse, { as: 'activeCourse', foreignKey: 'activeCourseId' });
ChildrenCourse.hasMany(ChildrenProgress, { as: 'playerProgress', foreignKey: 'activeCourseId' });

User.hasMany(ChildrenChallengeProgress, { as: 'challengeProgress', foreignKey: 'userId' });
ChildrenChallengeProgress.belongsTo(User, { as: 'user', foreignKey: 'userId' });

ChildrenChallenge.hasMany(ChildrenChallengeProgress, { as: 'playerProgress', foreignKey: 'challengeId' });
ChildrenChallengeProgress.belongsTo(ChildrenChallenge, { as: 'challenge', foreignKey: 'challengeId' });

const db = {
  User,
  RefreshToken,
  Mood,
  Journal,
  Topic,
  Story,
  NewsStory,
  Unit,
  Lesson,
  Challenge,
  Quiz,
  QuizQuestion,
  QuizProgress,
  UserStoryProgress,
  Leaderboard,
  Group,
  GroupMember,
  Discussion,
  DiscussionReply,
  Conversation,
  DirectMessage,
  GroupChat,
  Like,
  Badge,
  UserAchievement,
  ParentalAccount,
  ChatMessage,
  Post,
  Thread,
  ThreadReply,
  Comment,
  ChildrenCourse,
  ChildrenUnit,
  ChildrenLesson,
  ChildrenChallenge,
  ChildrenChallengeOption,
  ChildrenProgress,
  ChildrenChallengeProgress,
};

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    return sequelize;
  } catch (error) {
    console.error('❌ Unable to connect to database:', error.message);
    process.exit(1);
  }
};

export default db;
