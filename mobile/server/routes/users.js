const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { verifyToken } = require('../middleware/auth');

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { displayName } = req.body;
  
  if (id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        display_name: displayName,
        updated_at: new Date()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    res.json(data[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.get('/:userId/queries', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('queries')
      .select(`
        *,
        users:user_id (
          display_name,
          email
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user queries:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
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
    
    const { data, error } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching analysis results:', error);
      return res.status(400).json({ error: error.message });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching analysis results:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;