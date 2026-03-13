// Story seed data for "Child Safety - Good Touch/Bad Touch"
// Fixed logic, indexing, and option text
// NO new scenes added

export const childSafetyStory = {
  title: "Child Safety - Good Touch & Bad Touch",
  description:
    "Learn about personal safety through Arav's journey. Understand good touch, bad touch, and why telling a trusted adult is important.",
  topic: "child-safety",
  level: "beginner",

  scenes: [
    {
      // 0
      title: "Arav happily goes to school with his parents.",
      image: "/a1.jpg",
      options: [{ text: "Next", to: 1 }],
    },

    {
      // 1
      title:
        "At school, the teacher explains good touch and bad touch. She tells students that some body parts are private and should not be touched by others.",
      image: "/a2.jpg",
      options: [{ text: "Next", to: 2 }],
    },

    {
      // 2
      title:
        "After school, Arav is waiting outside when a man comes near him.",
      image: "/a3.jpg",
      options: [{ text: "Next", to: 3 }],
    },

    {
      // 3
      title:
        "The man says, “I will take you home. Come with me.” Arav remembers his teacher’s words.",
      image: "/a4.jpg",
      options: [
        { text: "Go with the man", to: 6 },
        { text: "Take the school bus", to: 4 },
      ],
    },

    {
      // 4
      title:
        "You made a safe choice. Arav takes the school bus and reaches home safely.",
      image: "/bus.jpg",
      options: [{ text: "Next", to: 15 }],
    },

    {
      // 5 (kept, repurposed logically)
      title:
        "Later that day, Arav meets an adult known to the family.",
      image: "/a5.jpg",
      options: [{ text: "Next", to: 6 }],
    },

    {
      // 6
      title:
        "The man asks Arav to come closer. Arav starts feeling uncomfortable.",
      image: "/a6.jpg",
      options: [{ text: "Next", to: 7 }],
    },

    {
      // 7
      title:
        "The man touches Arav in a way that feels wrong. Arav remembers this is bad touch.",
      image: "/a9.jpg",
      options: [
        { text: "Shout and run away", to: 8 },
        { text: "Stay silent", to: 9 },
      ],
    },

    {
      // 8
      title:
        "Great job! Arav shouts and runs away to a safe place.",
      image: "/a10.jpg",
      options: [{ text: "Next", to: 15 }],
    },

    {
      // 9
      title:
        "Arav feels scared and confused. He does not know what to do.",
      image: "/a12.jpg",
      options: [{ text: "Next", to: 10 }],
    },

    {
      // 10
      title:
        "The man tells Arav to keep it a secret and offers him chocolates.",
      image: "/a11.jpg",
      options: [{ text: "Next", to: 11 }],
    },

    {
      // 11
      title:
        "Arav is crying and feels very upset.",
      image: "/15.jpg",
      options: [{ text: "Next", to: 12 }],
    },

    {
      // 12
      title:
        "Arav’s parents arrive home and notice he is sad.",
      image: "/14.jpg",
      options: [{ text: "Next", to: 13 }],
    },

    {
      // 13
      title:
        "Should Arav tell his parents what happened?",
      image: "/a16.jpg",
      options: [
        { text: "Tell parents", to: 14 },
        { text: "Keep it secret", to: 16 },
      ],
    },

    {
      // 14
      title:
        "Arav tells his parents everything. They listen and support him.",
      image: "/17.jpg",
      options: [{ text: "Next", to: 15 }],
    },

    {
      // 15
      title:
        "The bad person is reported and Arav is kept safe.",
      image: "/a20.jpg",
      options: [{ text: "Next", to: 18 }],
    },

    {
      // 16
      title:
        "Keeping secrets makes Arav feel lonely and scared.",
      image: "/sad.jpg",
      options: [{ text: "Next", to: 18 }],
    },

    {
      // 17 (kept, merged meaningfully)
      title:
        "Arav feels relieved after sharing the truth.",
      image: "/17.jpg",
      options: [{ text: "Next", to: 18 }],
    },

    {
      // 18
      title:
        "Lesson Learned: If someone touches you in a way that feels wrong, say NO, move away, and tell a trusted adult. You are not alone.",
      image: "/award2.gif",
      options: [{ text: "End Story", to: 0 }],
    },
  ],
};
