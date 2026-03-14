const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

router.post('/join', verifyToken, async (req, res) => {
  try {
    const { groupName } = req.body;
    const userId = req.user.id;

    const groupResult = await db.query(
      'SELECT * FROM groups WHERE group_name = $1',
      [groupName]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Group does not exist' });
    }

    const existingGroup = groupResult.rows[0];

    const membershipResult = await db.query(
      'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2',
      [existingGroup.group_id, userId]
    );

    if (membershipResult.rows.length > 0) {
      return res.json({ 
        success: true, 
        message: 'Already a member of this group',
        group: existingGroup
      });
    }

    await db.query(
      'INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)',
      [existingGroup.group_id, userId]
    );

    res.json({ 
      success: true, 
      message: 'Successfully joined the group',
      group: existingGroup
    });

  } catch (error) {
    console.error('Group join error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT g.id as group_id, g.name as group_name, g.created_at
       FROM groups g
       JOIN group_members gm ON g.id = gm.group_id
       WHERE gm.user_id = $1`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching groups:', error);
    // If tables don't exist, return empty array
    if (error.code === '42P01') {
      res.json([]);
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

router.get('/available', verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM groups ORDER BY group_name ASC'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching available groups:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:groupId/messages', verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const membershipResult = await db.query(
      'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, userId]
    );

    if (membershipResult.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    const result = await db.query(
      `SELECT gm.message_id, gm.content, gm.created_at, u.id as user_id, u.display_name, u.email
       FROM group_messages gm
       JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = $1
       ORDER BY gm.created_at DESC
       LIMIT 50`,
      [groupId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching group messages:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:groupId/messages', verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const membershipResult = await db.query(
      'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, userId]
    );

    if (membershipResult.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    const messageResult = await db.query(
      'INSERT INTO group_messages (group_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [groupId, userId, content]
    );

    const userResult = await db.query(
      'SELECT id, display_name, email FROM users WHERE id = $1',
      [userId]
    );

    const message = messageResult.rows[0];
    const messageWithUser = {
      ...message,
      user_id: userResult.rows[0]?.id,
      display_name: userResult.rows[0]?.display_name,
      email: userResult.rows[0]?.email
    };

    res.status(201).json(messageWithUser);
  } catch (error) {
    console.error('Error sending group message:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;