import mongoose from 'mongoose';

const moodLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clerkId: { type: String, required: true },
  
  // Mood data
  mood: { 
    type: String, 
    enum: ['happy', 'sad', 'angry', 'scared', 'confused', 'excited', 'calm', 'tired'],
    required: true 
  },
  moodIntensity: { type: Number, min: 1, max: 5, required: true }, // 1-5 scale
  
  // Optional mood tags/reasons
  tags: [String], // e.g., ['school', 'friends', 'family', 'homework', 'tired']
  notes: String, // Short optional note about why they felt this way
  
  // Timestamp
  createdAt: { type: Date, default: Date.now },
  date: { type: Date, required: true } // Date of mood entry
});

// Index for efficient querying
moodLogSchema.index({ clerkId: 1, date: -1 });
moodLogSchema.index({ clerkId: 1, createdAt: -1 });

export const MoodLog = mongoose.model('MoodLog', moodLogSchema);
