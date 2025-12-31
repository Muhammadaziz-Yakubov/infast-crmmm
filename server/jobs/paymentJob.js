import Student from '../models/Student.js';

export const checkPaymentStatus = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    // Find students whose payment is due today
    const dueToday = await Student.find({
      next_payment_date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      },
      status: { $ne: 'STOPPED' }
    });

    // Find students who are debtors (payment overdue by more than 3 days)
    const debtors = await Student.find({
      next_payment_date: { $lt: threeDaysLater },
      status: { $nin: ['STOPPED', 'DEBTOR'] }
    });

    // Update status to DEBTOR for overdue students
    if (debtors.length > 0) {
      await Student.updateMany(
        { _id: { $in: debtors.map(s => s._id) } },
        { $set: { status: 'DEBTOR' } }
      );
      console.log(`✅ Updated ${debtors.length} students to DEBTOR status`);
    }

    console.log(`📊 Payment check completed. ${dueToday.length} payments due today.`);
  } catch (error) {
    console.error('❌ Error in payment status check:', error);
  }
};

