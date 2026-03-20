import {
  ChildrenCourse,
  ChildrenUnit,
  ChildrenLesson,
  ChildrenChallenge,
  ChildrenChallengeOption,
  ChildrenProgress,
  ChildrenChallengeProgress,
} from '../models/index.js';
import { logger } from '../utils/logger.js';

const createBranchingLesson = async ({
  unitId,
  title,
  description,
  content,
  imageSrc,
  order,
  duration,
  nodes,
}) => {
  const lesson = await ChildrenLesson.create({
    unitId,
    title,
    description,
    content,
    imageSrc,
    icon: 'STORY',
    order,
    duration,
    isPublished: true,
  });

  const challengeByKey = {};

  // Pass 1: create all nodes so we can resolve nextChallengeId references.
  for (const node of nodes) {
    const challenge = await ChildrenChallenge.create({
      lessonId: lesson.id,
      type: 'SELECT',
      isStoryNode: true,
      question: node.question,
      hint: node.hint,
      imageSrc: node.imageSrc,
      storyContextImage: node.imageSrc,
      order: node.order,
      difficulty: 'easy',
      isPublished: true,
    });

    challengeByKey[node.key] = challenge;
  }

  // Pass 2: create options with next-node links.
  for (const node of nodes) {
    const challenge = challengeByKey[node.key];
    for (const option of node.options) {
      await ChildrenChallengeOption.create({
        challengeId: challenge.id,
        text: option.text,
        correct: option.correct,
        imageSrc: option.imageSrc,
        feedback: option.feedback,
        nextChallengeId: option.nextKey ? challengeByKey[option.nextKey]?.id || null : null,
        order: option.order,
      });
    }
  }

  return lesson;
};

export const seedChildrenCourses = async () => {
  try {
    logger.info('Seeding children courses with interactive branching stories...');

    // Deterministic seed reset
    await ChildrenChallengeOption.destroy({ where: {}, force: true });
    await ChildrenChallenge.destroy({ where: {}, force: true });
    await ChildrenLesson.destroy({ where: {}, force: true });
    await ChildrenUnit.destroy({ where: {}, force: true });
    await ChildrenChallengeProgress.destroy({ where: {}, force: true });
    await ChildrenProgress.destroy({ where: {}, force: true });
    await ChildrenCourse.destroy({ where: {}, force: true });

    // ==================== COURSE 1: Sexual Abuse Awareness ====================
    const sexualAbuseCourse = await ChildrenCourse.create({
      title: 'Sexual Abuse Awareness',
      description: 'Learn trusted-adult rules and body safety through interactive story choices.',
      imageSrc: '/child_abuse.svg',
      icon: 'SAFE',
      ageGroup: '8-10',
      category: 'body-safety',
      difficulty: 'beginner',
      isPublished: true,
      order: 1,
    });

    const sexualAbuseUnit = await ChildrenUnit.create({
      courseId: sexualAbuseCourse.id,
      title: 'Trusted Adults and Safety',
      description: 'Interactive story for safe decisions with strangers and adults.',
      icon: 'UNIT',
      order: 1,
      isPublished: true,
    });

    await createBranchingLesson({
      unitId: sexualAbuseUnit.id,
      title: 'Arav and the Stranger Offer - Complete Story',
      description: 'A complete interactive story showing safe choices and their outcomes.',
      content:
        'Arav is 9 years old. Today after school, someone he does not know approaches him with an offer to go home in their car. Follow Arav\'s journey through different scenarios as he learns about safety and trusted adults.',
      imageSrc: '/a1.jpg',
      order: 1,
      duration: 12,
      nodes: [
        // Scene 1: Initial Contact - The Stranger Approach
        {
          key: 'a1_school_exit',
          order: 1,
          imageSrc: '/a1.jpg',
          question: 'SCENE 1: School Exit - A man approaches Arav at the gate.\n\nThe stranger says: "Hi Arav! Your mom is busy at work. She asked me to pick you up. We\'ll grab ice cream on the way home!" Arav has never seen this person before. What should Arav do?',
          hint: 'You don\'t know this person. Always verify with parents first.',
          options: [
            {
              order: 1,
              text: 'Say "NO, I don\'t know you. I\'ll wait for my parents."',
              imageSrc: '/yes.png',
              correct: true,
              nextKey: 'a2_safe_choice_correct',
              feedback: 'CORRECT! You recognized an unsafe situation. Saying NO clearly is powerful.',
            },
            {
              order: 2,
              text: 'Get in the car - the man seems friendly',
              imageSrc: '/no.png',
              correct: false,
              nextKey: 'a2_unsafe_path_consequence',
              feedback: 'RISKY! Friendly strangers can still be dangerous. See what happens next.',
            },
            {
              order: 3,
              text: 'Ask the man questions to verify he knows your parents',
              imageSrc: '/no.png',
              correct: false,
              nextKey: 'a2_verify_attempt',
              feedback: 'Partial credit. Asking is better than going silently, but it\'s not safe to engage with strangers alone.',
            },
          ],
        },

        // Scene 2a: Safe Path - After Saying No
        {
          key: 'a2_safe_choice_correct',
          order: 2,
          imageSrc: '/a2.jpg',
          question: 'SCENE 2 - SAFE PATH: Arav said NO clearly!\n\nThe stranger leaves. Arav feels proud and safe. His friend Priya is still at school too. What is Arav\'s best next step?',
          hint: 'Stay with authority figures until parents arrive.',
          options: [
            {
              order: 1,
              text: 'Go back inside and tell a teacher what happened',
              imageSrc: '/yes.png',
              correct: true,
              nextKey: 'a3_adult_support',
              feedback: 'EXCELLENT! Telling trusted adults protects you and other children.',
            },
            {
              order: 2,
              text: 'Wait alone outside the gate for parents',
              imageSrc: '/no.png',
              correct: false,
              nextKey: 'a2_alone_outside',
              feedback: 'Not ideal. School adults are there to help. Going inside is safer.',
            },
            {
              order: 3,
              text: 'Leave the school area and walk home alone',
              imageSrc: '/no.png',
              correct: false,
              nextKey: 'a2_walk_alone_risk',
              feedback: 'Risky! Walking alone makes you vulnerable. Stay at school.',
            },
          ],
        },

        // Scene 2b: Consequence Path - After Getting in Car
        {
          key: 'a2_unsafe_path_consequence',
          order: 2,
          imageSrc: '/a2.jpg',
          question: 'SCENE 2 - UNSAFE PATH: Arav got in the car.\n\nBut instead of ice cream, the man drives to an unfamiliar place. Arav realizes this is NOT his home. He feels scared and trapped. What should Arav do RIGHT NOW?',
          hint: 'Trust your instincts. Get to safety and tell adults immediately.',
          options: [
            {
              order: 1,
              text: 'Open the door and run to a crowded place. Shout for help.',
              imageSrc: '/yes.png',
              correct: true,
              nextKey: 'a3_escape_and_report',
              feedback: 'BRAVE! This is the right action. Getting away and calling for help saves lives.',
            },
            {
              order: 2,
              text: 'Stay quiet and hope the man drives home eventually',
              imageSrc: '/no.png',
              correct: false,
              nextKey: 'a2_danger_intensifies',
              feedback: 'DANGER! Staying silent gives the person control. Never stay quiet when unsafe.',
            },
            {
              order: 3,
              text: 'Ask the man where you\'re going',
              imageSrc: '/no.png',
              correct: false,
              nextKey: 'a2_danger_intensifies',
              feedback: 'Not enough. When something feels wrong, ACT to get to safety, not talk.',
            },
          ],
        },

        // Scene 2c: Verification Attempt (Shows why it doesn't work)
        {
          key: 'a2_verify_attempt',
          order: 2,
          imageSrc: '/a2.jpg',
          question: 'SCENE 2 - VERIFICATION ATTEMPT: Arav asked questions.\n\nThe man said, "I know your mom\'s name is Priya and you love chocolate ice cream!" (He got this from social media). Arav feels confused - is it safe? What should he do?',
          hint: 'Strangers can find information online. Personal details don\'t mean safety.',
          options: [
            {
              order: 1,
              text: 'Still say NO. Go back inside the school to tell a teacher.',
              imageSrc: '/yes.png',
              correct: true,
              nextKey: 'a3_adult_support',
              feedback: 'PERFECT! You realized that having details doesn\'t mean someone is safe. Good instinct!',
            },
            {
              order: 2,
              text: 'Now trust him and get in the car',
              imageSrc: '/no.png',
              correct: false,
              nextKey: 'a2_unsafe_path_consequence',
              feedback: 'Risky! Information from social media doesn\'t prove someone is trustworthy.',
            },
          ],
        },

        // Scene 3: Adult Support & Reporting
        {
          key: 'a3_adult_support',
          order: 3,
          imageSrc: '/a3.jpg',
          question: 'SCENE 3 - WITH TRUSTED ADULTS: Arav told his teacher about the stranger.\n\nThe teacher:\n• Called his parents immediately\n• Reported to school security\n• Made sure Arav felt safe\n\nWhat happens next?',
          hint: 'Adults take over protecting you. Your job is to tell.',
          options: [
            {
              order: 1,
              text: 'Parents pick up Arav. Police are contacted to protect other children.',
              imageSrc: '/yes.png',
              correct: true,
              nextKey: 'a4_learning_moment',
              feedback: 'YES! Reporting protects everyone. Adults handle the situation now.',
            },
            {
              order: 2,
              text: 'The teacher tells Arav to forget about it',
              imageSrc: '/no.png',
              correct: false,
              nextKey: 'a3_adult_support',
              feedback: 'Real teachers never dismiss safety concerns. They take action.',
            },
          ],
        },

        // Scene 3b: Escape & Report Path
        {
          key: 'a3_escape_and_report',
          order: 3,
          imageSrc: '/a3.jpg',
          question: 'SCENE 3 - ESCAPE SUCCESSFUL: Arav ran away and found a shopkeeper!\n\nArav told him, "That man took me in his car to a strange place. I don\'t know him." The shopkeeper:\n• Called police\n• Called school to identify parents\n• Kept Arav safe\n\nWhat does Arav learn from this?',
          hint: 'Not all adults are dangerous. You can trust shopkeepers, police, teachers, parents.',
          options: [
            {
              order: 1,
              text: 'Trust authority figures (police, shopkeepers, teachers) when in danger',
              imageSrc: '/yes.png',
              correct: true,
              nextKey: 'a4_learning_moment',
              feedback: 'CORRECT! Recognizing safe adults anywhere can save you.',
            },
          ],
        },

        // Scene 2d: Intensified Danger Path (Educational consequences)
        {
          key: 'a2_danger_intensifies',
          order: 2,
          imageSrc: '/a2.jpg',
          question: 'SCENE 2 - DANGER ESCALATES: Arav stayed quiet. Now the situation is worse.\n\nThe man is driving Arav farther away. Arav realizes he should have acted earlier. What can he do NOW?',
          hint: 'It\'s never too late to get help. Do something NOW.',
          options: [
            {
              order: 1,
              text: 'Unbuckle seatbelt, open door at traffic light, RUN to a police officer or crowd',
              imageSrc: '/yes.png',
              correct: true,
              nextKey: 'a3_escape_and_report',
              feedback: 'GOOD! Even in bad situations, you can escape. Act immediately. Every second counts.',
            },
          ],
        },

        // Scene 2e: Alone Outside (Less Safe)
        {
          key: 'a2_alone_outside',
          order: 2,
          imageSrc: '/a2.jpg',
          question: 'SCENE 2 - ALONE OUTSIDE: Arav waited alone at the gate.\n\nAfter 10 minutes, another unfamiliar person approaches and offers a ride. Arav realizes being alone was risky. What should he do?',
          hint: 'Return to the safe adult space immediately.',
          options: [
            {
              order: 1,
              text: 'Say NO and run back inside the school to tell a teacher',
              imageSrc: '/yes.png',
              correct: true,
              nextKey: 'a3_adult_support',
              feedback: 'CORRECT! This shows why staying with adults is safer than waiting alone.',
            },
          ],
        },

        // Scene 2f: Walk Alone Risk
        {
          key: 'a2_walk_alone_risk',
          order: 2,
          imageSrc: '/a2.jpg',
          question: 'SCENE 2 - WALKING ALONE: Arav walked home alone.\n\nHalf-way home, someone calls to him from a car and offers a ride. Arav is already tired and alone. What should he do?',
          hint: 'Repeat the safety rule: Say NO to strangers.',
          options: [
            {
              order: 1,
              text: 'Say NO firmly and keep walking to home or a nearby safe place',
              imageSrc: '/yes.png',
              correct: true,
              nextKey: 'a4_learning_moment',
              feedback: 'RIGHT! Even when tired, safety comes first. Keep walking.',
            },
            {
              order: 2,
              text: 'Get in the car to rest',
              imageSrc: '/no.png',
              correct: false,
              nextKey: 'a2_unsafe_path_consequence',
              feedback: 'Never trade comfort for safety. That\'s how dangers happen.',
            },
          ],
        },

        // Scene 4: Key Learning Moment
        {
          key: 'a4_learning_moment',
          order: 4,
          imageSrc: '/a4.jpg',
          question: 'SCENE 4 - KEY LESSONS: Arav is safe now.\n\nHis parents and a counselor help him understand what happened. What are the THREE MOST IMPORTANT SAFETY RULES for children?',
          hint: 'NO to strangers. YES to trusted adults. Tell immediately when unsafe.',
          options: [
            {
              order: 1,
              text: '"NO" to offers from people you don\'t know, even if friendly',
              imageSrc: '/yes.png',
              correct: true,
              nextKey: 'a5_body_safety',
              feedback: 'RULE 1: CORRECT! Strangers can seem nice but still be dangerous.',
            },
            {
              order: 2,
              text: 'Always trust "friendly strangers" because they seem nice',
              imageSrc: '/no.png',
              correct: false,
              nextKey: 'a5_body_safety',
              feedback: 'WRONG! Never use niceness as a safety measure.',
            },
          ],
        },

        // Scene 5: Body Safety & Boundaries
        {
          key: 'a5_body_safety',
          order: 5,
          imageSrc: '/a5.jpg',
          question: 'SCENE 5 - BODY SAFETY: Arav learned about personal boundaries too.\n\nIf any adult tells Arav to keep secrets about touching, or makes him uncomfortable by touching private body parts, what should he do?',
          hint: 'Your body belongs to you. Tell a safe adult immediately.',
          options: [
            {
              order: 1,
              text: 'Say NO firmly and tell a trusted adult (parent, teacher) immediately',
              imageSrc: '/yes.png',
              correct: true,
              nextKey: 'a6_emergency_contacts',
              feedback: 'PERFECT! Your body is YOUR CHOICE. Others cannot make you uncomfortable.',
            },
            {
              order: 2,
              text: 'Keep it secret because the adult said so',
              imageSrc: '/no.png',
              correct: false,
              nextKey: 'a5_body_safety',
              feedback: 'NEVER! Safe adults never ask children to keep secrets about body safety.',
            },
            {
              order: 3,
              text: 'Feel ashamed and stay silent',
              imageSrc: '/no.png',
              correct: false,
              nextKey: 'a5_body_safety',
              feedback: 'WRONG! This is never your fault. Tell immediately.',
            },
          ],
        },

        // Scene 6: Emergency Resources
        {
          key: 'a6_emergency_contacts',
          order: 6,
          imageSrc: '/a6.jpg',
          question: 'SCENE 6 - EMERGENCY RESOURCES: Arav now knows who to call in emergencies!\n\nWhich number should children in India call if they are unsafe, hurt, or being abused?',
          hint: 'This is India\'s official child helpline. Trained counselors answer 24/7.',
          options: [
            {
              order: 1,
              text: '1098 - Child Helpline (Free, Anonymous, 24/7)',
              imageSrc: '/yes.png',
              correct: true,
              nextKey: 'a6_completion',
              feedback: 'EXCELLENT! 1098 is always there. You can also call 100 (Police) or 108 (Ambulance).',
            },
            {
              order: 2,
              text: '1099 - Random number',
              imageSrc: '/no.png',
              correct: false,
              nextKey: 'a6_emergency_contacts',
              feedback: 'Not correct. Remember: 1098 is the helpline for children in India.',
            },
          ],
        },

        // Final Scene: Completion & Empowerment
        {
          key: 'a6_completion',
          order: 7,
          imageSrc: '/a6.jpg',
          question: '"Story Complete - ARAV STAYED SAFE!"\n\nArav learned that being safe is about:\n✓ Trusting his instincts\n✓ Saying NO firmly\n✓ Telling trusted adults\n✓ Knowing his body belongs to him\n✓ Knowing emergency contacts\n\nCongratulations! You helped Arav make safe choices. Now YOU know how to stay safe too!',
          hint: 'You are safe. Your choices matter. Tell trusted adults.',
          options: [
            {
              order: 1,
              text: 'I understand these safety rules and will tell trusted adults if unsafe',
              imageSrc: '/yes.png',
              correct: true,
              nextKey: null,
              feedback: 'BRAVE! You just completed the full safety training. Remember: You deserve to be safe. Always trust your instincts. Always tell trusted adults. You are not alone.',
            },
          ],
        },
      ],
    });

    // ==================== COURSE 2: Child Labour ====================
    const childLabourCourse = await ChildrenCourse.create({
      title: 'Child Labour Awareness',
      description: 'Understand child labour and learn safe choices through stories.',
      imageSrc: '/child_labour.svg',
      icon: 'WORK',
      ageGroup: '11-13',
      category: 'boundaries',
      difficulty: 'beginner',
      isPublished: true,
      order: 2,
    });

    const childLabourUnit = await ChildrenUnit.create({
      courseId: childLabourCourse.id,
      title: 'Rights and Education',
      description: 'Interactive story about school, safety, and support.',
      icon: 'UNIT',
      order: 1,
      isPublished: true,
    });

    await createBranchingLesson({
      unitId: childLabourUnit.id,
      title: 'Ravi and the Construction Site',
      description: 'Help Ravi choose between unsafe work and safe support.',
      content:
        'Ravi is asked to miss school and work long hours at a construction site. Make the right choices to protect his future.',
      imageSrc: '/Child_labor/01.jpg',
      order: 1,
      duration: 10,
      nodes: [
        {
          key: 'labour_start',
          order: 1,
          imageSrc: '/Child_labor/01.jpg',
          question: 'Ravi is told to skip school and work. What should he do?',
          hint: 'Children have a right to education and safety.',
          options: [
            {
              order: 1,
              text: 'Refuse unsafe work and ask a trusted adult for help',
              imageSrc: '/yes.png',
              correct: true,
              nextKey: 'labour_report',
              feedback: 'Correct. School and safety come first.',
            },
            {
              order: 2,
              text: 'Work silently and stop going to school',
              imageSrc: '/no.png',
              correct: false,
              nextKey: 'labour_wrong_consequence',
              feedback: 'Unsafe. This is child labour and harms children. See the consequence and retry.',
            },
          ],
        },
        {
          key: 'labour_wrong_consequence',
          order: 2,
          imageSrc: '/Child_labor/05.jpg',
          question: 'Ravi is exhausted and unsafe at work. What now?',
          hint: 'Speak up and find support.',
          options: [
            {
              order: 1,
              text: 'Leave unsafe work and seek help from adults/authorities',
              imageSrc: '/yes.png',
              correct: true,
              nextKey: 'labour_start',
              feedback: 'Right recovery. Return and make the safe first choice.',
            },
            {
              order: 2,
              text: 'Keep working and hide it',
              imageSrc: '/no.png',
              correct: false,
              nextKey: 'labour_wrong_consequence',
              feedback: 'Still unsafe. Child labour must be reported. Try again.',
            },
          ],
        },
        {
          key: 'labour_report',
          order: 3,
          imageSrc: '/Child_labor/08.jpg',
          question: 'Who should Ravi contact for immediate child help?',
          hint: 'Know the helpline number.',
          options: [
            {
              order: 1,
              text: 'Call 1098 Child Helpline',
              imageSrc: '/learn.svg',
              correct: true,
              nextKey: 'labour_done',
              feedback: 'Correct. 1098 helps children in danger.',
            },
            {
              order: 2,
              text: 'Do nothing and wait',
              imageSrc: '/no.png',
              correct: false,
              nextKey: 'labour_report',
              feedback: 'Not safe. Action is needed to protect children.',
            },
          ],
        },
        {
          key: 'labour_done',
          order: 4,
          imageSrc: '/Child_labor/10.jpg',
          question: 'Ravi is back in school. What right was protected?',
          hint: 'Every child has this right.',
          options: [
            {
              order: 1,
              text: 'Right to education and safety',
              imageSrc: '/yes.png',
              correct: true,
              nextKey: null,
              feedback: 'Excellent. You completed this story.',
            },
          ],
        },
      ],
    });

    // ==================== COURSE 3: Child Marriage ====================
    const childMarriageCourse = await ChildrenCourse.create({
      title: 'Child Marriage Awareness',
      description: 'Learn to recognize pressure and choose safe support actions.',
      imageSrc: '/child_marriage.svg',
      icon: 'CARE',
      ageGroup: '11-13',
      category: 'relationships',
      difficulty: 'beginner',
      isPublished: true,
      order: 3,
    });

    const childMarriageUnit = await ChildrenUnit.create({
      courseId: childMarriageCourse.id,
      title: 'Rights, Health, and Future',
      description: 'Interactive story about saying no to child marriage pressure.',
      icon: 'UNIT',
      order: 1,
      isPublished: true,
    });

    await createBranchingLesson({
      unitId: childMarriageUnit.id,
      title: 'Anya and Family Pressure',
      description: 'Anya is being pressured for early marriage. Choose safe actions.',
      content:
        'Anya wants to continue education but is pressured into early marriage. Help her take safe, legal steps.',
      imageSrc: '/Child_marriage/1.jpeg',
      order: 1,
      duration: 9,
      nodes: [
        {
          key: 'marriage_start',
          order: 1,
          imageSrc: '/Child_marriage/1.jpeg',
          question: 'Anya is told to marry before 18. What should she do?',
          hint: 'Child marriage is unsafe and illegal.',
          options: [
            {
              order: 1,
              text: 'Say no and seek help from trusted adults/teachers',
              imageSrc: '/yes.png',
              correct: true,
              nextKey: 'marriage_support',
              feedback: 'Correct. Saying no and seeking support is the safe choice.',
            },
            {
              order: 2,
              text: 'Accept silently to avoid conflict',
              imageSrc: '/no.png',
              correct: false,
              nextKey: 'marriage_wrong_consequence',
              feedback: 'Unsafe. Early marriage harms health, rights, and education.',
            },
          ],
        },
        {
          key: 'marriage_wrong_consequence',
          order: 2,
          imageSrc: '/Child_marriage/2.jpeg',
          question: 'Anya feels trapped and sad. What now?',
          hint: 'Support systems can help.',
          options: [
            {
              order: 1,
              text: 'Reach a trusted adult and ask for immediate protection',
              imageSrc: '/yes.png',
              correct: true,
              nextKey: 'marriage_start',
              feedback: 'Good recovery. Go back and choose the safe first action.',
            },
            {
              order: 2,
              text: 'Stay quiet and continue',
              imageSrc: '/no.png',
              correct: false,
              nextKey: 'marriage_wrong_consequence',
              feedback: 'Not safe. Silence increases risk. Try again.',
            },
          ],
        },
        {
          key: 'marriage_support',
          order: 3,
          imageSrc: '/Child_marriage/3.jpeg',
          question: 'Which path protects Anya\'s future?',
          hint: 'Education and legal support matter.',
          options: [
            {
              order: 1,
              text: 'Continue school and contact child support systems',
              imageSrc: '/yes.png',
              correct: true,
              nextKey: 'marriage_done',
              feedback: 'Excellent. Education and support keep children safer.',
            },
            {
              order: 2,
              text: 'Drop school and hide the issue',
              imageSrc: '/no.png',
              correct: false,
              nextKey: 'marriage_support',
              feedback: 'Unsafe. Hiding delays help. Choose the safer action.',
            },
          ],
        },
        {
          key: 'marriage_done',
          order: 4,
          imageSrc: '/child_marriage.svg',
          question: 'Story complete: What is the legal minimum marriage age for girls in India?',
          hint: 'Remember this legal protection.',
          options: [
            {
              order: 1,
              text: '18 years',
              imageSrc: '/yes.png',
              correct: true,
              nextKey: null,
              feedback: 'Correct. You completed this story.',
            },
          ],
        },
      ],
    });

    // ==================== COURSE 4: Online Exploitation ====================
    const onlineSafetyCourse = await ChildrenCourse.create({
      title: 'Online Exploitation Awareness',
      description: 'Practice safe digital choices in interactive situations.',
      imageSrc: '/online_exploitation.svg',
      icon: 'WEB',
      ageGroup: '8-10',
      category: 'general',
      difficulty: 'beginner',
      isPublished: true,
      order: 4,
    });

    const onlineSafetyUnit = await ChildrenUnit.create({
      courseId: onlineSafetyCourse.id,
      title: 'Smart and Safe Online',
      description: 'Interactive story on chats, links, and trusted reporting.',
      icon: 'UNIT',
      order: 1,
      isPublished: true,
    });

    await createBranchingLesson({
      unitId: onlineSafetyUnit.id,
      title: 'Mystery Message Challenge',
      description: 'A stranger sends links and asks personal details. Choose safely.',
      content:
        'A child gets a message from an unknown person asking for photos and address details. Help make safe online decisions.',
      imageSrc: '/e.jpg',
      order: 1,
      duration: 8,
      nodes: [
        {
          key: 'online_start',
          order: 1,
          imageSrc: '/e.jpg',
          question: 'An unknown account asks for your home address. What should you do?',
          hint: 'Never share personal details with strangers online.',
          options: [
            {
              order: 1,
              text: 'Refuse, block the account, and tell a trusted adult',
              imageSrc: '/yes.png',
              correct: true,
              nextKey: 'online_link',
              feedback: 'Correct. Blocking and reporting is the safe digital response.',
            },
            {
              order: 2,
              text: 'Share details because they seem friendly',
              imageSrc: '/no.png',
              correct: false,
              nextKey: 'online_wrong_consequence',
              feedback: 'Unsafe. Friendly profiles can be fake. See what can go wrong.',
            },
          ],
        },
        {
          key: 'online_wrong_consequence',
          order: 2,
          imageSrc: '/kidnap.jpg',
          question: 'Your information is misused. What now?',
          hint: 'Take immediate protective action.',
          options: [
            {
              order: 1,
              text: 'Stop chat, block, report, and inform trusted adults now',
              imageSrc: '/yes.png',
              correct: true,
              nextKey: 'online_start',
              feedback: 'Good recovery. Return and choose the safe action first.',
            },
            {
              order: 2,
              text: 'Keep chatting and hope it gets better',
              imageSrc: '/no.png',
              correct: false,
              nextKey: 'online_wrong_consequence',
              feedback: 'Not safe. Continued contact increases risk. Try again.',
            },
          ],
        },
        {
          key: 'online_link',
          order: 3,
          imageSrc: '/bus.jpg',
          question: 'You get a suspicious link promising free rewards. Safe choice?',
          hint: 'Unknown links can steal data.',
          options: [
            {
              order: 1,
              text: 'Do not click. Report and delete',
              imageSrc: '/yes.png',
              correct: true,
              nextKey: 'online_done',
              feedback: 'Correct. Avoid unknown links and report them.',
            },
            {
              order: 2,
              text: 'Click once just to check',
              imageSrc: '/no.png',
              correct: false,
              nextKey: 'online_link',
              feedback: 'Unsafe. Even one click can be harmful. Choose the safer action.',
            },
          ],
        },
        {
          key: 'online_done',
          order: 4,
          imageSrc: '/online_exploitation.svg',
          question: 'Story complete: What is the best online safety habit?',
          hint: 'Think: pause, verify, report.',
          options: [
            {
              order: 1,
              text: 'Protect privacy, verify people, and report suspicious activity',
              imageSrc: '/yes.png',
              correct: true,
              nextKey: null,
              feedback: 'Excellent. You completed this story.',
            },
          ],
        },
      ],
    });

    logger.info('Children courses seeded with full interactive story paths and image assets.');
  } catch (error) {
    logger.error('Error seeding children courses:', error);
    throw error;
  }
};
