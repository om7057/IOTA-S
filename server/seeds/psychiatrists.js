import { Psychiatrist } from '../models/index.js';

/**
 * Seed psychiatrists data
 * Adds Dr. Nilima and other psychiatrists to the database
 */
export async function seedPsychiatrists() {
  try {
    // Check if psychiatrists already exist
    const existingCount = await Psychiatrist.count();
    if (existingCount > 0) {
      console.log('✓ Psychiatrists already seeded');
      return;
    }

    const psychiatrists = [
      {
        firstName: 'Nilima',
        lastName: 'Sharma',
        specialization: 'Adolescent Psychology & Anxiety Disorders',
        bio: 'Dr. Nilima Sharma specializes in teenage anxiety, depression, and emotional well-being. With 15+ years of experience working with teens, she creates a safe, judgment-free space for open conversations.',
        avatarUrl: 'https://ui-avatars.com/api/?name=Nilima+Sharma&background=6366f1&color=fff&bold=true&size=200',
        rating: 4.8,
        isAvailable: true,
      },
      {
        firstName: 'Rajesh',
        lastName: 'Patel',
        specialization: 'Stress & Academic Pressure',
        bio: 'Dr. Rajesh specializes in helping teens manage academic stress and performance anxiety. He uses evidence-based techniques to build resilience and coping strategies.',
        avatarUrl: 'https://ui-avatars.com/api/?name=Rajesh+Patel&background=8b5cf6&color=fff&bold=true&size=200',
        rating: 4.7,
        isAvailable: true,
      },
      {
        firstName: 'Priya',
        lastName: 'Verma',
        specialization: 'Family & Relationship Dynamics',
        bio: 'Dr. Priya helps teens navigate family conflicts, peer relationships, and identity issues. She believes in empowering teens to communicate effectively.',
        avatarUrl: 'https://ui-avatars.com/api/?name=Priya+Verma&background=ec4899&color=fff&bold=true&size=200',
        rating: 4.6,
        isAvailable: true,
      },
      {
        firstName: 'Arjun',
        lastName: 'Singh',
        specialization: 'Digital Wellness & Online Safety',
        bio: 'Dr. Arjun focuses on helping teens develop healthy relationships with technology and navigate the challenges of social media and cyberbullying.',
        avatarUrl: 'https://ui-avatars.com/api/?name=Arjun+Singh&background=06b6d4&color=fff&bold=true&size=200',
        rating: 4.5,
        isAvailable: true,
      },
    ];

    await Psychiatrist.bulkCreate(psychiatrists);
    console.log('✓ Psychiatrists seeded successfully');
    console.log(`  - Dr. Nilima Sharma (Adolescent Psychology)`);
    console.log(`  - Dr. Rajesh Patel (Stress & Academic Pressure)`);
    console.log(`  - Dr. Priya Verma (Family & Relationships)`);
    console.log(`  - Dr. Arjun Singh (Digital Wellness)`);
  } catch (error) {
    console.error('✗ Error seeding psychiatrists:', error.message);
    throw error;
  }
}

export default seedPsychiatrists;
