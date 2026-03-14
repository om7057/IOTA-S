import express from 'express';
import { Story, Topic, StoryLevel, Quiz } from '../models/index.js';
import { v4 as uuid } from 'uuid';

const router = express.Router();

// Sample quiz data
const childSafetyQuiz = [
  {
    question: 'What is the first thing you should do if someone touches you in a way that makes you uncomfortable?',
    options: [
      'Say NO and move away',
      'Stay quiet and freeze',
      'Try to handle it yourself',
      'Wait to tell someone later'
    ],
    correctAnswer: 0,
    points: 10
  },
  {
    question: 'Who should you tell if someone touches you in a bad way?',
    options: [
      'A trusted adult like parent, teacher, or counselor',
      'Nobody - you should feel ashamed',
      'Try to forget about it',
      'Only tell your friends'
    ],
    correctAnswer: 0,
    points: 10
  },
  {
    question: 'Good touch makes you feel:',
    options: [
      'Safe and comfortable',
      'Scared and confused',
      'Angry and upset',
      'Ashamed'
    ],
    correctAnswer: 0,
    points: 10
  }
];

// Seed the child safety story
router.post('/seed-child-safety', async (req, res) => {
  try {
    // First, ensure topic exists
    let topic = await Topic.findOne({ where: { name: 'Child Safety' } });
    if (!topic) {
      topic = await Topic.create({
        id: uuid(),
        name: 'Child Safety',
        description: 'Learn about personal safety and protecting yourself from harm'
      });
    }

    // Create a story level
    let level = await StoryLevel.findOne({ 
      where: { 
        title: 'Child Safety Level 1'
      }
    });
    if (!level) {
      level = await StoryLevel.create({
        id: uuid(),
        chapter: 1,
        title: 'Child Safety Level 1',
        description: 'Introduction to personal safety'
      });
    }

    // Check if story already exists
    const existingStory = await Story.findOne({ 
      where: { title: 'Child Safety - Good Touch & Bad Touch' }
    });
    if (existingStory) {
      return res.status(400).json({ message: 'Story already exists' });
    }

    const storyData = {
      id: uuid(),
      title: 'Child Safety - Good Touch & Bad Touch',
      description: 'Learn about personal safety through Arav\'s journey. Understand good touch, bad touch, and why telling a trusted adult is important.',
      topicId: topic.id,
      levelId: level.id,
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
          title: 'Lesson Learned: Always trust your feeling. If something does not feel right, say NO and go to a trusted adult.',
          image: '/award.gif',
          options: [{ text: 'End Story', to: 0 }],
        }
      ]
    };

    const newStory = await Story.create(storyData);
    
    res.status(201).json({
      message: 'Child Safety story seeded successfully',
      story: newStory
    });
  } catch (err) {
    console.error('Error seeding child safety story:', err);
    res.status(500).json({ error: err.message });
  }
});

// Seed quizzes for child safety story
router.post('/seed-child-safety-quizzes', async (req, res) => {
  try {
    // Find the child safety story
    const story = await Story.findOne({ 
      where: { title: 'Child Safety - Good Touch & Bad Touch' }
    });
    if (!story) {
      return res.status(404).json({ 
        error: 'Child Safety story not found. Seed story first with /api/seed/seed-child-safety' 
      });
    }

    // Check if quizzes already exist
    const existingQuizzes = await Quiz.findAll({ 
      where: { storyId: story.id }
    });
    if (existingQuizzes.length > 0) {
      return res.status(400).json({ 
        message: `${existingQuizzes.length} quizzes already exist for this story` 
      });
    }

    // Create quiz questions with story reference
    const createdQuizzes = [];
    for (const quizData of childSafetyQuiz) {
      const quiz = await Quiz.create({
        id: uuid(),
        storyId: story.id,
        question: quizData.question,
        options: quizData.options,
        correctAnswer: quizData.correctAnswer,
        points: quizData.points
      });
      createdQuizzes.push(quiz);
    }

    res.status(201).json({
      message: 'Child Safety quizzes seeded successfully',
      count: createdQuizzes.length,
      quizzes: createdQuizzes
    });
  } catch (err) {
    console.error('Error seeding quizzes:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
