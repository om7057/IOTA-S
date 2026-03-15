import { Group, GroupMember, Discussion, DiscussionReply, User } from '../models/index.js';

/**
 * Seed groups and discussions with sample data
 */
export const seedGroups = async () => {
  try {
    // Check if groups already exist
    const existingCount = await Group.count();
    if (existingCount > 0) {
      console.log('✅ Groups already seeded, skipping...');
      return;
    }

    // Get or create test user for seeding
    const testUser = await User.findOne({ where: { email: 'test@example.com' } }) || 
      await User.create({
        username: 'test_user',
        email: 'test@example.com',
        password: 'hashed_password',
        age: 16,
      });

    // Create sample groups
    const mentalHealthGroup = await Group.create({
      name: 'Mental Health Support',
      description: 'A safe space to discuss mental health, anxiety, depression, and wellness',
      creatorId: testUser.id,
      type: 'public',
      category: 'mental-health',
      icon: '🧠',
      memberCount: 1,
      lastActivityAt: new Date(),
    });

    const studyGroup = await Group.create({
      name: 'Study Buddies',
      description: 'Connect with peers for academic support and study sessions',
      creatorId: testUser.id,
      type: 'public',
      category: 'academic',
      icon: '📚',
      memberCount: 1,
      lastActivityAt: new Date(),
    });

    const hobbiesGroup = await Group.create({
      name: 'Creative Arts',
      description: 'Share artwork, music, writing, and creative projects',
      creatorId: testUser.id,
      type: 'public',
      category: 'hobbies',
      icon: '🎨',
      memberCount: 1,
      lastActivityAt: new Date(),
    });

    const techGroup = await Group.create({
      name: 'Tech Enthusiasts',
      description: 'Discuss technology, coding, and innovation',
      creatorId: testUser.id,
      type: 'public',
      category: 'academic',
      icon: '💻',
      memberCount: 1,
      lastActivityAt: new Date(),
    });

    // Add test user as owner to all groups
    for (const group of [mentalHealthGroup, studyGroup, hobbiesGroup, techGroup]) {
      await GroupMember.create({
        groupId: group.id,
        userId: testUser.id,
        role: 'owner',
      });
    }

    // Create sample discussions
    const mentalHealthDiscussions = [
      {
        groupId: mentalHealthGroup.id,
        creatorId: testUser.id,
        title: 'Coping Strategies for Anxiety',
        content: 'What strategies have helped you manage anxiety? I\'ve been trying deep breathing and journaling.',
        tags: ['anxiety', 'coping', 'wellness'],
      },
      {
        groupId: mentalHealthGroup.id,
        creatorId: testUser.id,
        title: 'Support for Depression',
        content: 'Depression can feel isolating. Let\'s share what helps us get through tough days.',
        tags: ['depression', 'support', 'wellness'],
      },
    ];

    const academicDiscussions = [
      {
        groupId: studyGroup.id,
        creatorId: testUser.id,
        title: 'Best Study Techniques',
        content: 'Share your most effective study methods and time management tips',
        tags: ['study', 'tips', 'learning'],
      },
      {
        groupId: techGroup.id,
        creatorId: testUser.id,
        title: 'Getting Started with Coding',
        content: 'What resources helped you learn to code? Any recommendations for beginners?',
        tags: ['coding', 'programming', 'beginner'],
      },
    ];

    const hobbyDiscussions = [
      {
        groupId: hobbiesGroup.id,
        creatorId: testUser.id,
        title: 'Showcase Your Art',
        content: 'Post your creative work and give feedback to others',
        tags: ['art', 'creative', 'showcase'],
        isPinned: true,
      },
    ];

    const allDiscussions = [...mentalHealthDiscussions, ...academicDiscussions, ...hobbyDiscussions];
    const createdDiscussions = [];

    for (const discData of allDiscussions) {
      const discussion = await Discussion.create(discData);
      createdDiscussions.push(discussion);
    }

    // Create sample replies
    if (createdDiscussions.length > 0) {
      const firstDiscussion = createdDiscussions[0];
      
      await DiscussionReply.create({
        discussionId: firstDiscussion.id,
        creatorId: testUser.id,
        content: 'I find that taking walks really helps me manage my anxiety. Fresh air and movement make a big difference.',
      });

      await DiscussionReply.create({
        discussionId: firstDiscussion.id,
        creatorId: testUser.id,
        content: 'Meditation apps like Calm have been game-changers for me. They guide you through techniques that actually work.',
      });
    }

    console.log('✅ Group seeds created successfully');
    console.log(`   - Mental Health Support group (${mentalHealthGroup.id})`);
    console.log(`   - Study Buddies group (${studyGroup.id})`);
    console.log(`   - Creative Arts group (${hobbiesGroup.id})`);
    console.log(`   - Tech Enthusiasts group (${techGroup.id})`);
    console.log(`   - ${allDiscussions.length} sample discussions created`);
    console.log(`   - Sample replies created for discussions`);
  } catch (error) {
    console.error('❌ Error seeding groups:', error);
    throw error;
  }
};

export default seedGroups;
