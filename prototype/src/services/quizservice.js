// src/lib/quizService.js
import { supabase } from "./supabaseClient";

export const getQuizzesByStory = async (storyId) => {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("story_id", storyId);

  return { data, error };
};
