import express from 'express';
import User from '../models/User.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all staff members (Admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const staff = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single staff member
router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const staff = await User.findById(req.params.id).select('-password');
    if (!staff) {
      return res.status(404).json({ message: 'Xodim topilmadi' });
    }
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new staff member (Admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { email, password, full_name, role } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu email allaqachon ro\'yxatdan o\'tgan' });
    }

    const user = new User({
      email,
      password,
      full_name,
      role: role || 'MANAGER',
      status: 'ACTIVE'
    });

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update staff member (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { email, password, full_name, role, status } = req.body;
    const updateData = { email, full_name, role, status };

    // If password provided, include it (will be hashed by pre-save hook)
    if (password) {
      updateData.password = password;
    }

    // Need to use findById + save to trigger pre-save hook for password hashing
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Xodim topilmadi' });
    }

    // Prevent changing your own role from ADMIN
    if (req.user.userId === req.params.id && role !== 'ADMIN') {
      return res.status(400).json({ message: 'O\'z rolini o\'zgartirib bo\'lmaydi' });
    }

    Object.assign(user, updateData);
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete staff member (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    // Prevent deleting yourself
    if (req.user.userId === req.params.id) {
      return res.status(400).json({ message: 'O\'zingizni o\'chirib bo\'lmaydi' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Xodim topilmadi' });
    }

    res.json({ message: 'Xodim o\'chirildi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

