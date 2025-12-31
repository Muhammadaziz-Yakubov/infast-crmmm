import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  monthly_price: {
    type: Number,
    required: true,
    min: 0
  },
  lessons_per_month: {
    type: Number,
    required: true,
    min: 1
  },
  description: {
    type: String,
    default: ''
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Course', courseSchema);

