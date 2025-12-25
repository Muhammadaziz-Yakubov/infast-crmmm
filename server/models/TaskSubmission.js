import mongoose from 'mongoose';

const taskSubmissionSchema = new mongoose.Schema({
  task_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  submitted_at: {
    type: Date,
    default: Date.now
  },
  // Grading
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  graded_at: {
    type: Date
  },
  graded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  feedback: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['PENDING', 'GRADED'],
    default: 'PENDING'
  }
}, {
  timestamps: true
});

// Prevent duplicate submissions
taskSubmissionSchema.index({ task_id: 1, student_id: 1 }, { unique: true });

export default mongoose.model('TaskSubmission', taskSubmissionSchema);

