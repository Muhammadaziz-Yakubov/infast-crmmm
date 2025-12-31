import express from 'express';
import Lead from '../models/Lead.js';
import Student from '../models/Student.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all leads
router.get('/', authenticate, async (req, res) => {
  try {
    const { group_id } = req.query;
    const filter = group_id ? { group_id } : {};
    
    const leads = await Lead.find(filter)
      .populate('group_id')
      .sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single lead
router.get('/:id', authenticate, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('group_id');
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create lead
router.post('/', authenticate, async (req, res) => {
  try {
    const lead = new Lead(req.body);
    await lead.save();
    await lead.populate('group_id');
    res.status(201).json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Convert lead to student
router.post('/:id/convert', authenticate, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ 
      phone: lead.phone, 
      group_id: lead.group_id 
    });

    if (existingStudent) {
      return res.status(400).json({ message: 'Student already exists with this phone' });
    }

    // Create student from lead
    const student = new Student({
      full_name: lead.name,
      phone: lead.phone,
      group_id: lead.group_id,
      status: 'ACTIVE'
    });
    await student.save();
    await student.populate('group_id');

    // Delete lead
    await Lead.findByIdAndDelete(lead._id);

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update lead
router.put('/:id', authenticate, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('group_id');
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete lead
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

