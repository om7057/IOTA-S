
import mongoose from 'mongoose';

const quizProgressSchema = new mongoose.Schema({
  user: { type: String, required: true },
  story: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  level: { type: mongoose.Schema.Types.ObjectId, ref: 'StoryLevel' },
  answers: [
    {
      quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
      selectedAnswer: String,
      isCorrect: Boolean,
    }
  ]
}, { timestamps: true });

export const QuizProgress = mongoose.model('QuizProgress', quizProgressSchema);
