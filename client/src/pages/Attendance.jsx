import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { Calendar, CheckCircle, XCircle, Clock, Users, Check, X as XIcon, AlertCircle, Star } from 'lucide-react';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [searchParams] = useSearchParams();
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoringStudent, setScoringStudent] = useState(null);
  const [score, setScore] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const groupParam = searchParams.get('group_id');
    const dateParam = searchParams.get('date');
    if (groupParam) setSelectedGroup(groupParam);
    if (dateParam) setSelectedDate(dateParam);
    
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchStudents();
      fetchAttendance();
    }
  }, [selectedGroup, selectedDate]);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      setGroups(response.data.filter(g => g.status === 'ACTIVE'));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!selectedGroup) return;
    try {
      const response = await api.get('/students', { params: { group_id: selectedGroup } });
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAttendance = async () => {
    if (!selectedGroup || !selectedDate) return;
    try {
      const response = await api.get('/attendance', {
        params: { group_id: selectedGroup, date: selectedDate }
      });
      setAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleAttendanceChange = async (studentId, status) => {
    try {
      await api.post('/attendance', {
        student_id: studentId,
        group_id: selectedGroup,
        date: selectedDate,
        status
      });
      fetchAttendance();
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleScoreSave = async () => {
    if (!scoringStudent || score === '') return;
    try {
      const existingRecord = attendance.find(
        a => (a.student_id._id || a.student_id) === scoringStudent._id
      );
      
      if (existingRecord) {
        await api.put(`/attendance/${existingRecord._id}`, {
          score: parseInt(score)
        });
      } else {
        await api.post('/attendance', {
          student_id: scoringStudent._id,
          group_id: selectedGroup,
          date: selectedDate,
          status: 'PRESENT',
          score: parseInt(score)
        });
      }
      setShowScoreModal(false);
      setScoringStudent(null);
      setScore('');
      fetchAttendance();
    } catch (error) {
      console.error('Error saving score:', error);
      alert(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const openScoreModal = (student) => {
    const record = attendance.find(
      a => (a.student_id._id || a.student_id) === student._id
    );
    setScoringStudent(student);
    setScore(record?.score?.toString() || '');
    setShowScoreModal(true);
  };

  const getAttendanceStatus = (studentId) => {
    const record = attendance.find(a => a.student_id._id === studentId || a.student_id === studentId);
    return record?.status || null;
  };

  const getAttendanceScore = (studentId) => {
    const record = attendance.find(a => a.student_id._id === studentId || a.student_id === studentId);
    return record?.score;
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (score >= 40) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  };

  const stats = {
    present: attendance.filter(a => a.status === 'PRESENT').length,
    late: attendance.filter(a => a.status === 'LATE').length,
    absent: students.length - attendance.filter(a => a.status !== 'ABSENT').length
  };

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
          <h1 className="text-3xl font-bold gradient-text">Davomat</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {format(new Date(selectedDate), "d MMMM yyyy, EEEE", { locale: uz })}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Guruh
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value);
              }}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
            >
              <option value="">Guruhni tanlang</option>
              {groups.map(group => (
                <option key={group._id} value={group._id}>{group.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sana
            </label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {selectedGroup && students.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                <CheckCircle className="text-white" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.present}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Keldi</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Clock className="text-white" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.late}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Kechikdi</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center">
                <XCircle className="text-white" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.absent}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Kelmadi</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance List */}
      {selectedGroup && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                <Users className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {groups.find(g => g._id === selectedGroup)?.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {students.length} ta o'quvchi
                </p>
              </div>
            </div>
          </div>

          {students.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400">Bu guruhda o'quvchilar yo'q</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {students.map((student, index) => {
                const currentStatus = getAttendanceStatus(student._id);
                return (
                  <div
                    key={student._id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          currentStatus === 'PRESENT' 
                            ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                            : currentStatus === 'LATE'
                            ? 'bg-amber-100 dark:bg-amber-900/30'
                            : currentStatus === 'ABSENT'
                            ? 'bg-red-100 dark:bg-red-900/30'
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          {currentStatus === 'PRESENT' && <CheckCircle className="text-emerald-500" size={20} />}
                          {currentStatus === 'LATE' && <Clock className="text-amber-500" size={20} />}
                          {currentStatus === 'ABSENT' && <XCircle className="text-red-500" size={20} />}
                          {!currentStatus && <AlertCircle className="text-gray-400" size={20} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {student.full_name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {student.phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        {/* Score Badge */}
                        {getAttendanceScore(student._id) !== undefined && getAttendanceScore(student._id) !== null && (
                          <span className={`px-3 py-2 rounded-xl text-sm font-bold ${getScoreColor(getAttendanceScore(student._id))}`}>
                            {getAttendanceScore(student._id)} ball
                          </span>
                        )}
                        
                        {/* Score Button (Admin only) */}
                        {isAdmin && (
                          <button
                            onClick={() => openScoreModal(student)}
                            className="px-3 py-2 rounded-xl text-sm font-medium bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all"
                            title="Ball qo'yish"
                          >
                            <Star size={18} />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleAttendanceChange(student._id, 'PRESENT')}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            currentStatus === 'PRESENT'
                              ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-lg'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                          }`}
                        >
                          <span className="hidden sm:inline">Keldi</span>
                          <Check size={18} className="sm:hidden" />
                        </button>
                        <button
                          onClick={() => handleAttendanceChange(student._id, 'LATE')}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            currentStatus === 'LATE'
                              ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                          }`}
                        >
                          <span className="hidden sm:inline">Kechikdi</span>
                          <Clock size={18} className="sm:hidden" />
                        </button>
                        <button
                          onClick={() => handleAttendanceChange(student._id, 'ABSENT')}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            currentStatus === 'ABSENT'
                              ? 'bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-lg'
                              : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                          }`}
                        >
                          <span className="hidden sm:inline">Kelmadi</span>
                          <XIcon size={18} className="sm:hidden" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!selectedGroup && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-indigo-500" size={40} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Guruhni tanlang
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Davomatni belgilash uchun yuqoridagi ro'yxatdan guruhni tanlang
          </p>
        </div>
      )}

      {/* Score Modal */}
      {showScoreModal && scoringStudent && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up max-h-[calc(100vh-2rem)] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Ball qo'yish
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {scoringStudent.full_name}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ball (0-100)
              </label>
              <div className="flex gap-2 mb-3">
                {[0, 25, 40, 50, 70, 85, 100].map(s => (
                  <button
                    key={s}
                    onClick={() => setScore(s.toString())}
                    className={`px-3 py-2 rounded-lg font-medium transition-all ${
                      parseInt(score) === s
                        ? `text-white ${s >= 70 ? 'bg-emerald-500' : s >= 40 ? 'bg-amber-500' : 'bg-red-500'}`
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                min="0"
                max="100"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                placeholder="Yoki o'zingiz kiriting..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowScoreModal(false);
                  setScoringStudent(null);
                  setScore('');
                }}
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleScoreSave}
                disabled={score === ''}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
