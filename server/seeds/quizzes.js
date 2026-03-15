import { Quiz, QuizQuestion } from '../models/index.js';

/**
 * Seed quizzes with sample questions
 */
export const seedQuizzes = async () => {
  try {
    // Check if quizzes already exist
    const existingCount = await Quiz.count();
    if (existingCount > 0) {
      console.log('✅ Quizzes already seeded, skipping...');
      return;
    }

    // Create sample quizzes
    const anxietyQuiz = await Quiz.create({
      title: 'Understanding Anxiety',
      description: 'Learn about anxiety symptoms and coping mechanisms',
      category: 'anxiety',
      difficultyLevel: 'beginner',
      timeLimit: 15,
      passingScore: 70,
      isPublished: true,
      tags: ['mental-health', 'education', 'anxiety'],
    });

    const depressionQuiz = await Quiz.create({
      title: 'Depression Awareness',
      description: 'Understanding depression and when to seek help',
      category: 'depression',
      difficultyLevel: 'intermediate',
      timeLimit: 20,
      passingScore: 75,
      isPublished: true,
      tags: ['mental-health', 'awareness'],
    });

    const socialQuiz = await Quiz.create({
      title: 'Social Skills 101',
      description: 'Improve your social interaction skills',
      category: 'social',
      difficultyLevel: 'beginner',
      timeLimit: 12,
      passingScore: 70,
      isPublished: true,
      tags: ['social', 'skills', 'communication'],
    });

    // Add questions to anxiety quiz
    const anxietyQuestions = [
      {
        type: 'multiple-choice',
        prompt: 'What is one common physical symptom of anxiety?',
        options: ['Increased heart rate', 'Improved focus', 'Enhanced appetite', 'Better sleep'],
        correctAnswer: 'Increased heart rate',
        explanation: 'Anxiety often causes physical symptoms like increased heart rate, sweating, and trembling.',
        points: 10,
        hints: ['Think about physical changes you might feel'],
      },
      {
        type: 'true-false',
        prompt: 'Anxiety is a sign of weakness.',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'Anxiety is a common mental health condition that many people experience.',
        points: 10,
        hints: [],
      },
      {
        type: 'multiple-choice',
        prompt: 'Which of these is a healthy coping strategy for anxiety?',
        options: ['Deep breathing exercises', 'Avoiding all situations', 'Over-caffeination', 'Ignoring the feelings'],
        correctAnswer: 'Deep breathing exercises',
        explanation: 'Deep breathing is a proven technique to calm the nervous system and reduce anxiety.',
        points: 10,
        hints: ['Think about what helps you relax'],
      },
    ];

    for (let i = 0; i < anxietyQuestions.length; i++) {
      await QuizQuestion.create({
        quizId: anxietyQuiz.id,
        sequence: i + 1,
        ...anxietyQuestions[i],
      });
    }

    anxietyQuiz.questionCount = anxietyQuestions.length;
    anxietyQuiz.totalPoints = anxietyQuestions.reduce((sum, q) => sum + q.points, 0);
    await anxietyQuiz.save();

    // Add questions to depression quiz
    const depressionQuestions = [
      {
        type: 'multiple-choice',
        prompt: 'How long do depressive episodes typically last?',
        options: ['A few hours', 'At least two weeks', 'One day exactly', 'Only in winter'],
        correctAnswer: 'At least two weeks',
        explanation: 'Clinical depression is characterized by persistent symptoms lasting at least two weeks.',
        points: 10,
        hints: [],
      },
      {
        type: 'multiple-choice',
        prompt: 'Which is a common sign of depression?',
        options: ['Loss of interest in activities', 'Increased energy', 'Racing thoughts', 'Extreme happiness'],
        correctAnswer: 'Loss of interest in activities',
        explanation: 'Anhedonia (loss of interest) is one of the core symptoms of depression.',
        points: 10,
        hints: ['Think about changes in motivation'],
      },
      {
        type: 'true-false',
        prompt: 'Depression is a normal part of everyday sadness.',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'Depression is a clinical condition distinct from normal sadness.',
        points: 10,
        hints: [],
      },
      {
        type: 'multiple-choice',
        prompt: 'When should someone seek professional help for depression?',
        options: ['If symptoms persist for 2+ weeks', 'Only in severe cases', 'Never without a friend', 'Only if asked'],
        correctAnswer: 'If symptoms persist for 2+ weeks',
        explanation: 'Professional help is recommended when depressive symptoms persist.',
        points: 10,
        hints: [],
      },
    ];

    for (let i = 0; i < depressionQuestions.length; i++) {
      await QuizQuestion.create({
        quizId: depressionQuiz.id,
        sequence: i + 1,
        ...depressionQuestions[i],
      });
    }

    depressionQuiz.questionCount = depressionQuestions.length;
    depressionQuiz.totalPoints = depressionQuestions.reduce((sum, q) => sum + q.points, 0);
    await depressionQuiz.save();

    // Add questions to social quiz
    const socialQuestions = [
      {
        type: 'multiple-choice',
        prompt: 'Can I maintain eye contact respectfully?',
        options: [
          'Yes, for 3-5 seconds then brief breaks',
          'Stare intensely at all times',
          'Never make eye contact',
          'Look at their forehead',
        ],
        correctAnswer: 'Yes, for 3-5 seconds then brief breaks',
        explanation: 'Natural eye contact shows engagement without being uncomfortable.',
        points: 10,
        hints: [],
      },
      {
        type: 'multiple-choice',
        prompt: 'What is a good first step in starting a conversation?',
        options: [
          'Ask a genuine question',
          'Talk about yourself for 10 minutes',
          'Stay silent to seem cool',
          'Interrupt others',
        ],
        correctAnswer: 'Ask a genuine question',
        explanation: 'Asking questions shows interest and helps build connections.',
        points: 10,
        hints: ['Think about what interests people'],
      },
      {
        type: 'true-false',
        prompt: 'Good listeners focus only on responding with their own stories.',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'Good listeners focus on understanding the other person first.',
        points: 10,
        hints: [],
      },
    ];

    for (let i = 0; i < socialQuestions.length; i++) {
      await QuizQuestion.create({
        quizId: socialQuiz.id,
        sequence: i + 1,
        ...socialQuestions[i],
      });
    }

    socialQuiz.questionCount = socialQuestions.length;
    socialQuiz.totalPoints = socialQuestions.reduce((sum, q) => sum + q.points, 0);
    await socialQuiz.save();

    console.log('✅ Quiz seeds created successfully');
    console.log(`   - Anxiety Quiz (${anxietyQuestions.length} questions)`);
    console.log(`   - Depression Quiz (${depressionQuestions.length} questions)`);
    console.log(`   - Social Skills Quiz (${socialQuestions.length} questions)`);
  } catch (error) {
    console.error('❌ Error seeding quizzes:', error);
    throw error;
  }
};

export default seedQuizzes;
