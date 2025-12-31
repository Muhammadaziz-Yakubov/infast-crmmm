import express from 'express';
import Group from '../models/Group.js';
import Student from '../models/Student.js';
import Lead from '../models/Lead.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all groups
router.get('/', authenticate, async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('course_id')
      .sort({ createdAt: -1 });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single group
router.get('/:id', authenticate, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('course_id');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create group
router.post('/', authenticate, async (req, res) => {
  try {
    const group = new Group(req.body);
    await group.save();
    await group.populate('course_id');
    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update group
router.put('/:id', authenticate, async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('course_id');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.json(group);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Activate group (NABOR → ACTIVE)
router.post('/:id/activate', authenticate, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.status !== 'NABOR') {
      return res.status(400).json({ message: 'Group is not in NABOR status' });
    }

    // Count students in group
    const studentCount = await Student.countDocuments({ group_id: group._id });
    
    if (studentCount < group.min_students) {
      return res.status(400).json({ 
        message: `Minimum ${group.min_students} students required. Current: ${studentCount}` 
      });
    }

    if (!req.body.start_date) {
      return res.status(400).json({ message: 'start_date is required' });
    }

    // Update group status
    group.status = 'ACTIVE';
    group.start_date = new Date(req.body.start_date);
    await group.save();

    // Convert all leads to students
    const leads = await Lead.find({ group_id: group._id });
    for (const lead of leads) {
      const existingStudent = await Student.findOne({ 
        phone: lead.phone, 
        group_id: group._id 
      });
      
      if (!existingStudent) {
        const student = new Student({
          full_name: lead.name,
          phone: lead.phone,
          group_id: group._id,
          status: 'ACTIVE'
        });
        await student.save();
      }
    }

    await group.populate('course_id');
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete group
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

