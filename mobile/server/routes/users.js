const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// Verification status endpoint (MUST be before /:userId to take precedence)
router.get('/verification-status', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(
      'SELECT is_verified, verified_at FROM users WHERE id = $1 AND deleted_at IS NULL',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching verification status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query('SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check verification eligibility
router.get('/:userId/verify-eligibility', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if user has at least one query (placeholder - can be extended)
    const result = await db.query(
      `SELECT COUNT(*) as eligible_posts 
       FROM queries 
       WHERE user_id = $1`,
      [userId]
    );

    const eligible = result.rows[0].eligible_posts > 0;
    
    res.json({ 
      eligible,
      reason: eligible ? 'User has posts with sufficient likes' : 'Not enough engagement'
    });
  } catch (error) {
    console.error('Error checking verification eligibility:', error);
    res.status(500).json({ error: error.message });
  }
});

// Request verification
router.post('/:userId/verify', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check eligibility first (user has at least one query)
    const checkResult = await db.query(
      `SELECT COUNT(*) as eligible_posts 
       FROM queries 
       WHERE user_id = $1`,
      [userId]
    );

    if (checkResult.rows[0].eligible_posts === 0) {
      return res.status(400).json({ error: 'User is not eligible for verification' });
    }

    // Mark user as verified
    const result = await db.query(
      'UPDATE users SET is_verified = true, verified_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, is_verified, verified_at',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error verifying user:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await db.query('SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { display_name, age, gender } = req.body;
  
  if (id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  try {
    const result = await db.query(
      'UPDATE users SET display_name = COALESCE($1, display_name), age = COALESCE($2, age), gender = COALESCE($3, gender), updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND deleted_at IS NULL RETURNING *',
      [display_name, age, gender, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.get('/:userId/queries', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await db.query(
      `SELECT q.*, u.display_name, u.email 
       FROM queries q 
       JOIN users u ON q.user_id = u.id 
       WHERE q.user_id = $1 
       ORDER BY q.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user queries:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:userId/analysis', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Return empty array if no analysis results exist yet
    try {
      const result = await db.query(
        'SELECT * FROM analysis_results WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      res.json(result.rows);
    } catch (err) {
      // If table doesn't exist, just return empty array
      if (err.code === '42P01') {
        res.json([]);
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error('Error fetching analysis results:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analyze user queries and join recommended groups
router.post('/:userId/analyze-queries', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all queries for this user
    const queriesResult = await db.query(
      'SELECT question FROM queries WHERE user_id = $1',
      [userId]
    );

    if (queriesResult.rows.length === 0) {
      return res.json({ 
        analyzed: 0,
        groups: [],
        results: []
      });
    }

    const queries = queriesResult.rows.map(q => q.question);

    // Extract group names from queries (simplified - looks for common keywords)
    const groups = new Set();
    const keywordGroupMap = {
      'health': 'wellness',
      'fitness': 'fitness',
      'mental': 'mental-health',
      'tech': 'technology',
      'career': 'career-dev',
      'finance': 'finance',
      'education': 'learning',
      'travel': 'travel',
      'food': 'cooking',
      'art': 'creativity'
    };

    queries.forEach(query => {
      const lower = query.toLowerCase();
      Object.keys(keywordGroupMap).forEach(keyword => {
        if (lower.includes(keyword)) {
          groups.add(keywordGroupMap[keyword]);
        }
      });
    });

    const groupsArray = Array.from(groups);
    const results = [];

    // Try to join each recommended group
    for (const groupName of groupsArray) {
      try {
        // Check if group exists
        const groupResult = await db.query(
          'SELECT id FROM groups WHERE name = $1',
          [groupName]
        );

        if (groupResult.rows.length === 0) {
          results.push({
            group: groupName,
            status: 'failed',
            error: 'Group not found'
          });
          continue;
        }

        const groupId = groupResult.rows[0].id;

        // Check if already a member
        const memberResult = await db.query(
          'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2',
          [groupId, userId]
        );

        if (memberResult.rows.length > 0) {
          results.push({
            group: groupName,
            status: 'already_member'
          });
          continue;
        }

        // Add user to group
        await db.query(
          'INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)',
          [groupId, userId]
        );

        results.push({
          group: groupName,
          status: 'joined'
        });
      } catch (error) {
        results.push({
          group: groupName,
          status: 'failed',
          error: error.message
        });
      }
    }

    res.json({
      analyzed: queries.length,
      groups: groupsArray,
      results
    });
  } catch (error) {
    console.error('Error analyzing queries:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;