import express from 'express';
import { Story } from '../models/Story.js';
import { Topic } from '../models/Topic.js';
import { StoryLevel } from '../models/StoryLevel.js';
import { Quiz } from '../models/Quiz.js';
import { childSafetyQuiz } from '../seeds/quizData.js';

const router = express.Router();

// Seed the child safety story
router.post('/seed-child-safety', async (req, res) => {
  try {
    // First, ensure topic and level exist
    let topic = await Topic.findOne({ name: 'Child Safety' });
    if (!topic) {
      topic = await Topic.create({
        name: 'Child Safety',
        description: 'Learn about personal safety and protecting yourself from harm'
      });
    }

    let level = await StoryLevel.findOne({ 
      topic: topic._id,
      levelNumber: 1 
    });
    if (!level) {
      level = await StoryLevel.create({
        levelNumber: 1,
        topic: topic._id,
        starsRequiredToUnlock: 0,
        imageUrl: '/level-1.jpg'
      });
    }

    // Check if story already exists
    const existingStory = await Story.findOne({ title: 'Child Safety - Good Touch & Bad Touch' });
    if (existingStory) {
      return res.status(400).json({ message: 'Story already exists' });
    }

    const storyData = {
      title: 'Child Safety - Good Touch & Bad Touch',
      description: 'Learn about personal safety through Arav\'s journey. Understand good touch, bad touch, and why telling a trusted adult is important.',
      topic: topic._id,
      level: level._id,
      scenes: [
        {
          title: 'Arav happily goes to school with his parents.',
          image: '/a1.jpg',
          options: [{ text: 'Next', to: 1 }],
        },
        {
          title: 'At school, the teacher explains good touch and bad touch. She tells students that some body parts are private and should not be touched by others.',
          image: '/a2.jpg',
          options: [{ text: 'Next', to: 2 }],
        },
        {
          title: 'After school, Arav is waiting outside when a man comes near him.',
          image: '/a3.jpg',
          options: [{ text: 'Next', to: 3 }],
        },
        {
          title: 'The man says, "I will take you home. Come with me." Arav remembers his teacher\'s words.',
          image: '/a4.jpg',
          options: [
            { text: 'Go with the man', to: 6 },
            { text: 'Take the school bus', to: 4 },
          ],
        },
        {
          title: 'You made a safe choice. Arav takes the school bus and reaches home safely.',
          image: '/bus.jpg',
          options: [{ text: 'Next', to: 15 }],
        },
        {
          title: 'Later that day, Arav meets an adult known to the family.',
          image: '/a5.jpg',
          options: [{ text: 'Next', to: 6 }],
        },
        {
          title: 'The man asks Arav to come closer. Arav starts feeling uncomfortable.',
          image: '/a6.jpg',
          options: [{ text: 'Next', to: 7 }],
        },
        {
          title: 'The man touches Arav in a way that feels wrong. Arav remembers this is bad touch.',
          image: '/a9.jpg',
          options: [
            { text: 'Shout and run away', to: 8 },
            { text: 'Stay silent', to: 9 },
          ],
        },
        {
          title: 'Great job! Arav shouts and runs away to a safe place.',
          image: '/a10.jpg',
          options: [{ text: 'Next', to: 15 }],
        },
        {
          title: 'Arav feels scared and confused. He does not know what to do.',
          image: '/a12.jpg',
          options: [{ text: 'Next', to: 10 }],
        },
        {
          title: 'The man tells Arav to keep it a secret and offers him chocolates.',
          image: '/a11.jpg',
          options: [{ text: 'Next', to: 11 }],
        },
        {
          title: 'Arav is crying and feels very upset.',
          image: '/15.jpg',
          options: [{ text: 'Next', to: 12 }],
        },
        {
          title: 'Arav\'s parents arrive home and notice he is sad.',
          image: '/14.jpg',
          options: [{ text: 'Next', to: 13 }],
        },
        {
          title: 'Should Arav tell his parents what happened?',
          image: '/a16.jpg',
          options: [
            { text: 'Tell parents', to: 14 },
            { text: 'Keep it secret', to: 16 },
          ],
        },
        {
          title: 'Arav tells his parents everything. They listen and support him.',
          image: '/17.jpg',
          options: [{ text: 'Next', to: 15 }],
        },
        {
          title: 'The bad person is reported and Arav is kept safe.',
          image: '/a20.jpg',
          options: [{ text: 'Next', to: 18 }],
        },
        {
          title: 'Keeping secrets makes Arav feel lonely and scared.',
          image: '/sad.jpg',
          options: [{ text: 'Next', to: 18 }],
        },
        {
          title: 'Arav feels relieved after sharing the truth.',
          image: '/17.jpg',
          options: [{ text: 'Next', to: 18 }],
        },
        {
          title: 'Lesson Learned: If someone touches you in a way that feels wrong, say NO, move away, and tell a trusted adult. You are not alone.',
          image: '/award2.gif',
          options: [{ text: 'End Story', to: 0 }],
        },
      ],
    };

    const newStory = await Story.create(storyData);
    
    res.status(201).json({
      message: 'Child Safety story seeded successfully',
      story: newStory
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed quizzes for child safety story
router.post('/seed-child-safety-quizzes', async (req, res) => {
  try {
    // Find the child safety story
    const story = await Story.findOne({ title: 'Child Safety - Good Touch & Bad Touch' });
    if (!story) {
      return res.status(404).json({ error: 'Child Safety story not found. Seed story first with /api/seed/seed-child-safety' });
    }

    // Check if quizzes already exist
    const existingQuizzes = await Quiz.find({ story: story._id });
    if (existingQuizzes.length > 0) {
      return res.status(400).json({ message: `${existingQuizzes.length} quizzes already exist for this story` });
    }

    // Create quiz questions with story reference
    const quizzesWithStory = childSafetyQuiz.map(quiz => ({
      ...quiz,
      story: story._id
    }));

    const createdQuizzes = await Quiz.insertMany(quizzesWithStory);

    res.status(201).json({
      message: 'Child Safety quizzes seeded successfully',
      count: createdQuizzes.length,
      quizzes: createdQuizzes
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

