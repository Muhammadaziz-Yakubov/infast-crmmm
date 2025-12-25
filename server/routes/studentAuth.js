import express from 'express';
import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import Payment from '../models/Payment.js';
import Attendance from '../models/Attendance.js';
import Group from '../models/Group.js';

const router = express.Router();

// Student Login
router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    console.log('📧 Student login attempt for:', login);
    
    const student = await Student.findOne({ login }).select('+password').populate('group_id');
    if (!student) {
      console.log('❌ Student not found:', login);
      return res.status(401).json({ message: 'Login yoki parol noto\'g\'ri' });
    }

    if (!student.password) {
      return res.status(401).json({ message: 'Parol o\'rnatilmagan' });
    }

    const isMatch = await student.comparePassword(password);
    console.log('🔐 Password match:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: 'Login yoki parol noto\'g\'ri' });
    }

    const token = jwt.sign(
      { studentId: student._id, login: student.login, type: 'student' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('🎉 Student login successful for:', login);
    res.json({ 
      token, 
      student: { 
        id: student._id, 
        full_name: student.full_name, 
        login: student.login,
        group: student.group_id,
        status: student.status,
        next_payment_date: student.next_payment_date
      } 
    });
  } catch (error) {
    console.error('❌ Student login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Student Auth Middleware
const authenticateStudent = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Kirish talab etiladi' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (decoded.type !== 'student') {
      return res.status(401).json({ message: 'Noto\'g\'ri token turi' });
    }

    const student = await Student.findById(decoded.studentId).populate({
      path: 'group_id',
      populate: { path: 'course_id' }
    });
    if (!student) {
      return res.status(401).json({ message: 'O\'quvchi topilmadi' });
    }

    req.student = student;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token yaroqsiz' });
  }
};

// Get student dashboard
router.get('/dashboard', authenticateStudent, async (req, res) => {
  try {
    const student = req.student;

    // Get payment history
    const payments = await Payment.find({ student_id: student._id })
      .sort({ payment_date: -1 })
      .limit(10);

    // Get attendance history
    const attendances = await Attendance.find({ 
      student_id: student._id,
      group_id: student.group_id._id 
    })
      .sort({ date: -1 })
      .limit(30);

    // Calculate attendance stats
    const totalAttendances = attendances.length;
    const presentCount = attendances.filter(a => a.status === 'PRESENT').length;
    const absentCount = attendances.filter(a => a.status === 'ABSENT').length;
    const lateCount = attendances.filter(a => a.status === 'LATE').length;

    // Total payments
    const allPayments = await Payment.find({ student_id: student._id });
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      student: {
        id: student._id,
        full_name: student.full_name,
        phone: student.phone,
        status: student.status,
        joined_date: student.joined_date,
        next_payment_date: student.next_payment_date,
        last_payment_date: student.last_payment_date
      },
      group: {
        id: student.group_id._id,
        name: student.group_id.name,
        course: student.group_id.course_id?.name,
        days: student.group_id.days_of_week,
        time: student.group_id.time,
        status: student.group_id.status
      },
      payments: payments,
      totalPaid,
      attendance: {
        records: attendances,
        stats: {
          total: totalAttendances,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          percentage: totalAttendances > 0 
            ? Math.round((presentCount / totalAttendances) * 100) 
            : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student profile
router.get('/profile', authenticateStudent, async (req, res) => {
  try {
    res.json({
      id: req.student._id,
      full_name: req.student.full_name,
      phone: req.student.phone,
      login: req.student.login,
      group: req.student.group_id,
      status: req.student.status,
      next_payment_date: req.student.next_payment_date
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student payments
router.get('/payments', authenticateStudent, async (req, res) => {
  try {
    const payments = await Payment.find({ student_id: req.student._id })
      .sort({ payment_date: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student attendance
router.get('/attendance', authenticateStudent, async (req, res) => {
  try {
    const attendances = await Attendance.find({ 
      student_id: req.student._id,
      group_id: req.student.group_id._id 
    })
      .sort({ date: -1 });
    res.json(attendances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============ STUDENT TASKS ============
import Task from '../models/Task.js';
import TaskSubmission from '../models/TaskSubmission.js';

// Get tasks for student's group
router.get('/tasks', authenticateStudent, async (req, res) => {
  try {
    const tasks = await Task.find({ 
      group_id: req.student.group_id._id,
      status: 'ACTIVE'
    })
      .populate('group_id')
      .sort({ createdAt: -1 });

    // Get student's submissions
    const submissions = await TaskSubmission.find({ 
      student_id: req.student._id 
    });

    // Add submission status to each task
    const tasksWithStatus = tasks.map(task => {
      const submission = submissions.find(
        s => s.task_id.toString() === task._id.toString()
      );
      return {
        ...task.toObject(),
        submission: submission ? {
          _id: submission._id,
          status: submission.status,
          score: submission.score,
          submitted_at: submission.submitted_at,
          feedback: submission.feedback
        } : null
      };
    });

    res.json(tasksWithStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single task
router.get('/tasks/:id', authenticateStudent, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('group_id');
    if (!task) {
      return res.status(404).json({ message: 'Vazifa topilmadi' });
    }

    // Check if student has already submitted
    const submission = await TaskSubmission.findOne({
      task_id: task._id,
      student_id: req.student._id
    });

    res.json({
      ...task.toObject(),
      submission: submission ? {
        _id: submission._id,
        code: submission.code,
        description: submission.description,
        status: submission.status,
        score: submission.score,
        submitted_at: submission.submitted_at,
        feedback: submission.feedback
      } : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit task
router.post('/tasks/:id/submit', authenticateStudent, async (req, res) => {
  try {
    const { code, description } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Vazifa topilmadi' });
    }

    // Check if already submitted
    const existingSubmission = await TaskSubmission.findOne({
      task_id: task._id,
      student_id: req.student._id
    });

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.code = code;
      existingSubmission.description = description;
      existingSubmission.submitted_at = new Date();
      existingSubmission.status = 'PENDING';
      existingSubmission.score = null;
      existingSubmission.feedback = '';
      await existingSubmission.save();
      return res.json(existingSubmission);
    }

    // Create new submission
    const submission = new TaskSubmission({
      task_id: task._id,
      student_id: req.student._id,
      code,
      description
    });
    await submission.save();

    res.status(201).json(submission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get student's submissions history
router.get('/submissions', authenticateStudent, async (req, res) => {
  try {
    const submissions = await TaskSubmission.find({ student_id: req.student._id })
      .populate('task_id')
      .sort({ submitted_at: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student's rating info
router.get('/my-rating', authenticateStudent, async (req, res) => {
  try {
    // Get all graded submissions for this student
    const submissions = await TaskSubmission.find({ 
      student_id: req.student._id,
      status: 'GRADED'
    });
    const taskScores = submissions.map(s => s.score).filter(s => s !== null);

    // Get attendance scores
    const attendances = await Attendance.find({ 
      student_id: req.student._id,
      score: { $ne: null }
    });
    const attendanceScores = attendances.map(a => a.score);

    // Calculate averages
    const allScores = [...taskScores, ...attendanceScores];
    const averageScore = allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : 0;

    // Get rank among all students
    const allStudents = await Student.find({ status: { $in: ['ACTIVE', 'DEBTOR'] } });
    const allRatings = await Promise.all(allStudents.map(async (student) => {
      const subs = await TaskSubmission.find({ 
        student_id: student._id, 
        status: 'GRADED' 
      });
      const atts = await Attendance.find({ 
        student_id: student._id, 
        score: { $ne: null } 
      });
      const scores = [...subs.map(s => s.score), ...atts.map(a => a.score)].filter(s => s !== null);
      return {
        studentId: student._id.toString(),
        avg: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
      };
    }));

    allRatings.sort((a, b) => b.avg - a.avg);
    const rank = allRatings.findIndex(r => r.studentId === req.student._id.toString()) + 1;

    res.json({
      averageScore,
      taskCount: submissions.length,
      attendanceCount: attendances.length,
      totalAssessments: allScores.length,
      rank,
      totalStudents: allStudents.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

