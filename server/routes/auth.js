import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Register (for initial admin setup)
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Foydalanuvchi allaqachon mavjud' });
    }

    const user = new User({ email, password, full_name, role: 'ADMIN' });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        full_name: user.full_name,
        role: user.role 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('📧 Login attempt for:', email);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ message: 'Email yoki parol noto\'g\'ri' });
    }

    // Check if user is active
    if (user.status === 'INACTIVE') {
      return res.status(401).json({ message: 'Hisobingiz faol emas' });
    }

    console.log('✅ User found:', user.email);

    const isMatch = await user.comparePassword(password);
    console.log('🔐 Password match:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email yoki parol noto\'g\'ri' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('🎉 Login successful for:', email, 'Role:', user.role);
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        full_name: user.full_name,
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token yo\'q' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Token yaroqsiz' });
  }
});

export default router;
