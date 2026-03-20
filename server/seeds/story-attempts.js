import { StoryAttempt, User, Story, Topic } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Seed story attempts for child learning tracking
 */
export const seedStoryAttempts = async () => {
  try {
    // Check if story attempts already exist
    const existingCount = await StoryAttempt.count();
    if (existingCount > 0) {
      console.log('✅ Story attempts already seeded, skipping...');
      return;
    }

    console.log('🌱 Seeding story attempts...');

    // Get sample users and stories for seeding
    const users = await User.findAll({ limit: 5 });
    const stories = await Story.findAll({ limit: 3 });
    const topics = await Topic.findAll({ limit: 3 });

    if (users.length === 0 || stories.length === 0 || topics.length === 0) {
      console.log('⚠️  Not enough users, stories, or topics to seed attempts. Skipping...');
      return;
    }

    const emotions = ['happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'neutral', 'confused', 'motivated', 'stressed'];
    const attempts = [];

    // Create sample attempts for each user
    for (const user of users) {
      for (let i = 0; i < 3; i++) {
        const story = stories[Math.floor(Math.random() * stories.length)];
        const topic = topics[Math.floor(Math.random() * topics.length)];
        const isCorrect = Math.random() > 0.3; // 70% correct

        const attempt = await StoryAttempt.create({
          userId: user.id,
          storyId: story.id,
          topicId: topic.id,
          questionIndex: Math.floor(Math.random() * 10),
          userAnswer: isCorrect
            ? 'The child answered correctly'
            : 'The child answered: ' + ['Option A', 'Option B', 'Option C'][Math.floor(Math.random() * 3)],
          correctAnswer: 'The correct answer is Option A',
          isCorrect: isCorrect,
          scenarioContext: {
            branchTaken: 'story_branch_' + Math.floor(Math.random() * 3),
            choicesMade: ['choice_1', 'choice_2'],
          },
          emotionDetected: emotions[Math.floor(Math.random() * emotions.length)],
          emotionConfidence: Math.random() * 0.5 + 0.5, // 0.5 - 1.0
          emotionIntensity: Math.floor(Math.random() * 10) + 1, // 1-10
          aiRecommendation: {
            topicsToFocus: ['understanding-context', 'critical-thinking'],
            suggestedLessons: ['lesson_1', 'lesson_2'],
            confidence: 'high',
            explanation:
              'Child should practice reading comprehension and context clues from the story',
          },
          weaknessTopics: isCorrect ? [] : [topic.id],
          timeSpent: Math.floor(Math.random() * 180) + 30, // 30-210 seconds
          attemptsCount: Math.floor(Math.random() * 3) + 1, // 1-3 attempts
          notes: isCorrect ? 'Excellent work!' : 'Keep practicing this topic',
        });

        attempts.push(attempt);
      }
    }

    console.log(`✓ Created ${attempts.length} sample story attempts`);
    console.log(
      `✓ Seeded attempts for ${users.length} users with emotions and AI recommendations`
    );

    return attempts;
  } catch (error) {
    console.error('❌ Error seeding story attempts:', error);
    throw error;
  }
};
