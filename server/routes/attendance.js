import express from 'express';
import Attendance from '../models/Attendance.js';
import Group from '../models/Group.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all attendance records
router.get('/', authenticate, async (req, res) => {
  try {
    const { group_id, student_id, date } = req.query;
    const filter = {};
    if (group_id) filter.group_id = group_id;
    if (student_id) filter.student_id = student_id;
    if (date) {
      const dateObj = new Date(date);
      const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
      const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const attendance = await Attendance.find(filter)
      .populate('student_id')
      .populate('group_id')
      .sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single attendance record
router.get('/:id', authenticate, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('student_id')
      .populate('group_id');
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update attendance
router.post('/', authenticate, async (req, res) => {
  try {
    // Check if group is ACTIVE
    const group = await Group.findById(req.body.group_id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    if (group.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Attendance can only be recorded for ACTIVE groups' });
    }

    // Try to find existing record
    const existing = await Attendance.findOne({
      student_id: req.body.student_id,
      group_id: req.body.group_id,
      date: new Date(req.body.date)
    });

    let attendance;
    if (existing) {
      // Update existing
      attendance = await Attendance.findByIdAndUpdate(
        existing._id,
        req.body,
        { new: true, runValidators: true }
      );
    } else {
      // Create new
      attendance = new Attendance(req.body);
      await attendance.save();
    }

    await attendance.populate('student_id');
    await attendance.populate('group_id');
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update attendance
router.put('/:id', authenticate, async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('student_id')
      .populate('group_id');
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete attendance
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

