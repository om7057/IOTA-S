const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { verifyToken } = require('../middleware/auth');

router.post('/posts/:postId/like', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const { data: existingLike, error: likeCheckError } = await supabase
      .from('likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (likeCheckError && likeCheckError.code !== 'PGRST116') {  
              console.error('Error checking like:', likeCheckError);
      return res.status(400).json({ error: likeCheckError.message });
    }

    let result;
    
    if (existingLike) {
      const { error: unlikeError } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (unlikeError) {
        console.error('Error removing like:', unlikeError);
        return res.status(400).json({ error: unlikeError.message });
      }

      result = { liked: false };
    } else {
      const { data: newLike, error: likeError } = await supabase
        .from('likes')
        .insert([{
          post_id: postId,
          user_id: userId
        }])
        .select()
        .single();

      if (likeError) {
        console.error('Error adding like:', likeError);
        return res.status(400).json({ error: likeError.message });
      }

      result = { liked: true, like_data: newLike };
    }

    const { count, error: countError } = await supabase
      .from('likes')
      .select('*', { count: 'exact' })
      .eq('post_id', postId);

    if (countError) {
      console.error('Error getting like count:', countError);
      return res.status(400).json({ error: countError.message });
    }

    res.json({
      ...result,
      likes_count: count
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/posts/:postId/like', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {  
      console.error('Error checking like status:', error);
      return res.status(400).json({ error: error.message });
    }

    const { count, error: countError } = await supabase
      .from('likes')
      .select('*', { count: 'exact' })
      .eq('post_id', postId);

    if (countError) {
      console.error('Error getting like count:', countError);
      return res.status(400).json({ error: countError.message });
    }

    res.json({
      liked: !!data,
      likes_count: count
    });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;