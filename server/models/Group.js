import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['NABOR', 'ACTIVE', 'CLOSED'],
    default: 'NABOR'
  },
  start_date: {
    type: Date,
    required: function() {
      return this.status === 'ACTIVE';
    }
  },
  days_of_week: {
    type: [String],
    enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    default: []
  },
  time: {
    type: String,
    default: '' // Format: "14:00-16:00"
  },
  min_students: {
    type: Number,
    default: 3,
    min: 1
  },
  max_students: {
    type: Number,
    default: 15,
    min: 1
  }
}, {
  timestamps: true
});

export default mongoose.model('Group', groupSchema);

