const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Create a new user
router.post('/signup', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error('Supabase Auth error:', authError);
      return res.status(400).json({ error: authError.message });
    }

    // Create user profile in database
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          display_name: displayName,
          email: email,
        },
      ])
      .select()
      .single();

    if (profileError) {
      console.error('Database error:', profileError);
      return res.status(400).json({ error: profileError.message });
    }

    // Sign in the user to get a session
    const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('Sign in error:', signInError);
      return res.status(400).json({ error: signInError.message });
    }

    // Return both session and user data
    res.json({
      session,
      user: profileData
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;