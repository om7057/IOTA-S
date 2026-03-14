// src/lib/topicService.js
import { supabase } from '../supabaseClient';

// Create topic
export const createTopic = async (topic) => {
  return await supabase.from('topics').insert([topic]).select().single();
};

// Get all topics
export const getAllTopics = async () => {
  return await supabase.from('topics').select('*').order('created_at', { ascending: true });
};

// Get topic by ID
export const getTopicById = async (id) => {
  return await supabase.from('topics').select('*').eq('id', id).single();
};

// Update topic
export const updateTopic = async (id, updates) => {
  return await supabase.from('topics').update(updates).eq('id', id).select().single();
};

// Delete topic
export const deleteTopic = async (id) => {
  return await supabase.from('topics').delete().eq('id', id);
};
