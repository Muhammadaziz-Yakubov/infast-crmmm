import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  group_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['PRESENT', 'ABSENT', 'LATE'],
    default: 'ABSENT'
  },
  // Daily grade/score for the lesson
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  note: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate attendance records
attendanceSchema.index({ student_id: 1, group_id: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
