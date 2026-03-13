import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clerkId: { type: String, required: true },
  
  // Journal entry content
  title: String, // Optional title
  content: { type: String, required: true },
  
  // Mood context (optional, can be linked to a mood log)
  mood: String, // e.g., 'happy', 'sad', etc.
  moodIntensity: { type: Number, min: 1, max: 5 },
  
  // Privacy and security
  isAnonymous: { type: Boolean, default: false }, // Whether to hide from analytics
  
  // Tags for organization
  tags: [String], // e.g., ['school', 'friends', 'family']
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  entryDate: { type: Date, required: true } // Date user wrote about
});

// Index for efficient querying
journalSchema.index({ clerkId: 1, createdAt: -1 });
journalSchema.index({ clerkId: 1, entryDate: -1 });

export const Journal = mongoose.model('Journal', journalSchema);
