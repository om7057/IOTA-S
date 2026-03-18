import { Story, Unit, Lesson, Challenge } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Seed stories with units, lessons, and challenges
 */
export const seedStories = async () => {
  try {
    // Check if stories already exist
    const existingCount = await Story.count();
    if (existingCount > 0) {
      console.log('✅ Stories already seeded, skipping...');
      return;
    }

    console.log('🌱 Seeding stories...');

    // Create sample stories
    const story1 = await Story.create({
      title: 'The Adventure of Maya',
      description: 'Join Maya on an exciting journey through enchanted forests and magical towns',
      content: 'Once upon a time, Maya discovered a hidden path in the forest near her home...',
      category: 'general',
      difficultyLevel: 'beginner',
      ageGroup: '5-8',
      isPublished: true,
      imageUrl: 'https://via.placeholder.com/300x200?text=Maya+Adventure',
      duration: 45,
      tags: ['adventure', 'fantasy', 'nature'],
    });

    const story2 = await Story.create({
      title: 'Code Quest: The Digital Mystery',
      description: 'Solve puzzles and learn coding basics with our tech-savvy hero Alex',
      content: 'In a world where code controls everything, young hacker Alex must solve...',
      category: 'academic',
      difficultyLevel: 'intermediate',
      ageGroup: '9-12',
      isPublished: true,
      imageUrl: 'https://via.placeholder.com/300x200?text=Code+Quest',
      duration: 60,
      tags: ['coding', 'technology', 'puzzle'],
    });

    const story3 = await Story.create({
      title: 'Friends Forever: Understanding Emotions',
      description: 'Learn about friendship and emotions through relatable stories',
      content: 'Three best friends discover that being a good friend means understanding...',
      category: 'social',
      difficultyLevel: 'beginner',
      ageGroup: '5-8',
      isPublished: true,
      imageUrl: 'https://via.placeholder.com/300x200?text=Friends+Forever',
      duration: 30,
      tags: ['friendship', 'emotions', 'social'],
    });

    const story4 = await Story.create({
      title: 'Teen Heroes: Finding Your Voice',
      description: 'Discover your unique talents and how to make a difference in the world',
      content: 'A group of teenagers from different backgrounds learn that everyone has...',
      category: 'identity',
      difficultyLevel: 'intermediate',
      ageGroup: '13-16',
      isPublished: true,
      imageUrl: 'https://via.placeholder.com/300x200?text=Teen+Heroes',
      duration: 75,
      tags: ['inspiration', 'motivation', 'teen'],
    });

    console.log('✓ Created 4 sample stories');

    // Create units for each story
    const units = [];
    for (let i = 0; i < 4; i++) {
      const story = [story1, story2, story3, story4][i];
      for (let j = 0; j < 3; j++) {
        const unit = await Unit.create({
          storyId: story.id,
          title: `${story.title} - Unit ${j + 1}`,
          description: `Learn part ${j + 1} of ${story.title}`,
          content: `Unit content for ${story.title}`,
          sequence: j + 1,
          isPublished: true,
          estimatedTime: 20,
        });
        units.push(unit);
      }
    }

    console.log(`✓ Created ${units.length} units`);

    // Create lessons for each unit
    const lessons = [];
    for (const unit of units) {
      for (let k = 0; k < 2; k++) {
        const lesson = await Lesson.create({
          unitId: unit.id,
          title: `${unit.title} - Lesson ${k + 1}`,
          description: `Interactive lesson for ${unit.title}`,
          content: `Lesson content for ${unit.title}`,
          videoUrl: `https://via.placeholder.com/480x360?text=Lesson+${k + 1}`,
          sequence: k + 1,
          isPublished: true,
          estimatedTime: 15,
        });
        lessons.push(lesson);
      }
    }

    console.log(`✓ Created ${lessons.length} lessons`);

    // Create challenges for lessons
    const challenges = [];
    for (const lesson of lessons) {
      const challenge = await Challenge.create({
        lessonId: lesson.id,
        sequence: 1,
        title: `${lesson.title} - Challenge`,
        description: `Complete this challenge to master ${lesson.title}`,
        prompt: `What did you learn from ${lesson.title}? Please answer the following question.`,
        type: 'reflection',
        points: 10,
        isOptional: false,
      });
      challenges.push(challenge);
    }

    console.log(`✓ Created ${challenges.length} challenges`);
    console.log('✅ Story seeding complete!');

  } catch (error) {
    console.error('❌ Error seeding stories:', error.message);
    throw error;
  }
};

export default seedStories;
