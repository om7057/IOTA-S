const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { verifyToken } = require('../middleware/auth');

router.post('/join', verifyToken, async (req, res) => {
  try {
    const { groupName } = req.body;
    const userId = req.user.id;

    const { data: existingGroup, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('group_name', groupName)
      .single();

    if (groupError || !existingGroup) {
      return res.status(404).json({ error: 'Group does not exist' });
    }

    const { data: existingMembership, error: membershipError } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', existingGroup.group_id)
      .eq('user_id', userId)
      .single();

    if (existingMembership) {
      return res.json({ 
        success: true, 
        message: 'Already a member of this group',
        group: existingGroup
      });
    }

    const { data: membership, error: joinError } = await supabase
      .from('group_members')
      .insert([{
        group_id: existingGroup.group_id,
        user_id: userId
      }])
      .select()
      .single();

    if (joinError) {
      console.error('Error joining group:', joinError);
      return res.status(400).json({ error: joinError.message });
    }

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

    const { data, error } = await supabase
      .from('group_members')
      .select(`
        id,
        joined_at,
        groups:group_id (
          group_id,
          group_name,
          created_at
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching groups:', error);
      return res.status(400).json({ error: error.message });
    }

    // Format the data
    const groups = data.map(item => item.groups);

    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/available', verifyToken, async (req, res) => {
  try {
    const { data: allGroups, error: groupsError } = await supabase
      .from('groups')
      .select('*')
      .order('group_name', { ascending: true });

    if (groupsError) {
      console.error('Error fetching groups:', groupsError);
      return res.status(400).json({ error: groupsError.message });
    }

    res.json(allGroups);
  } catch (error) {
    console.error('Error fetching available groups:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:groupId/messages', verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const { data: membership, error: membershipError } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (membershipError || !membership) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    const { data: messages, error: messagesError } = await supabase
      .from('group_messages')
      .select(`
        message_id,
        content,
        created_at,
        users:user_id (
          id,
          display_name,
          email
        )
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return res.status(400).json({ error: messagesError.message });
    }

    res.json(messages);
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

    const { data: membership, error: membershipError } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (membershipError || !membership) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    const { data: message, error: messageError } = await supabase
      .from('group_messages')
      .insert([{
        group_id: groupId,
        user_id: userId,
        content
      }])
      .select()
      .single();

    if (messageError) {
      console.error('Error sending message:', messageError);
      return res.status(400).json({ error: messageError.message });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, display_name, email')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
    }

    const messageWithUser = {
      ...message,
      users: userData || null
    };

    res.status(201).json(messageWithUser);
  } catch (error) {
    console.error('Error sending group message:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;