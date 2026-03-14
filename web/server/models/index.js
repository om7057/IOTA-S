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

// Set up associations
Story.belongsTo(Topic, { foreignKey: 'topicId' });
Story.belongsTo(StoryLevel, { foreignKey: 'levelId' });
Topic.hasMany(Story, { foreignKey: 'topicId' });

Quiz.belongsTo(Story, { foreignKey: 'storyId' });
Story.hasMany(Quiz, { foreignKey: 'storyId' });

QuizProgress.belongsTo(Quiz, { foreignKey: 'quizId' });
Quiz.hasMany(QuizProgress, { foreignKey: 'quizId' });

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
  NewsStory
};
