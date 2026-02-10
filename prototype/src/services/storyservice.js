// src/lib/storyService.js
import { supabase } from "../supabaseClient";

// Create story
export const createStory = async (story) => {
  const { data, error } = await supabase
    .from("stories")
    .insert([story])
    .select()
    .single();

  return { data, error };
};

// Get all stories
export const getAllStories = async () => {
  const { data, error } = await supabase
    .from("stories")
    .select("*, level:story_levels(*), topic:topics(*)")
    .order("created_at", { ascending: true });

  return { data, error };
};

// Get one story
export const getStoryById = async (id) => {
  const { data, error } = await supabase
    .from("stories")
    .select("*, level:story_levels(*), topic:topics(*)")
    .eq("id", id)
    .single();

  return { data, error };
};

// Update story
export const updateStory = async (id, updates) => {
  const { data, error } = await supabase
    .from("stories")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
};

// Delete story
export const deleteStory = async (id) => {
  const { error } = await supabase
    .from("stories")
    .delete()
    .eq("id", id);

  return { success: !error, error };
};
