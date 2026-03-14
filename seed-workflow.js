#!/usr/bin/env node

/**
 * Database Seeding Guide  
 * For populating Units, Lessons, and Challenges in IOTA-S
 * 
 * Usage:
 * 1. Set AUTH_TOKEN environment variable
 * 2. Run: node seed-workflow-data.js
 */

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'your-auth-token-here';

const headers = {
  'Authorization': `Bearer ${AUTH_TOKEN}`,
  'Content-Type': 'application/json',
};

/**
 * Example data structure for child safety topics
 */
const TOPICS = {
  'sexual-abuse': 'Sexual Abuse Awareness',
  'child-labour': 'Child Labour Prevention',
  'child-marriage': 'Child Marriage Prevention',
  'online-safety': 'Online Safety & Digital Literacy'
};

/**
 * Create a Unit
 */
async function createUnit(topicId, title, description, order) {
  try {
    const response = await fetch(`${API_URL}/units`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        topicId,
        title,
        description,
        order
      })
    });

    if (!response.ok) throw new Error(`Failed to create unit: ${response.statusText}`);
    
    const data = await response.json();
    console.log(`✓ Created Unit: ${title}`);
    return data.id;
  } catch (error) {
    console.error(`✗ Error creating unit "${title}":`, error.message);
    return null;
  }
}

/**
 * Create a Lesson
 */
async function createLesson(unitId, title, description, order) {
  try {
    const response = await fetch(`${API_URL}/lessons`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        unitId,
        title,
        description,
        order
      })
    });

    if (!response.ok) throw new Error(`Failed to create lesson: ${response.statusText}`);
    
    const data = await response.json();
    console.log(`  ✓ Created Lesson: ${title}`);
    return data.id;
  } catch (error) {
    console.error(`  ✗ Error creating lesson "${title}":`, error.message);
    return null;
  }
}

/**
 * Create a Challenge
 */
async function createChallenge(lessonId, question, type = 'SELECT', order) {
  try {
    const response = await fetch(`${API_URL}/challenges`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        lessonId,
        question,
        type,
        order
      })
    });

    if (!response.ok) throw new Error(`Failed to create challenge: ${response.statusText}`);
    
    const data = await response.json();
    console.log(`    ✓ Created Challenge: ${question.substring(0, 50)}...`);
    return data.id;
  } catch (error) {
    console.error(`    ✗ Error creating challenge:`, error.message);
    return null;
  }
}

/**
 * Create Challenge Options
 */
async function createChallengeOption(challengeId, text, correct, imageSrc = null) {
  try {
    const response = await fetch(`${API_URL}/challenge-options`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        challengeId,
        text,
        correct,
        imageSrc
      })
    });

    if (!response.ok) throw new Error(`Failed to create option: ${response.statusText}`);
    
    const data = await response.json();
    console.log(`      ✓ Option: ${text.substring(0, 40)}... [${correct ? 'CORRECT' : 'INCORRECT'}]`);
    return data.id;
  } catch (error) {
    console.error(`      ✗ Error creating option:`, error.message);
    return null;
  }
}

/**
 * Seed Sexual Abuse Awareness Unit
 */
async function seedSexualAbuseUnit(topicId) {
  console.log('\n📚 Seeding Sexual Abuse Awareness...');
  
  const unitId = await createUnit(
    topicId,
    'Understanding Body Autonomy',
    'Learn to recognize and respond to safe and unsafe touch',
    1
  );

  if (!unitId) return;

  // Lesson 1: Safe vs Unsafe Touch
  const lesson1Id = await createLesson(
    unitId,
    'Recognizing Safe and Unsafe Touch',
    'Identify boundaries and learn what safe touch looks like',
    1
  );

  if (lesson1Id) {
    const challenge1 = await createChallenge(
      lesson1Id,
      'Which of the following is considered SAFE touch?',
      'SELECT',
      1
    );

    if (challenge1) {
      await createChallengeOption(challenge1, 'A hug from a trusted family member', true);
      await createChallengeOption(challenge1, 'Someone touching your private parts without permission', false);
      await createChallengeOption(challenge1, 'A hand on your shoulder from a friend', true);
      await createChallengeOption(challenge1, 'Someone touching you in a way that makes you uncomfortable', false);
    }

    const challenge2 = await createChallenge(
      lesson1Id,
      'What should you do if someone touches you in a way that makes you uncomfortable?',
      'SELECT',
      2
    );

    if (challenge2) {
      await createChallengeOption(challenge2, 'Tell a trusted adult immediately', true);
      await createChallengeOption(challenge2, 'It\'s your fault, so keep quiet', false);
      await createChallengeOption(challenge2, 'Tell your friends but not adults', false);
      await createChallengeOption(challenge2, 'Run away from the situation', true);
    }
  }

  // Lesson 2: Trusted Adults
  const lesson2Id = await createLesson(
    unitId,
    'Identifying Trusted Adults',
    'Learn who you can talk to and trust with your concerns',
    2
  );

  if (lesson2Id) {
    const challenge3 = await createChallenge(
      lesson2Id,
      'Who are trusted adults you can talk to?',
      'SELECT',
      1
    );

    if (challenge3) {
      await createChallengeOption(challenge3, 'Parent or guardian', true);
      await createChallengeOption(challenge3, 'Teacher or school counselor', true);
      await createChallengeOption(challenge3, 'Stranger on the internet', false);
      await createChallengeOption(challenge3, 'Police officer', true);
      await createChallengeOption(challenge3, 'Someone who tells you to keep secrets', false);
    }
  }
}

/**
 * Seed Online Safety Unit
 */
async function seedOnlineSafetyUnit(topicId) {
  console.log('\n📱 Seeding Online Safety...');
  
  const unitId = await createUnit(
    topicId,
    'Digital Literacy & Online Safety',
    'Stay safe while using the internet and social media',
    1
  );

  if (!unitId) return;

  // Lesson 1: Stranger Danger Online
  const lesson1Id = await createLesson(
    unitId,
    'Recognizing Online Predators',
    'Identify warning signs of people trying to harm children online',
    1
  );

  if (lesson1Id) {
    const challenge1 = await createChallenge(
      lesson1Id,
      'A stranger online asks for your location and phone number. What should you do?',
      'SELECT',
      1
    );

    if (challenge1) {
      await createChallengeOption(challenge1, 'Never share this information with strangers online', true);
      await createChallengeOption(challenge1, 'Share it but add false information', false);
      await createChallengeOption(challenge1, 'Tell a trusted adult immediately', true);
      await createChallengeOption(challenge1, 'Share your location but not phone number', false);
    }

    const challenge2 = await createChallenge(
      lesson1Id,
      'Which is a warning sign that someone online might be dangerous?',
      'SELECT',
      2
    );

    if (challenge2) {
      await createChallengeOption(challenge2, 'They ask you to keep them a secret from parents', true);
      await createChallengeOption(challenge2, 'They want to meet you in person after just knowing you online', true);
      await createChallengeOption(challenge2, 'They ask for your personal information', true);
      await createChallengeOption(challenge2, 'They offer you things in exchange for photos', true);
    }
  }

  // Lesson 2: Password Security
  const lesson2Id = await createLesson(
    unitId,
    'Creating Strong Passwords',
    'Learn how to protect your accounts with secure passwords',
    2
  );

  if (lesson2Id) {
    const challenge3 = await createChallenge(
      lesson2Id,
      'Which is a STRONG password?',
      'SELECT',
      1
    );

    if (challenge3) {
      await createChallengeOption(challenge3, 'a1b2C3d4@xyz!Password', true);
      await createChallengeOption(challenge3, 'password123', false);
      await createChallengeOption(challenge3, 'MyName2010', false);
      await createChallengeOption(challenge3, 'xyz789', false);
    }
  }
}

/**
 * Main seeding function
 */
async function seed() {
  console.log('🌱 Starting IOTA-S Workflow Data Seeding');
  console.log(`API URL: ${API_URL}`);
  console.log('============================================');

  try {
    // Note: You'll need to get the actual topic IDs from your database first
    // This is a template - modify with real topic IDs
    
    // Get topics first (you may need to create these or fetch existing ones)
    console.log('\n📖 Note: Make sure these topics exist in your database:');
    Object.values(TOPICS).forEach(topic => {
      console.log(`  - ${topic}`);
    });

    console.log('\n💡 To use this seeding script:');
    console.log('1. First, create the topics via the API or admin panel');
    console.log('2. Get the topic IDs from your database');
    console.log('3. Update this script with the correct topic IDs');
    console.log('4. Run: AUTH_TOKEN="your-token" node seed-workflow.js');

    console.log('\n✅ Template has been saved. Modify and run to seed your data.');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

// Example of how to run with actual topic IDs:
// async function seedWithTopicIds() {
//   // First get/create topics
//   const topics = await fetch(`${API_URL}/topics`).then(r => r.json());
//   const sexualAbuseTopic = topics.find(t => t.name.includes('Sexual'));
//   const onlineSafetyTopic = topics.find(t => t.name.includes('Online'));
//
//   if (sexualAbuseTopic) {
//     await seedSexualAbuseUnit(sexualAbuseTopic.id);
//   }
//
//   if (onlineSafetyTopic) {
//     await seedOnlineSafetyUnit(onlineSafetyTopic.id);
//   }
// }

// Run the seeding
if (require.main === module) {
  seed().catch(console.error);
}

module.exports = {
  createUnit,
  createLesson,
  createChallenge,
  createChallengeOption,
  seedSexualAbuseUnit,
  seedOnlineSafetyUnit
};
