import { User } from './User.js';
import { Topic } from './Topic.js';
import { Story } from './Story.js';
import { StoryLevel } from './StoryLevel.js';
import { Journal } from './Journal.js';
import { MoodLog } from './MoodLog.js';
import { Quiz } from './Quiz.js';
import { QuizProgress } from './QuizProgress.js';
import { Leaderboard } from './Leaderboard.js';
import { NewsStory } from './NewsStory.js';
import { Unit } from './Unit.js';
import { Lesson } from './Lesson.js';
import { Challenge } from './Challenge.js';
import { ChallengeOption } from './ChallengeOption.js';
import { ChallengeProgress } from './ChallengeProgress.js';
import { TeenTopic } from './TeenTopic.js';
import { TeenDiscussion } from './TeenDiscussion.js';
import { TeenComment } from './TeenComment.js';
import { TeenJournal } from './TeenJournal.js';
import { TeenGroup } from './TeenGroup.js';
import { TeenGroupMember } from './TeenGroupMember.js';
import { TeenGroupMessage } from './TeenGroupMessage.js';
import { TeenDirectMessage } from './TeenDirectMessage.js';
import { TeenVerification } from './TeenVerification.js';
import { Query } from './Query.js';

// Set up associations - Original
Story.belongsTo(Topic, { foreignKey: 'topicId' });
Story.belongsTo(StoryLevel, { foreignKey: 'levelId' });
Topic.hasMany(Story, { foreignKey: 'topicId' });

Quiz.belongsTo(Story, { foreignKey: 'storyId' });
Story.hasMany(Quiz, { foreignKey: 'storyId' });

QuizProgress.belongsTo(Quiz, { foreignKey: 'quizId' });
Quiz.hasMany(QuizProgress, { foreignKey: 'quizId' });

// New hierarchical associations - Unit → Lesson → Challenge → ChallengeOption
Topic.hasMany(Unit, { foreignKey: 'topicId' });
Unit.belongsTo(Topic, { foreignKey: 'topicId' });

Unit.hasMany(Lesson, { foreignKey: 'unitId' });
Lesson.belongsTo(Unit, { foreignKey: 'unitId' });

Lesson.hasMany(Challenge, { foreignKey: 'lessonId' });
Challenge.belongsTo(Lesson, { foreignKey: 'lessonId' });

Challenge.hasMany(ChallengeOption, { foreignKey: 'challengeId' });
ChallengeOption.belongsTo(Challenge, { foreignKey: 'challengeId' });

Challenge.hasMany(ChallengeProgress, { foreignKey: 'challengeId' });
ChallengeProgress.belongsTo(Challenge, { foreignKey: 'challengeId' });

User.hasMany(ChallengeProgress, { foreignKey: 'userId' });
ChallengeProgress.belongsTo(User, { foreignKey: 'userId' });

// Story can optionally link to Lesson for context
Story.belongsTo(Lesson, { foreignKey: 'lessonId', allowNull: true });
Lesson.hasMany(Story, { foreignKey: 'lessonId' });

// Teen Platform Associations
TeenTopic.hasMany(TeenDiscussion, { foreignKey: 'topicId' });
TeenDiscussion.belongsTo(TeenTopic, { foreignKey: 'topicId' });

TeenDiscussion.hasMany(TeenComment, { foreignKey: 'discussionId' });
TeenComment.belongsTo(TeenDiscussion, { foreignKey: 'discussionId' });

User.hasMany(TeenDiscussion, { foreignKey: 'userId' });
TeenDiscussion.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(TeenComment, { foreignKey: 'userId' });
TeenComment.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(TeenJournal, { foreignKey: 'userId' });
TeenJournal.belongsTo(User, { foreignKey: 'userId' });

TeenGroup.hasMany(TeenGroupMember, { foreignKey: 'groupId' });
TeenGroupMember.belongsTo(TeenGroup, { foreignKey: 'groupId' });

User.hasMany(TeenGroupMember, { foreignKey: 'userId' });
TeenGroupMember.belongsTo(User, { foreignKey: 'userId' });

TeenGroup.hasMany(TeenGroupMessage, { foreignKey: 'groupId' });
TeenGroupMessage.belongsTo(TeenGroup, { foreignKey: 'groupId' });

User.hasMany(TeenGroupMessage, { foreignKey: 'userId' });
TeenGroupMessage.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(TeenDirectMessage, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(TeenDirectMessage, { foreignKey: 'recipientId', as: 'receivedMessages' });
TeenDirectMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
TeenDirectMessage.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });

User.hasOne(TeenVerification, { foreignKey: 'userId' });
TeenVerification.belongsTo(User, { foreignKey: 'userId' });

export {
  User,
  Topic,
  Story,
  StoryLevel,
  Journal,
  MoodLog,
  Quiz,
  QuizProgress,
  Leaderboard,
  NewsStory,
  Unit,
  Lesson,
  Challenge,
  ChallengeOption,
  ChallengeProgress,
  TeenTopic,
  TeenDiscussion,
  TeenComment,
  TeenJournal,
  TeenGroup,
  TeenGroupMember,
  TeenGroupMessage,
  TeenDirectMessage,
  TeenVerification,
  Query
};
