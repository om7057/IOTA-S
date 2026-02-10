import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  story: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
    required: true
  },
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true
  },
  correctAnswer: {
    type: String,
    required: true
  }
}, { timestamps: true });

export const Quiz = mongoose.model('Quiz', quizSchema);
