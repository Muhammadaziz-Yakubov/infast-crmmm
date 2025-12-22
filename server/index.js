import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { checkPaymentStatus } from './jobs/paymentJob.js';
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import groupRoutes from './routes/groups.js';
import studentRoutes from './routes/students.js';
import leadRoutes from './routes/leads.js';
import paymentRoutes from './routes/payments.js';
import attendanceRoutes from './routes/attendance.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://infastaiuz_db_user:Shodiyona@infast-ai.kuaftll.mongodb.net/infastcrm?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Daily job to check payment status (runs at 9 AM every day)
cron.schedule('0 9 * * *', () => {
  console.log('🔄 Running daily payment status check...');
  checkPaymentStatus();
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

