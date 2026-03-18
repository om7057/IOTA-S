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
      title: 'Arav and the Stranger Offer',
      description: 'Arav is approached by a stranger. Choose what he should do.',
      content:
        'Arav is leaving school when a stranger says, "Your parents asked me to pick you up." Help Arav make safe decisions.',
      imageSrc: '/a1.jpg',
      order: 1,
      duration: 8,
      nodes: [
        {
          key: 'abuse_start',
          order: 1,
          imageSrc: '/a1.jpg',
          question: 'A stranger says they will drop you home. What should Arav do?',
          hint: 'Safe children do not go with strangers.',
          options: [
            {
              order: 1,
              text: 'Say NO and move to a safe place',
              imageSrc: '/yes.png',
              correct: true,
              nextKey: 'abuse_tell_adult',
              feedback: 'Correct. Saying NO and moving away is the safest first step.',
            },
            {
              order: 2,
              text: 'Go with the stranger quickly',
              imageSrc: '/no.png',
              correct: false,
              nextKey: 'abuse_wrong_consequence',
              feedback: 'Unsafe choice. Never go with a stranger. Learn what can go wrong.',
            },
          ],
        },
        {
          key: 'abuse_wrong_consequence',
          order: 2,
          imageSrc: '/a2.jpg',
          question: 'Arav feels scared and alone. What should he do now?',
          hint: 'Get help from safe adults.',
          options: [
            {
              order: 1,
              text: 'Shout for help and run to a crowded place',
              imageSrc: '/yes.png',
              correct: true,
              nextKey: 'abuse_start',
              feedback: 'Good recovery. Now go back and choose the safe action from the beginning.',
            },
            {
              order: 2,
              text: 'Stay silent and keep going',
              imageSrc: '/no.png',
              correct: false,
              nextKey: 'abuse_wrong_consequence',
              feedback: 'Not safe. Staying silent gives control to the stranger. Try again.',
            },
          ],
        },
        {
          key: 'abuse_tell_adult',
          order: 3,
          imageSrc: '/a3.jpg',
          question: 'Arav is now safe. What is the next best step?',
          hint: 'Trusted adults protect children.',
          options: [
            {
              order: 1,
              text: 'Tell a parent, teacher, or trusted adult immediately',
              imageSrc: '/guardian.svg',
              correct: true,
              nextKey: 'abuse_done',
              feedback: 'Excellent. Sharing with trusted adults keeps children safer.',
            },
            {
              order: 2,
              text: 'Keep it secret and say nothing',
              imageSrc: '/no.png',
              correct: false,
              nextKey: 'abuse_tell_adult',
              feedback: 'Unsafe. Secrets in safety situations should be shared with trusted adults.',
            },
          ],
        },
        {
          key: 'abuse_done',
          order: 4,
          imageSrc: '/learn.svg',
          question: 'Safety complete: Who can children call in India for child help?',
          hint: 'Remember this emergency number.',
          options: [
            {
              order: 1,
              text: '1098 Child Helpline',
              imageSrc: '/learn.svg',
              correct: true,
              nextKey: null,
              feedback: 'Great. 1098 is the Child Helpline. You completed this story.',
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
