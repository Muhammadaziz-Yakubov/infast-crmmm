import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  group_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  lead_status: {
    type: String,
    enum: ['INTERESTED', 'REGISTERED', 'CONFIRMED'],
    default: 'INTERESTED'
  }
}, {
  timestamps: true
});

export default mongoose.model('Lead', leadSchema);

