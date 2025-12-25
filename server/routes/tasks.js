import express from 'express';
import Task from '../models/Task.js';
import TaskSubmission from '../models/TaskSubmission.js';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all tasks (Admin)
router.get('/', authenticate, async (req, res) => {
  try {
    const { group_id, status } = req.query;
    const filter = {};
    if (group_id) filter.group_id = group_id;
    if (status) filter.status = status;

    const tasks = await Task.find(filter)
      .populate('group_id')
      .populate('created_by', 'full_name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single task
router.get('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('group_id')
      .populate('created_by', 'full_name email');
    if (!task) {
      return res.status(404).json({ message: 'Vazifa topilmadi' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create task (Admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      created_by: req.user.userId
    });
    await task.save();
    await task.populate('group_id');
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update task (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('group_id');
    if (!task) {
      return res.status(404).json({ message: 'Vazifa topilmadi' });
    }
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete task (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Vazifa topilmadi' });
    }
    // Also delete all submissions for this task
    await TaskSubmission.deleteMany({ task_id: req.params.id });
    res.json({ message: 'Vazifa o\'chirildi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============ SUBMISSIONS ============

// Get all submissions (Admin - for grading)
router.get('/submissions/all', authenticate, async (req, res) => {
  try {
    const { task_id, group_id, status } = req.query;
    const filter = {};
    if (task_id) filter.task_id = task_id;
    if (status) filter.status = status;

    let submissions = await TaskSubmission.find(filter)
      .populate({
        path: 'task_id',
        populate: { path: 'group_id' }
      })
      .populate('student_id', 'full_name phone group_id')
      .populate('graded_by', 'full_name')
      .sort({ submitted_at: -1 });

    // Filter by group if needed
    if (group_id) {
      submissions = submissions.filter(s => 
        s.task_id?.group_id?._id?.toString() === group_id
      );
    }

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get submission by ID
router.get('/submissions/:id', authenticate, async (req, res) => {
  try {
    const submission = await TaskSubmission.findById(req.params.id)
      .populate({
        path: 'task_id',
        populate: { path: 'group_id' }
      })
      .populate('student_id', 'full_name phone')
      .populate('graded_by', 'full_name');
    
    if (!submission) {
      return res.status(404).json({ message: 'Topshiriq topilmadi' });
    }
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Grade a submission (Admin only)
router.put('/submissions/:id/grade', authenticate, requireAdmin, async (req, res) => {
  try {
    const { score, feedback } = req.body;
    
    if (score < 0 || score > 100) {
      return res.status(400).json({ message: 'Ball 0-100 orasida bo\'lishi kerak' });
    }

    const submission = await TaskSubmission.findByIdAndUpdate(
      req.params.id,
      {
        score,
        feedback,
        status: 'GRADED',
        graded_at: new Date(),
        graded_by: req.user.userId
      },
      { new: true }
    )
      .populate('task_id')
      .populate('student_id', 'full_name')
      .populate('graded_by', 'full_name');

    if (!submission) {
      return res.status(404).json({ message: 'Topshiriq topilmadi' });
    }

    res.json(submission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ============ RATINGS ============

// Get student ratings (all students ranked by average score)
router.get('/ratings/students', authenticate, async (req, res) => {
  try {
    // Get all students with their groups
    const students = await Student.find({ status: { $in: ['ACTIVE', 'DEBTOR'] } })
      .populate('group_id')
      .select('full_name phone group_id status');

    // Get all graded submissions
    const submissions = await TaskSubmission.find({ status: 'GRADED' });

    // Get all attendance records with scores
    const attendances = await Attendance.find({ 
      score: { $ne: null } 
    });

    // Calculate average score for each student
    const ratings = students.map(student => {
      // Task submissions scores
      const studentSubmissions = submissions.filter(
        s => s.student_id.toString() === student._id.toString()
      );
      const taskScores = studentSubmissions.map(s => s.score).filter(s => s !== null);
      
      // Attendance scores
      const studentAttendances = attendances.filter(
        a => a.student_id.toString() === student._id.toString()
      );
      const attendanceScores = studentAttendances.map(a => a.score).filter(s => s !== null);

      // Combine all scores
      const allScores = [...taskScores, ...attendanceScores];
      const averageScore = allScores.length > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 0;

      return {
        student: {
          _id: student._id,
          full_name: student.full_name,
          phone: student.phone,
          group: student.group_id,
          status: student.status
        },
        taskCount: studentSubmissions.length,
        attendanceCount: studentAttendances.length,
        averageScore,
        totalAssessments: allScores.length
      };
    });

    // Sort by average score (descending)
    ratings.sort((a, b) => b.averageScore - a.averageScore);

    // Add rank
    const rankedRatings = ratings.map((r, index) => ({
      ...r,
      rank: index + 1
    }));

    res.json(rankedRatings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

