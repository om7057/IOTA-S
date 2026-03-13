const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { verifyToken } = require('../middleware/auth');

router.post('/journal-inputs', verifyToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const { data, error } = await supabase
      .from('journal_inputs')
      .insert([{
        user_id: userId,
        title,
        content
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating journal input:', error);
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating journal input:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/journal-inputs', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('journal_inputs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching journal inputs:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching journal inputs:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/journal-inputs/:entryId', verifyToken, async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('journal_inputs')
      .select('*')
      .eq('entry_id', entryId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching journal input:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching journal input:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/journal-inputs/:entryId', verifyToken, async (req, res) => {
  try {
    const { entryId } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id;

    const { data: existingEntry, error: checkError } = await supabase
      .from('journal_inputs')
      .select('*')
      .eq('entry_id', entryId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existingEntry) {
      return res.status(404).json({ error: 'Journal input not found or unauthorized' });
    }

    const { data, error } = await supabase
      .from('journal_inputs')
      .update({
        title,
        content,
        updated_at: new Date().toISOString()
      })
      .eq('entry_id', entryId)
      .select()
      .single();

    if (error) {
      console.error('Error updating journal input:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating journal input:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/journal-inputs/:entryId', verifyToken, async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user.id;

    const { data: existingEntry, error: checkError } = await supabase
      .from('journal_inputs')
      .select('*')
      .eq('entry_id', entryId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existingEntry) {
      return res.status(404).json({ error: 'Journal input not found or unauthorized' });
    }

    const { error } = await supabase
      .from('journal_inputs')
      .delete()
      .eq('entry_id', entryId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting journal input:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true, message: 'Journal input deleted successfully' });
  } catch (error) {
    console.error('Error deleting journal input:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;