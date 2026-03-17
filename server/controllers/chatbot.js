import { ChatMessage, User } from '../models/index.js';

// Mock AI responses for chatbot
const getBotResponse = (userMessage, sentiment) => {
  const lowerMessage = userMessage.toLowerCase();
  const responses = {
    greeting: [
      "Hey there! 👋 I'm your AI friend. How are you doing today?",
      "Hi! Great to chat with you. What's on your mind?",
      "Hello! I'm here to listen and help. What's up?",
    ],
    stress: [
      "I hear you're stressed. 😔 Remember to take deep breaths. Even a 5-minute walk can help!",
      "Stress is tough, but you've got this! 💪 Want to talk about what's stressing you?",
      "Stressful times happen to everyone. You're strong enough to handle this. What's bothering you?",
    ],
    anxiety: [
      "Anxiety is really tough. 🤝 Remember: You are safe, you are here, you are enough.",
      "When anxiety kicks in, grounding techniques help! Try naming 5 things you see, 4 you hear, 3 you feel.",
      "It's okay to feel anxious sometimes. Reach out to someone you trust if you need support. 💙",
    ],
    depression: [
      "I'm sorry you're feeling down. 💙 Remember that feelings are temporary, and you're not alone.",
      "Depression is a real struggle, but there's always hope. Would you like to talk to a counselor?",
      "You matter, even on tough days. Consider reaching out to someone you trust. 🤗",
    ],
    achievement: [
      "OMG, that's AMAZING! 🎉 You should be so proud of yourself! Keep up that energy!",
      "Yes! That's awesome! 🌟 You're doing great. Keep believing in yourself!",
      "That's incredible! 👏 I'm so hyped for you. Keep crushing your goals!",
    ],
    help: [
      "I'm here to listen and support you! 💙 Feel free to share what's on your mind.",
      "You can always talk to me! I'm here to help however I can.",
      "Let's work through this together. What do you need help with?",
    ],
    bye: [
      "Take care of yourself! Remember, you're amazing. 👋",
      "Bye! Keep being awesome. Come back anytime you need to talk! 💙",
      "See you later! Be kind to yourself! 🌈",
    ],
  };

  let category = 'help';
  if (lowerMessage.match(/hello|hi|hey|greetings|howdy/)) category = 'greeting';
  else if (lowerMessage.match(/stress|worried|overwhelmed|pressure/)) category = 'stress';
  else if (lowerMessage.match(/anxious|anxiety|panic|nervous/)) category = 'anxiety';
  else if (lowerMessage.match(/sad|depressed|depression|hopeless|alone/)) category = 'depression';
  else if (lowerMessage.match(/won|achieve|accomplished|success|proud/)) category = 'achievement';
  else if (lowerMessage.match(/bye|goodbye|see you|later|gotta go/)) category = 'bye';

  const categoryResponses = responses[category] || responses.help;
  return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
};

// Get all chat messages for user
export const getUserChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const messages = await ChatMessage.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: messages.rows.reverse(),
      total: messages.count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('❌ Error fetching chat history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Send message to chatbot
export const sendChatMessage = async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ success: false, error: 'User ID and message required' });
    }

    // Detect sentiment (simple heuristic)
    const negativeTags = ['bad', 'sad', 'angry', 'frustrated', 'hate', 'stressed', 'anxiety'];
    const positiveTags = ['good', 'happy', 'excited', 'love', 'awesome', 'great'];
    const lowerMsg = message.toLowerCase();

    let sentiment = 'neutral';
    if (negativeTags.some((tag) => lowerMsg.includes(tag))) sentiment = 'negative';
    else if (positiveTags.some((tag) => lowerMsg.includes(tag))) sentiment = 'positive';

    // Generate bot response
    const botResponse = getBotResponse(message, sentiment);

    // Save user message
    const userMsg = await ChatMessage.create({
      userId,
      message,
      sender: 'user',
      sentiment,
      tags: [sentiment],
    });

    // Save bot response
    const botMsg = await ChatMessage.create({
      userId,
      message: botResponse,
      sender: 'bot',
      botResponse,
      sentiment: 'positive',
      tags: ['response'],
    });

    // Emit Socket.io event for real-time update
    if (global.io) {
      global.io.emit(`chat:${userId}`, {
        type: 'new_message',
        userMessage: userMsg,
        botMessage: botMsg,
      });
    }

    res.json({
      success: true,
      data: {
        userMessage: userMsg,
        botMessage: botMsg,
      },
    });
  } catch (error) {
    console.error('❌ Error sending chat message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get chat statistics
export const getChatStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await ChatMessage.findAll({
      where: { userId },
      attributes: ['sender', 'sentiment', 'tags'],
    });

    const stats = {
      totalMessages: messages.length,
      sentimentBreakdown: {
        positive: messages.filter((m) => m.sentiment === 'positive').length,
        neutral: messages.filter((m) => m.sentiment === 'neutral').length,
        negative: messages.filter((m) => m.sentiment === 'negative').length,
      },
      botInteractions: messages.filter((m) => m.sender === 'bot').length,
      userMessages: messages.filter((m) => m.sender === 'user').length,
      averageSentiment: messages.length > 0
        ? (messages.filter((m) => m.sentiment === 'positive').length +
            messages.filter((m) => m.sentiment === 'neutral').length * 0.5) /
          messages.length
        : 0,
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('❌ Error fetching chat stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Clear chat history for user
export const clearChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const deleted = await ChatMessage.destroy({ where: { userId } });

    res.json({
      success: true,
      message: `Deleted ${deleted} messages`,
    });
  } catch (error) {
    console.error('❌ Error clearing chat history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
