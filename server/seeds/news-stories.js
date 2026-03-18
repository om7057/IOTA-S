import { NewsStory, Topic } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';

export const seedNewsStories = async () => {
  try {
    console.log('🌟 Seeding news stories...');

    const newsStories = [
      {
        id: uuidv4(),
        title: 'Safe Choices',
        description: 'Learning to make safe decisions in everyday situations.',
        content: 'Understanding stranger danger and safe choices.',
        category: 'safety',
        sourceArticleTitle: 'Child Safety News: Stranger Awareness',
        sourceArticleUrl: 'https://example.com/safety',
        imageUrl: null,
        storyJson: {
          scenes: [
            {
              id: 0,
              title: 'The Park',
              text: 'You\'re at the park playing when someone you don\'t know approaches you with candy. What do you do?',
              image: '',
              options: [
                { text: 'Take the candy and go with them', to: 1 },
                { text: 'Politely decline and find a trusted adult', to: 2 }
              ]
            },
            {
              id: 1,
              title: 'Stranger Danger',
              text: 'Going with strangers can be unsafe. You should always check with a trusted adult first.',
              image: '',
              options: [
                { text: 'Try a different choice', to: 0 }
              ]
            },
            {
              id: 2,
              title: 'Smart Choice',
              text: 'Great decision! You found a trusted adult and stayed safe. Remember, it\'s always okay to say no.',
              image: '',
              options: []
            }
          ]
        },
        viewCount: 42,
        isPublished: true,
      },
      {
        id: uuidv4(),
        title: 'Online Safety Adventure',
        description: 'Learn to recognize and handle suspicious online activity.',
        content: 'Understanding online safety and digital citizenship.',
        category: 'safety',
        sourceArticleTitle: 'Cybersecurity for Children',
        sourceArticleUrl: 'https://example.com/online',
        imageUrl: null,
        storyJson: {
          scenes: [
            {
              id: 0,
              title: 'Online Message',
              text: 'Someone you don\'t know sends you a message online asking for your address and school name. What do you do?',
              image: '',
              options: [
                { text: 'Share your personal information', to: 1 },
                { text: 'Decline and tell a trusted adult', to: 2 }
              ]
            },
            {
              id: 1,
              title: 'Online Risk',
              text: 'Sharing personal information online with strangers is dangerous. Never do this!',
              image: '',
              options: [
                { text: 'Try again', to: 0 }
              ]
            },
            {
              id: 2,
              title: 'Safe Online Behavior',
              text: 'Perfect! You protected yourself and got help. Always tell a trusted adult about suspicious online messages.',
              image: '',
              options: []
            }
          ]
        },
        viewCount: 56,
        isPublished: true,
      },
      {
        id: uuidv4(),
        title: 'Boundary Champions',
        description: 'Understanding personal boundaries and bodily autonomy.',
        content: 'Learning about personal space and comfort zones.',
        category: 'education',
        sourceArticleTitle: 'Child Development: Teaching Boundaries',
        sourceArticleUrl: 'https://example.com/boundaries',
        imageUrl: null,
        storyJson: {
          scenes: [
            {
              id: 0,
              title: 'Uncomfortable Situation',
              text: 'Someone touches you in a way that makes you uncomfortable. What do you do?',
              image: '',
              options: [
                { text: 'Stay quiet and accept it', to: 1 },
                { text: 'Say NO and tell a trusted adult', to: 2 }
              ]
            },
            {
              id: 1,
              title: 'Your Rights',
              text: 'Your body is yours. You have the right to say no to unwanted touches.',
              image: '',
              options: [
                { text: 'Try again', to: 0 }
              ]
            },
            {
              id: 2,
              title: 'You\'re Protected',
              text: 'Excellent! Speaking up protects you. Your trusted adults are there to help.',
              image: '',
              options: []
            }
          ]
        },
        viewCount: 31,
        isPublished: true,
      }
    ];

    for (const story of newsStories) {
      const existingStory = await NewsStory.findOne({ where: { id: story.id } });
      
      if (!existingStory) {
        await NewsStory.create(story);
        console.log(`✅ Created story: ${story.title}`);
      } else {
        console.log(`⏭️  Story already exists: ${story.title}`);
      }
    }

    console.log('✨ News stories seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding news stories:', error);
  }
};
