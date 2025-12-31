import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  FileCode, 
  Search,
  Eye,
  CheckCircle,
  Clock,
  Trophy,
  Image,
  Users,
  Star
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminTasks() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    group_id: '',
    max_score: 100
  });

  const [gradeData, setGradeData] = useState({
    score: '',
    feedback: ''
  });

  useEffect(() => {
    fetchGroups();
    fetchTasks();
    fetchSubmissions();
  }, [groupFilter]);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const params = groupFilter ? { group_id: groupFilter } : {};
      const response = await api.get('/tasks', { params });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const params = groupFilter ? { group_id: groupFilter } : {};
      const response = await api.get('/tasks/submissions/all', { params });
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, formData);
      } else {
        await api.post('/tasks', formData);
      }
      setShowModal(false);
      setEditingTask(null);
      resetForm();
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      alert(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleGrade = async () => {
    try {
      await api.put(`/tasks/submissions/${selectedSubmission._id}/grade`, {
        score: parseInt(gradeData.score),
        feedback: gradeData.feedback
      });
      setShowGradeModal(false);
      setSelectedSubmission(null);
      setGradeData({ score: '', feedback: '' });
      fetchSubmissions();
    } catch (error) {
      console.error('Error grading:', error);
      alert(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      image_url: task.image_url || '',
      group_id: task.group_id._id || task.group_id,
      max_score: task.max_score
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Vazifani o\'chirishni tasdiqlaysizmi?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      group_id: '',
      max_score: 100
    });
  };

  const openGradeModal = (submission) => {
    setSelectedSubmission(submission);
    setGradeData({
      score: submission.score || '',
      feedback: submission.feedback || ''
    });
    setShowGradeModal(true);
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'from-emerald-400 to-green-500';
    if (score >= 40) return 'from-amber-400 to-orange-500';
    return 'from-red-400 to-rose-500';
  };

  const getScoreLabel = (score) => {
    if (score >= 70) return 'Juda ajoyib';
    if (score >= 40) return 'Yaxshi';
    return 'Yomon';
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'PENDING');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Vazifalar
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {tasks.length} ta vazifa • {pendingSubmissions.length} ta tekshirilmagan
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
          >
            <option value="">Barcha guruhlar</option>
            {groups.map(group => (
              <option key={group._id} value={group._id}>{group.name}</option>
            ))}
          </select>

          {isAdmin && (
            <button
              onClick={() => {
                setEditingTask(null);
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
            >
              <Plus size={20} />
              Yangi vazifa
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'tasks'
              ? 'text-orange-500 border-b-2 border-orange-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileCode size={18} />
            Vazifalar
          </div>
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'submissions'
              ? 'text-orange-500 border-b-2 border-orange-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle size={18} />
            Topshiriqlar
            {pendingSubmissions.length > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {pendingSubmissions.length}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task, index) => (
            <div 
              key={task._id} 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden card-hover animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {task.image_url && (
                <img 
                  src={task.image_url} 
                  alt={task.title}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {task.title}
                  </h3>
                  <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg text-xs">
                    {task.max_score} ball
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                  {task.description}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Users size={14} />
                    {task.group_id?.name}
                  </span>
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(task)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
              <FileCode className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400">Vazifalar topilmadi</p>
            </div>
          )}
        </div>
      )}

      {/* Submissions Tab */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {submissions.map((submission, index) => (
            <div 
              key={submission._id} 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {submission.student_id?.full_name}
                    </h3>
                    {submission.status === 'PENDING' ? (
                      <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-xs flex items-center gap-1">
                        <Clock size={12} />
                        Tekshirilmagan
                      </span>
                    ) : (
                      <span className={`px-2 py-1 rounded-lg text-xs text-white bg-gradient-to-r ${getScoreColor(submission.score)} flex items-center gap-1`}>
                        <Star size={12} />
                        {submission.score} ball - {getScoreLabel(submission.score)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">{submission.task_id?.title}</span>
                    {' • '}
                    {submission.task_id?.group_id?.name}
                    {' • '}
                    {format(new Date(submission.submitted_at), 'dd.MM.yyyy HH:mm')}
                  </p>
                  {submission.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                      "{submission.description}"
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openGradeModal(submission)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                      submission.status === 'PENDING'
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    <Eye size={16} />
                    {submission.status === 'PENDING' ? 'Baholash' : 'Ko\'rish'}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {submissions.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
              <CheckCircle className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400">Topshiriqlar topilmadi</p>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Task Modal */}
      {showModal && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-fade-in-up max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingTask ? 'Vazifani tahrirlash' : 'Yangi vazifa'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vazifa nomi *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                  placeholder="Masalan: HTML button yaratish"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tavsif *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all resize-none"
                  placeholder="Vazifa haqida batafsil ma'lumot..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rasm URL (ixtiyoriy)
                </label>
                <div className="relative">
                  <Image size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Guruh *
                  </label>
                  <select
                    value={formData.group_id}
                    onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                  >
                    <option value="">Tanlang</option>
                    {groups.map(group => (
                      <option key={group._id} value={group._id}>{group.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Maksimal ball
                  </label>
                  <input
                    type="number"
                    value={formData.max_score}
                    onChange={(e) => setFormData({ ...formData, max_score: parseInt(e.target.value) })}
                    min="1"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  {editingTask ? 'Saqlash' : 'Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {showGradeModal && selectedSubmission && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-fade-in-up max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Vazifani baholash
              </h2>
              <button
                onClick={() => setShowGradeModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <FileCode className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedSubmission.student_id?.full_name}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedSubmission.task_id?.title}</p>
                </div>
              </div>

              {/* Code Preview */}
              <div className="bg-gray-900 rounded-xl overflow-hidden mb-4">
                <div className="px-4 py-2 bg-gray-800 text-gray-400 text-sm flex items-center gap-2">
                  <Code size={16} />
                  Kod
                </div>
                <pre className="p-4 text-sm text-gray-100 overflow-x-auto max-h-60">
                  <code>{selectedSubmission.code}</code>
                </pre>
              </div>

              {selectedSubmission.description && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">O'quvchi izohi:</span> {selectedSubmission.description}
                  </p>
                </div>
              )}
            </div>

            {isAdmin && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ball (0-100)
                  </label>
                  <div className="flex gap-2">
                    {[0, 25, 40, 50, 70, 85, 100].map(score => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setGradeData({ ...gradeData, score: score.toString() })}
                        className={`px-3 py-2 rounded-lg font-medium transition-all ${
                          parseInt(gradeData.score) === score
                            ? `text-white bg-gradient-to-r ${getScoreColor(score)}`
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={gradeData.score}
                    onChange={(e) => setGradeData({ ...gradeData, score: e.target.value })}
                    min="0"
                    max="100"
                    className="w-full mt-2 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    placeholder="Yoki o'zingiz kiriting..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Izoh (ixtiyoriy)
                  </label>
                  <textarea
                    value={gradeData.feedback}
                    onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all resize-none"
                    placeholder="O'quvchiga izoh yozing..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowGradeModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={handleGrade}
                    disabled={!gradeData.score}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    <Trophy className="inline mr-2" size={18} />
                    Baholash
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

