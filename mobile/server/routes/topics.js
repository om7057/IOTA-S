const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { verifyToken } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .order('topic_name', { ascending: true });

    if (error) {
      console.error('Error fetching topics:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;

    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('topic_id', topicId)
      .single();

    if (error) {
      console.error('Error fetching topic:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching topic:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:topicId/posts', async (req, res) => {
  try {
    const { topicId } = req.params;

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        users:user_id (
          id,
          display_name,
          email
        ),
        topics:topic_id (
          topic_id,
          topic_name
        ),
        likes:likes(count)
      `)
      .eq('topic_id', topicId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return res.status(400).json({ error: error.message });
    }

    const postsWithCounts = data.map(post => ({
      ...post,
      likes_count: post.likes.length
    }));

    res.json(postsWithCounts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:topicId/posts', verifyToken, async (req, res) => {
  try {
    const { topicId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert([{
        user_id: userId,
        topic_id: topicId,
        content
      }])
      .select()
      .single();

    if (postError) {
      console.error('Error creating post:', postError);
      return res.status(400).json({ error: postError.message });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, display_name, email')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
    }

    const { data: topicData, error: topicError } = await supabase
      .from('topics')
      .select('topic_id, topic_name')
      .eq('topic_id', topicId)
      .single();

    if (topicError) {
      console.error('Error fetching topic data:', topicError);
    }

    const postWithDetails = {
      ...post,
      users: userData || null,
      topics: topicData || null,
      likes_count: 0
    };

    res.status(201).json(postWithDetails);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;