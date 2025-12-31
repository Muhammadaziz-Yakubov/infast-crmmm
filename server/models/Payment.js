import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  payment_date: {
    type: Date,
    default: Date.now
  },
  payment_type: {
    type: String,
    enum: ['CASH', 'CARD', 'CLICK', 'PAYME'],
    default: 'CASH'
  },
  note: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('Payment', paymentSchema);

