import express from 'express';
import Payment from '../models/Payment.js';
import Student from '../models/Student.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all payments
router.get('/', authenticate, async (req, res) => {
  try {
    const { student_id, start_date, end_date } = req.query;
    const filter = {};
    if (student_id) filter.student_id = student_id;
    if (start_date || end_date) {
      filter.payment_date = {};
      if (start_date) filter.payment_date.$gte = new Date(start_date);
      if (end_date) filter.payment_date.$lte = new Date(end_date);
    }

    const payments = await Payment.find(filter)
      .populate({
        path: 'student_id',
        populate: { path: 'group_id' }
      })
      .sort({ payment_date: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single payment
router.get('/:id', authenticate, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: 'student_id',
        populate: { path: 'group_id' }
      });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create payment
router.post('/', authenticate, async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();

    // Update student payment dates and status
    const student = await Student.findById(payment.student_id);
    if (student) {
      const paymentDate = new Date(payment.payment_date);
      student.last_payment_date = paymentDate;
      
      // Calculate next payment date (same day next month)
      const paymentDay = paymentDate.getDate();
      const nextPaymentDate = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, paymentDay);

      // If the calculated date is not the expected day (due to month length differences),
      // it means we went to the next month but landed on a different day
      // In this case, use the last day of the target month
      if (nextPaymentDate.getDate() !== paymentDay) {
        // We went past the end of the month, so use the last day of the target month
        const targetYear = paymentDate.getFullYear();
        const targetMonth = paymentDate.getMonth() + 1;
        nextPaymentDate.setFullYear(targetYear, targetMonth + 1, 0); // Last day of target month
      }

      student.next_payment_date = nextPaymentDate;
      
      student.status = 'ACTIVE';
      await student.save();
    }

    await payment.populate({
      path: 'student_id',
      populate: { path: 'group_id' }
    });
    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update payment
router.put('/:id', authenticate, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate({
        path: 'student_id',
        populate: { path: 'group_id' }
      });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Recalculate student payment dates if payment_date changed
    if (req.body.payment_date) {
      const student = await Student.findById(payment.student_id);
      if (student) {
        const paymentDate = new Date(payment.payment_date);
        student.last_payment_date = paymentDate;

        // Calculate next payment date (same day next month)
        const paymentDay = paymentDate.getDate();
        const nextPaymentDate = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, paymentDay);

        // If the calculated date is not the expected day (due to month length differences),
        // it means we went to the next month but landed on a different day
        // In this case, use the last day of the target month
        if (nextPaymentDate.getDate() !== paymentDay) {
          // We went past the end of the month, so use the last day of the target month
          const targetYear = paymentDate.getFullYear();
          const targetMonth = paymentDate.getMonth() + 1;
          nextPaymentDate.setFullYear(targetYear, targetMonth + 1, 0); // Last day of target month
        }

        student.next_payment_date = nextPaymentDate;
        await student.save();
      }
    }

    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete payment
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

