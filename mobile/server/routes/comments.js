const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { verifyToken } = require('../middleware/auth');

router.get('/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;

    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        users:user_id (
          id,
          display_name,
          email
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/posts/:postId/comments', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert([{
        post_id: postId,
        user_id: userId,
        content
      }])
      .select()
      .single();

    if (commentError) {
      console.error('Error creating comment:', commentError);
      return res.status(400).json({ error: commentError.message });
    }

    // Get user info
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, display_name, email')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
    }

    const commentWithUser = {
      ...comment,
      users: userData || null
    };

    res.status(201).json(commentWithUser);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;