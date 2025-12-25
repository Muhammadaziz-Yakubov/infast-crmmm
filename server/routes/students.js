import express from 'express';
import Student from '../models/Student.js';
import Group from '../models/Group.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all students
router.get('/', authenticate, async (req, res) => {
  try {
    const { group_id, status } = req.query;
    const filter = {};
    if (group_id) filter.group_id = group_id;
    if (status) filter.status = status;

    const students = await Student.find(filter)
      .populate('group_id')
      .sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single student
router.get('/:id', authenticate, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('group_id');
    if (!student) {
      return res.status(404).json({ message: 'O\'quvchi topilmadi' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if login is unique
router.get('/check-login/:login', authenticate, async (req, res) => {
  try {
    const existing = await Student.findOne({ login: req.params.login });
    res.json({ exists: !!existing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create student (Admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { login, password, ...studentData } = req.body;
    
    // Check if login already exists
    if (login) {
      const existingStudent = await Student.findOne({ login });
      if (existingStudent) {
        return res.status(400).json({ message: 'Bu login allaqachon band' });
      }
    }

    const student = new Student({
      ...studentData,
      login,
      password
    });
    
    await student.save();
    await student.populate('group_id');
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update student (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { login, password, ...updateData } = req.body;
    
    // Check if login already exists for different student
    if (login) {
      const existingStudent = await Student.findOne({ login, _id: { $ne: req.params.id } });
      if (existingStudent) {
        return res.status(400).json({ message: 'Bu login allaqachon band' });
      }
      updateData.login = login;
    }

    // Get current student to update
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'O\'quvchi topilmadi' });
    }

    // Update fields
    Object.assign(student, updateData);
    
    // If password is provided, update it (will be hashed by pre-save hook)
    if (password) {
      student.password = password;
    }

    await student.save();
    await student.populate('group_id');
    
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete student (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'O\'quvchi topilmadi' });
    }
    res.json({ message: 'O\'quvchi o\'chirildi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
