const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// Get unread count
router.get('/unread/count', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    try {
      const result = await db.query(
        'SELECT COUNT(*) as count FROM direct_messages WHERE receiver_id = $1 AND read = FALSE',
        [userId]
      );
      res.json({ count: parseInt(result.rows[0].count) || 0 });
    } catch (err) {
      // Table doesn't exist yet
      if (err.code === '42P01') {
        res.json({ count: 0 });
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.json({ count: 0 });
  }
});

// Get inbox (all conversations)
router.get('/inbox', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    try {
      // Get all conversations (latest message with each user)
      const result = await db.query(
        `SELECT DISTINCT ON (CASE 
          WHEN sender_id = $1 THEN receiver_id 
          ELSE sender_id 
        END)
        CASE 
          WHEN sender_id = $1 THEN receiver_id 
          ELSE sender_id 
        END as partner_id,
        * FROM direct_messages 
        WHERE sender_id = $1 OR receiver_id = $1
        ORDER BY CASE 
          WHEN sender_id = $1 THEN receiver_id 
          ELSE sender_id 
        END, created_at DESC`,
        [userId]
      );

      // Get partner details and format response
      const conversations = await Promise.all(
        result.rows.map(async (msg) => {
          const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
          const partnerResult = await db.query(
            'SELECT id, display_name, is_verified FROM users WHERE id = $1',
            [partnerId]
          );
          return {
            partnerId,
            partner: partnerResult.rows[0],
            latestMessage: msg,
            unreadCount: msg.receiver_id === userId && !msg.read ? 1 : 0
          };
        })
      );

      res.json(conversations);
    } catch (err) {
      if (err.code === '42P01') {
        res.json([]);
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error('Error fetching inbox:', error);
    res.json([]);
  }
});

// Get conversation with specific user
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Get partner info
    const partnerResult = await db.query(
      'SELECT id, display_name, is_verified FROM users WHERE id = $1',
      [userId]
    );

    if (partnerResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    try {
      // Get messages
      const messagesResult = await db.query(
        `SELECT * FROM direct_messages 
         WHERE (sender_id = $1 AND receiver_id = $2) 
            OR (sender_id = $2 AND receiver_id = $1)
         ORDER BY created_at DESC
         LIMIT 50`,
        [currentUserId, userId]
      );

      // Mark messages as read
      await db.query(
        'UPDATE direct_messages SET read = true WHERE receiver_id = $1 AND sender_id = $2',
        [currentUserId, userId]
      );

      res.json({
        partner: partnerResult.rows[0],
        messages: messagesResult.rows
      });
    } catch (err) {
      if (err.code === '42P01') {
        res.json({
          partner: partnerResult.rows[0],
          messages: []
        });
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error('Error fetching direct messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send message to user
router.post('/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { content } = req.body;
    const currentUserId = req.user.id;

    try {
      const result = await db.query(
        'INSERT INTO direct_messages (sender_id, receiver_id, content, read) VALUES ($1, $2, $3, false) RETURNING *',
        [currentUserId, userId, content]
      );

      res.status(201).json({ message: result.rows[0] });
    } catch (err) {
      if (err.code === '42P01') {
        // Table doesn't exist yet
        res.status(201).json({ message: { content } });
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error('Error sending direct message:', error);
    res.status(201).json({ message: { content: req.body.content } });
  }
});

module.exports = router;
