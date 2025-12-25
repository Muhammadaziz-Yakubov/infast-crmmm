import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Plus, Edit, Trash2, X, Play, Users, Clock, Calendar, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [activatingGroup, setActivatingGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [formData, setFormData] = useState({
    course_id: '',
    name: '',
    status: 'NABOR',
    start_date: '',
    days_of_week: [],
    time: '',
    min_students: 3,
    max_students: 15
  });

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayLabels = {
    Mon: 'Du',
    Tue: 'Se',
    Wed: 'Ch',
    Thu: 'Pa',
    Fri: 'Ju',
    Sat: 'Sh',
    Sun: 'Ya'
  };
  const dayLabelsFull = {
    Mon: 'Dushanba',
    Tue: 'Seshanba',
    Wed: 'Chorshanba',
    Thu: 'Payshanba',
    Fri: 'Juma',
    Sat: 'Shanba',
    Sun: 'Yakshanba'
  };

  useEffect(() => {
    fetchCourses();
    fetchGroups();
  }, [statusFilter]);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data.filter(c => c.is_active));
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      let filtered = response.data;
      if (statusFilter) {
        filtered = filtered.filter(g => g.status === statusFilter);
      }
      setGroups(filtered);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await api.put(`/groups/${editingGroup._id}`, formData);
      } else {
        await api.post('/groups', formData);
      }
      setShowModal(false);
      setEditingGroup(null);
      resetForm();
      fetchGroups();
    } catch (error) {
      console.error('Error saving group:', error);
      alert(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleActivate = async () => {
    try {
      await api.post(`/groups/${activatingGroup._id}/activate`, {
        start_date: formData.start_date
      });
      setShowActivateModal(false);
      setActivatingGroup(null);
      resetForm();
      fetchGroups();
    } catch (error) {
      console.error('Error activating group:', error);
      alert(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setFormData({
      course_id: group.course_id._id || group.course_id,
      name: group.name,
      status: group.status,
      start_date: group.start_date ? format(new Date(group.start_date), 'yyyy-MM-dd') : '',
      days_of_week: group.days_of_week || [],
      time: group.time || '',
      min_students: group.min_students || 3,
      max_students: group.max_students || 15
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Guruhni o\'chirishni tasdiqlaysizmi?')) return;
    try {
      await api.delete(`/groups/${id}`);
      fetchGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      alert(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const resetForm = () => {
    setFormData({
      course_id: '',
      name: '',
      status: 'NABOR',
      start_date: '',
      days_of_week: [],
      time: '',
      min_students: 3,
      max_students: 15
    });
  };

  const toggleDay = (day) => {
    setFormData({
      ...formData,
      days_of_week: formData.days_of_week.includes(day)
        ? formData.days_of_week.filter(d => d !== day)
        : [...formData.days_of_week, day]
    });
  };

  const getStatusGradient = (status) => {
    switch (status) {
      case 'ACTIVE': return 'from-emerald-400 to-green-500';
      case 'NABOR': return 'from-amber-400 to-orange-500';
      case 'CLOSED': return 'from-gray-400 to-gray-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ACTIVE': return 'Faol';
      case 'NABOR': return 'Nabor';
      case 'CLOSED': return 'Yopilgan';
      default: return status;
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Guruhlar</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Jami: {groups.length} ta guruh
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                setEditingGroup(null);
                resetForm();
                setShowModal(true);
              }}
              className="btn-primary flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold whitespace-nowrap"
            >
              <Plus size={20} />
              Yangi guruh
            </button>
          )}
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.map((group, index) => (
          <div 
            key={group._id} 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden card-hover animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={`h-2 bg-gradient-to-r ${getStatusGradient(group.status)}`}></div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {group.name}
                  </h3>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">
                    {group.course_id?.name || 'Noma\'lum'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getStatusGradient(group.status)}`}>
                  {getStatusLabel(group.status)}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                {group.time && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock size={16} className="text-indigo-500" />
                    <span>{group.time}</span>
                  </div>
                )}
                {group.days_of_week.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} className="text-indigo-500" />
                    <div className="flex gap-1">
                      {days.map(day => (
                        <span
                          key={day}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium ${
                            group.days_of_week.includes(day)
                              ? 'bg-indigo-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                          }`}
                        >
                          {dayLabels[day]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <Link
                  to={`/students?group_id=${group._id}`}
                  className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-500"
                >
                  <Users size={16} />
                  <span>O'quvchilar</span>
                </Link>
                <div className="flex items-center gap-1">
                  {group.status === 'NABOR' && isAdmin && (
                    <button
                      onClick={() => {
                        setActivatingGroup(group);
                        setFormData({ ...formData, start_date: '' });
                        setShowActivateModal(true);
                      }}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                      title="Faollashtirish"
                    >
                      <Play size={18} />
                    </button>
                  )}
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleEdit(group)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(group._id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <Users className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
          <p className="text-gray-500 dark:text-gray-400">Guruhlar topilmadi</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-fade-in-up max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingGroup ? 'Guruhni tahrirlash' : 'Yangi guruh'}
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
                  Kurs *
                </label>
                <select
                  value={formData.course_id}
                  onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                >
                  <option value="">Kursni tanlang</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>{course.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Guruh nomi *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                  placeholder="Masalan: Frontend-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dars vaqti
                </label>
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  placeholder="14:00-16:00"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dars kunlari
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {days.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`py-3 rounded-xl border-2 transition-all font-medium ${
                        formData.days_of_week.includes(day)
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-indigo-300'
                      }`}
                    >
                      {dayLabelsFull[day].substring(0, 2)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Min o'quvchilar
                  </label>
                  <input
                    type="number"
                    value={formData.min_students}
                    onChange={(e) => setFormData({ ...formData, min_students: parseInt(e.target.value) })}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max o'quvchilar
                  </label>
                  <input
                    type="number"
                    value={formData.max_students}
                    onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) })}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
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
                  className="flex-1 btn-primary px-4 py-3 rounded-xl font-medium"
                >
                  {editingGroup ? 'Saqlash' : 'Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activate Modal */}
      {showActivateModal && activatingGroup && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Guruhni faollashtirish
              </h2>
              <button
                onClick={() => setShowActivateModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl mb-4">
              <p className="text-indigo-700 dark:text-indigo-300">
                <strong>{activatingGroup.name}</strong> guruhini faollashtirishni tasdiqlaysizmi?
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Boshlanish sanasi *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowActivateModal(false)}
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleActivate}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-xl font-medium shadow-lg"
              >
                Faollashtirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
