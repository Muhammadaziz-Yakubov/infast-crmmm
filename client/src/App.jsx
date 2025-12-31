import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';
import StudentTasks from './pages/StudentTasks';
import StudentCodeEditor from './pages/StudentCodeEditor';
import StudentRating from './pages/StudentRating';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Groups from './pages/Groups';
import Students from './pages/Students';
import Leads from './pages/Leads';
import Payments from './pages/Payments';
import Attendance from './pages/Attendance';
import Staff from './pages/Staff';
import AdminTasks from './pages/AdminTasks';
import Rating from './pages/Rating';
import Layout from './components/Layout';

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check admin-only routes
  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/" />;
  }
  
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/student-login" element={<StudentLogin />} />
      
      {/* Student Routes */}
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/student/tasks" element={<StudentTasks />} />
      <Route path="/student/code-editor/:taskId" element={<StudentCodeEditor />} />
      <Route path="/student/rating" element={<StudentRating />} />
      
      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="courses" element={
          <PrivateRoute adminOnly>
            <Courses />
          </PrivateRoute>
        } />
        <Route path="groups" element={<Groups />} />
        <Route path="students" element={<Students />} />
        <Route path="leads" element={
          <PrivateRoute adminOnly>
            <Leads />
          </PrivateRoute>
        } />
        <Route path="payments" element={<Payments />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="staff" element={
          <PrivateRoute adminOnly>
            <Staff />
          </PrivateRoute>
        } />
        <Route path="tasks" element={<AdminTasks />} />
        <Route path="rating" element={<Rating />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
