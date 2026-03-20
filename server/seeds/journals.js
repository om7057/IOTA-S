import { Journal, User } from '../models/index.js';

/**
 * Seed journal entries with authentic teen emotional reflections
 * Entries capture real teen mental health experiences and self-reflection
 */
export const seedJournals = async () => {
  try {
    // Check if journals already exist
    const existingCount = await Journal.count();
    if (existingCount > 0) {
      console.log('✅ Journals already seeded, skipping...');
      return;
    }

    console.log('🌱 Seeding journal entries...');

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

    const journalEntries = [
      {
        userId: users[0].id,
        title: 'My mind won\'t slow down',
        content: 'Today felt exhausting, even though I didn\'t do much physically.\nMy thoughts just kept running non-stop — replaying conversations, worrying about things that haven\'t even happened.\n\nI wish I could just switch my brain off for a while.',
        emotion: 'anxious',
        tags: ['worried', 'school'],
        isPrivate: true,
      },
      {
        userId: users[1].id,
        title: 'I tried to study but couldn\'t focus',
        content: 'I sat down with my books for hours, but nothing really went in.\nI kept getting distracted or just staring at the same page.\n\nIt makes me feel guilty, like I\'m wasting time.',
        emotion: 'stressed',
        tags: ['homework', 'school'],
        isPrivate: true,
      },
      {
        userId: users[2].id,
        title: 'Not sure about my friendships',
        content: 'I don\'t know if I\'m overthinking, but I feel like I\'m not really important to my friends.\nSometimes I feel like I\'m just there… not actually included.\n\nI wish I had someone I could talk to without feeling weird.',
        emotion: 'sad',
        tags: ['friends'],
        isPrivate: true,
      },
      {
        userId: users[0].id,
        title: 'Alone even in a crowd',
        content: 'I was around people all day, but still felt completely alone.\nIt\'s strange how you can be surrounded by others and still feel invisible.\n\nI don\'t know how to explain this feeling to anyone.',
        emotion: 'sad',
        tags: ['friends'],
        isPrivate: true,
      },
      {
        userId: users[1].id,
        title: 'No energy today',
        content: 'I didn\'t feel like doing anything today. Even small tasks felt too much.\nI just wanted to stay in bed and avoid everything.\n\nI hope tomorrow feels a little better.',
        emotion: 'anxious',
        tags: ['worried'],
        isPrivate: true,
      },
      {
        userId: users[2].id,
        title: 'Something they said stayed with me',
        content: 'Someone said something casually today, but it stuck with me more than it should have.\nI keep replaying it in my head and wondering if they meant it.\n\nMaybe I\'m just sensitive… but it still hurts.',
        emotion: 'sad',
        tags: ['friends'],
        isPrivate: true,
      },
      {
        userId: users[0].id,
        title: 'Scrolling made me feel worse',
        content: 'I spent a lot of time on social media today, and honestly, it just made me feel worse about myself.\nEveryone seems so perfect and happy.\n\nI know it\'s not real, but it still affects me.',
        emotion: 'anxious',
        tags: ['worried'],
        isPrivate: true,
      },
      {
        userId: users[1].id,
        title: 'I kept everything inside again',
        content: 'I wanted to talk about how I felt today, but I didn\'t.\nI just smiled and acted normal like always.\n\nI don\'t know why it\'s so hard to open up.',
        emotion: 'confused',
        tags: ['family'],
        isPrivate: true,
      },
      {
        userId: users[2].id,
        title: 'Maybe I need help',
        content: 'I\'ve been feeling off for a while now, and I think I shouldn\'t ignore it anymore.\nMaybe talking to someone could actually help.\n\nIt\'s scary, but I think I should try.',
        emotion: 'neutral',
        tags: ['worried'],
        isPrivate: true,
      },
      {
        userId: users[0].id,
        title: 'A small win today',
        content: 'I actually completed something I had been avoiding for days.\nIt wasn\'t a big task, but it felt good to finally do it.\n\nMaybe progress doesn\'t have to be huge.',
        emotion: 'calm',
        tags: ['learning'],
        isPrivate: true,
      },
      {
        userId: users[1].id,
        title: 'Trying to understand myself',
        content: 'I\'ve been thinking a lot about who I am and what I want.\nSometimes I feel like I don\'t even know myself properly.\n\nMaybe that\'s okay… maybe I\'m still figuring things out.',
        emotion: 'calm',
        tags: ['learning'],
        isPrivate: true,
      },
      {
        userId: users[2].id,
        title: 'Felt really anxious today',
        content: 'My heart was racing for no clear reason today.\nEven small things felt overwhelming.\n\nI tried to calm down, but it took a while.',
        emotion: 'anxious',
        tags: ['worried'],
        isPrivate: true,
      },
    ];

    // Create all journal entries
    const createdJournals = await Journal.bulkCreate(journalEntries);
    console.log(`✅ Created ${createdJournals.length} seed journal entries`);

  } catch (error) {
    console.error('❌ Failed to seed journals:', error.message);
    throw error;
  }
};
