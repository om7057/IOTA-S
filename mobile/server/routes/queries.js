const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, async (req, res) => {
  try {
    const { question } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('queries')
      .insert([
        {
          user_id: userId,
          question,
          answer: null, 
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating query:', error);
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating query:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching queries for user:', userId);
    
    const { data: queries, error: queriesError } = await supabase
      .from('queries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (queriesError) {
      console.error('Error fetching queries:', queriesError);
      return res.status(400).json({ error: queriesError.message });
    }

    console.log('Fetched queries:', JSON.stringify(queries, null, 2));

    const queriesWithUser = await Promise.all(
      queries.map(async (query) => {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('display_name, email')
          .eq('id', query.user_id)
          .single();

        if (userError) {
          console.error('Error fetching user:', userError);
          return { ...query, user: null };
        }

        return {
          ...query,
          user: userData
        };
      })
    );

    console.log('Fetched queries with user data:', JSON.stringify(queriesWithUser, null, 2));
    res.json(queriesWithUser);
  } catch (error) {
    console.error('Error in query fetch process:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;

    const { data, error } = await supabase
      .from('queries')
      .select(`
        *,
        users:user_id (
          display_name,
          email
        )
      `)
      .eq('question_id', questionId)
      .single();

    if (error) {
      console.error('Error fetching query:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching query:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:questionId', verifyToken, async (req, res) => {
  try {
    const { questionId } = req.params;
    const { answer } = req.body;
    const userId = req.user.id;

    const { data: existingQuery, error: checkError } = await supabase
      .from('queries')
      .select('*')
      .eq('question_id', questionId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existingQuery) {
      return res.status(404).json({ error: 'Query not found or unauthorized' });
    }

    const { data, error } = await supabase
      .from('queries')
      .update({
        answer,
        updated_at: new Date().toISOString()
      })
      .eq('question_id', questionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating query:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating query:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;