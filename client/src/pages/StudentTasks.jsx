import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileCode, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  Trophy,
  Star,
  BookOpen,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';
import api from '../utils/api';

export default function StudentTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      const response = await api.get('/student-auth/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'from-emerald-400 to-green-500';
    if (score >= 40) return 'from-amber-400 to-orange-500';
    return 'from-red-400 to-rose-500';
  };

  const getScoreLabel = (score) => {
    if (score >= 70) return 'Juda ajoyib!';
    if (score >= 40) return 'Yaxshi';
    return 'Yomon';
  };

  const getStatusBadge = (task) => {
    if (!task.submission) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          Topshirilmagan
        </span>
      );
    }
    if (task.submission.status === 'PENDING') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          Tekshirilmoqda
        </span>
      );
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getScoreColor(task.submission.score)}`}>
        {task.submission.score} ball
      </span>
    );
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleStartTask = () => {
    if (selectedTask) {
      navigate(`/student/code-editor/${selectedTask._id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
          <FileCode className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vazifalar</h1>
          <p className="text-gray-500 dark:text-gray-400">{tasks.length} ta vazifa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks List */}
        <div className="lg:col-span-2 space-y-4">
          {tasks.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-lg">
              <BookOpen className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400">Hozircha vazifalar yo'q</p>
            </div>
          ) : (
            tasks.map((task, index) => (
              <div
                key={task._id}
                onClick={() => handleTaskClick(task)}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all hover:shadow-xl ${
                  selectedTask?._id === task._id ? 'ring-2 ring-orange-500' : ''
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex">
                  {task.image_url && (
                    <div className="w-32 h-32 flex-shrink-0">
                      <img 
                        src={task.image_url} 
                        alt={task.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {task.title}
                      </h3>
                      {getStatusBadge(task)}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                      {task.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar size={14} />
                        <span>{format(new Date(task.createdAt), 'dd MMM yyyy', { locale: uz })}</span>
                      </div>
                      <ChevronRight size={18} className="text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Task Details */}
        <div className="lg:col-span-1">
          {selectedTask ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden sticky top-4">
              {selectedTask.image_url && (
                <img 
                  src={selectedTask.image_url} 
                  alt={selectedTask.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedTask.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {selectedTask.description}
                </p>

                {selectedTask.submission ? (
                  <div className="space-y-4">
                    {selectedTask.submission.status === 'GRADED' ? (
                      <div className={`p-4 rounded-xl bg-gradient-to-r ${getScoreColor(selectedTask.submission.score)} text-white`}>
                        <div className="flex items-center gap-3 mb-2">
                          <Trophy size={24} />
                          <span className="text-2xl font-bold">{selectedTask.submission.score}</span>
                          <span className="text-white/80">/ 100 ball</span>
                        </div>
                        <p className="text-white/90">{getScoreLabel(selectedTask.submission.score)}</p>
                        {selectedTask.submission.feedback && (
                          <p className="text-white/80 text-sm mt-2">
                            Izoh: {selectedTask.submission.feedback}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                          <Clock size={20} />
                          <span className="font-medium">Tekshirilmoqda...</span>
                        </div>
                        <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                          Topshirilgan: {format(new Date(selectedTask.submission.submitted_at), 'dd MMM yyyy HH:mm', { locale: uz })}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={handleStartTask}
                      className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Qayta topshirish
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleStartTask}
                    className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <FileCode size={20} />
                    O'qib bo'ldim, Vazifani bajarish
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-lg">
              <FileCode className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400">
                Vazifani tanlang
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

