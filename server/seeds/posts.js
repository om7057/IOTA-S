import { Post, User } from '../models/index.js';

/**
 * Seed social feed posts with common teen mental health topics
 * Posts are marked as anonymous for privacy and safety
 */
export const seedPosts = async () => {
  try {
    // Check if posts already exist
    const existingCount = await Post.count();
    if (existingCount > 0) {
      console.log('✅ Posts already seeded, skipping...');
      return;
    }

    console.log('🌱 Seeding social feed posts...');

    // Create or get test users for seeding
    const users = [];
    for (let i = 1; i <= 3; i++) {
      const user = await User.findOne({ 
        where: { email: `teen${i}@example.com` } 
      }) || await User.create({
        username: `teen_user_${i}`,
        email: `teen${i}@example.com`,
        password: 'hashed_password',
        age: 15 + i,
      });
      users.push(user);
    }

    // Get or create default test user
    const testUser = await User.findOne({ 
      where: { email: 'test@example.com' } 
    }) || await User.create({
      username: 'test_user',
      email: 'test@example.com',
      password: 'hashed_password',
      age: 16,
    });

    // Anonymous names for posts (auto-generated style)
    const anonymousNames = [
      'Teen#7432', 'Teen#5891', 'Teen#2014', 'Teen#8765',
      'Teen#4321', 'Teen#9876', 'Teen#1234', 'Teen#5678',
      'Teen#3456', 'Teen#7890', 'Teen#2468', 'Teen#1357'
    ];

    const postsData = [
      {
        userId: users[0].id,
        title: 'I feel like I\'m falling behind in life',
        content: 'Everyone around me seems to have things figured out — studies, friendships, goals… and I\'m just here trying to get through the day.\nI don\'t even know what I\'m stressed about anymore, it\'s just constant.\n\nDoes anyone else feel like this? How do you deal with it?',
        category: 'advice',
        sentiment: 'negative',
        isAnonymous: true,
        anonymousName: anonymousNames[0],
      },
      {
        userId: users[1].id,
        title: 'Is it normal to feel this scared about exams?',
        content: 'Exams are coming up and I literally can\'t focus. I sit down to study and just panic.\nIt feels like my whole future depends on this and I\'m not ready at all.\n\nHow do you guys handle exam anxiety?',
        category: 'question',
        sentiment: 'negative',
        isAnonymous: true,
        anonymousName: anonymousNames[1],
      },
      {
        userId: users[2].id,
        title: 'My friends only talk to me when they need something',
        content: 'I\'ve noticed that my "friends" only text me when they need help with assignments or notes.\nOtherwise, I\'m invisible.\n\nAm I overthinking this or is this actually a problem?',
        category: 'advice',
        sentiment: 'negative',
        isAnonymous: true,
        anonymousName: anonymousNames[2],
      },
      {
        userId: users[0].id,
        title: 'I feel alone even when I\'m around people',
        content: 'I go to school, talk to people, even laugh sometimes… but inside I just feel empty.\nIt\'s like no one actually knows me.\n\nIs this normal or am I just weird?',
        category: 'advice',
        sentiment: 'negative',
        isAnonymous: true,
        anonymousName: anonymousNames[3],
      },
      {
        userId: users[1].id,
        title: 'Social media is making me hate myself',
        content: 'Every time I scroll, I feel worse about my life. Everyone looks perfect and happy.\nI know it\'s fake… but it still affects me.\n\nHas anyone successfully taken a break from social media?',
        category: 'question',
        sentiment: 'negative',
        isAnonymous: true,
        anonymousName: anonymousNames[4],
      },
      {
        userId: users[2].id,
        title: 'Why is it so hard to talk to parents about feelings?',
        content: 'I want to open up to my parents but I feel like they won\'t understand or will judge me.\nSo I just keep everything inside.\n\nHow do you even start that conversation?',
        category: 'question',
        sentiment: 'neutral',
        isAnonymous: true,
        anonymousName: anonymousNames[5],
      },
      {
        userId: users[0].id,
        title: 'How do you move on from someone you still care about?',
        content: 'We stopped talking but I still think about them every day.\nI know it\'s over but my brain just doesn\'t accept it.\n\nAny advice on how to actually move on?',
        category: 'story',
        sentiment: 'negative',
        isAnonymous: true,
        anonymousName: anonymousNames[6],
      },
      {
        userId: users[1].id,
        title: 'I\'m tired all the time but doing nothing',
        content: 'I\'m not even working that hard but I feel exhausted mentally.\nEven simple things feel like too much.\n\nIs this burnout? What helps?',
        category: 'question',
        sentiment: 'negative',
        isAnonymous: true,
        anonymousName: anonymousNames[7],
      },
      {
        userId: users[2].id,
        title: 'My brain won\'t shut up',
        content: 'I replay conversations, imagine worst-case scenarios, and overthink everything.\nIt\'s honestly exhausting.\n\nHow do you stop overthinking?',
        category: 'advice',
        sentiment: 'negative',
        isAnonymous: true,
        anonymousName: anonymousNames[8],
      },
      {
        userId: users[0].id,
        title: 'I think I might need help but I don\'t know where to start',
        content: 'Lately things haven\'t been okay and I feel like I should talk to someone.\nBut I don\'t know if it\'s "serious enough" to reach out.\n\nHow do you know when to ask for help?',
        category: 'question',
        sentiment: 'neutral',
        isAnonymous: true,
        anonymousName: anonymousNames[9],
      },
      {
        userId: users[1].id,
        title: 'Small win today :)',
        content: 'I finally got out of bed on time and finished one task I\'ve been avoiding.\nIt\'s small, but it felt really good.\n\nJust wanted to share — maybe things do get better step by step.',
        category: 'achievement',
        sentiment: 'positive',
        isAnonymous: true,
        anonymousName: anonymousNames[10],
      },
      {
        userId: users[2].id,
        title: 'I pretend to be okay but I\'m not',
        content: 'Everyone thinks I\'m doing fine because I joke around and act normal.\nBut honestly, I\'m struggling a lot inside.\n\nI just don\'t know how to say it out loud.',
        category: 'story',
        sentiment: 'negative',
        isAnonymous: true,
        anonymousName: anonymousNames[11],
      },
    ];

    // Create all posts
    const createdPosts = await Post.bulkCreate(postsData);
    console.log(`✅ Created ${createdPosts.length} seed posts`);

  } catch (error) {
    console.error('❌ Failed to seed posts:', error.message);
    throw error;
  }
};
