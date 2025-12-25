import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Calendar, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  LogOut,
  User,
  BookOpen,
  TrendingUp,
  Moon,
  Sun,
  History,
  Wallet,
  FileCode,
  Trophy,
  Star,
  ChevronRight
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { uz } from 'date-fns/locale';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('studentToken');
    if (!token) {
      navigate('/student-login');
      return;
    }
    fetchDashboard();
  }, [navigate]);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      const response = await api.get('/student-auth/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentData');
    navigate('/student-login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'from-emerald-400 to-green-500';
      case 'DEBTOR': return 'from-red-400 to-rose-500';
      case 'STOPPED': return 'from-gray-400 to-gray-500';
      case 'LEAD': return 'from-amber-400 to-orange-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ACTIVE': return 'Faol';
      case 'DEBTOR': return 'Qarzdor';
      case 'STOPPED': return 'To\'xtatilgan';
      case 'LEAD': return 'Nabor';
      default: return status;
    }
  };

  const getAttendanceIcon = (status) => {
    switch (status) {
      case 'PRESENT': return <CheckCircle2 className="text-emerald-500" size={18} />;
      case 'ABSENT': return <XCircle className="text-red-500" size={18} />;
      case 'LATE': return <AlertCircle className="text-amber-500" size={18} />;
      default: return null;
    }
  };

  const getAttendanceLabel = (status) => {
    switch (status) {
      case 'PRESENT': return 'Keldi';
      case 'ABSENT': return 'Kelmadi';
      case 'LATE': return 'Kechikdi';
      default: return status;
    }
  };

  const getPaymentTypeLabel = (type) => {
    switch (type) {
      case 'CASH': return 'Naqd';
      case 'CARD': return 'Karta';
      case 'CLICK': return 'Click';
      case 'PAYME': return 'Payme';
      default: return type;
    }
  };

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

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">Ma'lumotlar topilmadi</p>
          <button onClick={handleLogout} className="mt-4 btn-primary px-6 py-2 rounded-lg">
            Qayta kirish
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Umumiy', icon: User },
    { id: 'payments', label: 'To\'lovlar', icon: Wallet },
    { id: 'attendance', label: 'Davomat', icon: Calendar },
    { id: 'tasks', label: 'Vazifalar', icon: FileCode },
    { id: 'rating', label: 'Reyting', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/20 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-lg">
                <GraduationCap className="text-white" size={24} />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-white">
                  {data.student.full_name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {data.group.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getStatusColor(data.student.status)}`}>
                {getStatusLabel(data.student.status)}
              </span>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Chiqish</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="stats-card p-6 rounded-2xl shadow-lg card-hover animate-fade-in-up">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                <BookOpen className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Kurs</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{data.group.course || 'Noma\'lum'}</p>
              </div>
            </div>
          </div>

          <div className="stats-card p-6 rounded-2xl shadow-lg card-hover animate-fade-in-up delay-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Davomat</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{data.attendance.stats.percentage}%</p>
              </div>
            </div>
          </div>

          <div className="stats-card p-6 rounded-2xl shadow-lg card-hover animate-fade-in-up delay-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Wallet className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Jami to'langan</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{data.totalPaid.toLocaleString()} so'm</p>
              </div>
            </div>
          </div>

          <div className="stats-card p-6 rounded-2xl shadow-lg card-hover animate-fade-in-up delay-300">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                data.student.next_payment_date && new Date(data.student.next_payment_date) < new Date()
                  ? 'bg-gradient-to-br from-red-400 to-rose-500'
                  : 'bg-gradient-to-br from-cyan-400 to-blue-500'
              }`}>
                <Clock className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Keyingi to'lov</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {data.student.next_payment_date 
                    ? format(new Date(data.student.next_payment_date), 'dd.MM.yyyy')
                    : 'Belgilanmagan'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 animate-fade-in-up">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Guruh ma'lumotlari
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <BookOpen className="text-indigo-500" size={20} />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Guruh nomi</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{data.group.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <Calendar className="text-emerald-500" size={20} />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Dars kunlari</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {data.group.days?.join(', ') || 'Belgilanmagan'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <Clock className="text-amber-500" size={20} />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Dars vaqti</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {data.group.time || 'Belgilanmagan'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <User className="text-purple-500" size={20} />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Telefon</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{data.student.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <History className="text-cyan-500" size={20} />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Qo'shilgan sana</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {data.student.joined_date 
                          ? format(new Date(data.student.joined_date), 'dd.MM.yyyy')
                          : 'Noma\'lum'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <CreditCard className="text-rose-500" size={20} />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Oxirgi to'lov</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {data.student.last_payment_date 
                          ? format(new Date(data.student.last_payment_date), 'dd.MM.yyyy')
                          : 'Hali to\'lov qilinmagan'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance Summary */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Davomat statistikasi</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{data.attendance.stats.present}</p>
                    <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">Kelgan</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">{data.attendance.stats.absent}</p>
                    <p className="text-sm text-red-600/80 dark:text-red-400/80">Kelmagan</p>
                  </div>
                  <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{data.attendance.stats.late}</p>
                    <p className="text-sm text-amber-600/80 dark:text-amber-400/80">Kechikkan</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                To'lovlar tarixi
              </h2>
              
              {data.payments.length === 0 ? (
                <div className="text-center py-12">
                  <Wallet className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
                  <p className="text-gray-500 dark:text-gray-400">Hali to'lovlar mavjud emas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.payments.map((payment, index) => (
                    <div 
                      key={payment._id} 
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl table-row-hover"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                          <CreditCard className="text-white" size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {payment.amount.toLocaleString()} so'm
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {getPaymentTypeLabel(payment.payment_type)} • {format(new Date(payment.payment_date), 'dd.MM.yyyy')}
                          </p>
                        </div>
                      </div>
                      {payment.note && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
                          {payment.note}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'attendance' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Davomat tarixi
              </h2>
              
              {data.attendance.records.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
                  <p className="text-gray-500 dark:text-gray-400">Hali davomat yozuvlari mavjud emas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.attendance.records.map((record, index) => (
                    <div 
                      key={record._id} 
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl table-row-hover"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          record.status === 'PRESENT' 
                            ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                            : record.status === 'LATE'
                            ? 'bg-amber-100 dark:bg-amber-900/30'
                            : 'bg-red-100 dark:bg-red-900/30'
                        }`}>
                          {getAttendanceIcon(record.status)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {format(new Date(record.date), 'dd MMMM yyyy', { locale: uz })}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {format(new Date(record.date), 'EEEE', { locale: uz })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {record.score !== null && (
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                            record.score >= 70 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            record.score >= 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {record.score} ball
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          record.status === 'PRESENT' 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                            : record.status === 'LATE'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {getAttendanceLabel(record.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Vazifalar
                </h2>
                <Link
                  to="/student/tasks"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  <FileCode size={18} />
                  Barcha vazifalar
                  <ChevronRight size={18} />
                </Link>
              </div>
              
              <div className="text-center py-12 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl">
                <FileCode className="mx-auto text-orange-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Kod yozish vaqti!
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Vazifalarni bajarib, ball to'plang va reytingda yuqoriga ko'taring
                </p>
                <Link
                  to="/student/tasks"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Vazifalarni ko'rish
                  <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'rating' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Reyting
                </h2>
                <Link
                  to="/student/rating"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  <Trophy size={18} />
                  To'liq reyting
                  <ChevronRight size={18} />
                </Link>
              </div>

              <div className="text-center py-12 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl">
                <Trophy className="mx-auto text-yellow-500 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Reytingni ko'ring!
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  O'quv markazdagi barcha o'quvchilar orasidagi o'rningizni bilib oling
                </p>
                <Link
                  to="/student/rating"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  <Star className="fill-white" size={18} />
                  Reytingni ko'rish
                  <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

