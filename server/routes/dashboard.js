import express from 'express';
import Group from '../models/Group.js';
import Student from '../models/Student.js';
import Payment from '../models/Payment.js';
import Attendance from '../models/Attendance.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    // Today's classes (ACTIVE groups with today in days_of_week)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayDayName = dayNames[today.getDay()];
    const activeGroups = await Group.find({ status: 'ACTIVE' });
    const todaysGroups = activeGroups.filter(group => 
      group.days_of_week.includes(todayDayName)
    );

    // Students with payment due today
    const paymentsDueToday = await Student.find({
      next_payment_date: {
        $gte: today,
        $lt: tomorrow
      },
      status: { $ne: 'STOPPED' }
    }).populate('group_id');

    // Debtors
    const debtors = await Student.find({
      next_payment_date: { $lt: threeDaysLater },
      status: 'DEBTOR'
    }).populate('group_id');

    // Monthly revenue (current month)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const monthlyPayments = await Payment.find({
      payment_date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);

    // Active groups count
    const activeGroupsCount = await Group.countDocuments({ status: 'ACTIVE' });

    // Nabor groups count
    const naborGroupsCount = await Group.countDocuments({ status: 'NABOR' });

    // Total active students
    const activeStudentsCount = await Student.countDocuments({ status: 'ACTIVE' });

    res.json({
      todaysGroups: todaysGroups.length,
      todaysGroupsList: todaysGroups,
      paymentsDueToday: paymentsDueToday.length,
      paymentsDueTodayList: paymentsDueToday,
      debtorsCount: debtors.length,
      debtorsList: debtors,
      monthlyRevenue,
      activeGroupsCount,
      naborGroupsCount,
      activeStudentsCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

