import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Users, 
  Calendar, 
  AlertCircle, 
  Wallet, 
  UserCheck,
  UserPlus,
  Clock,
  TrendingUp,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDashboard();
  }, [user, navigate]);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Ma'lumotlar topilmadi</p>
      </div>
    );
  }

  const stats = [
    {
      title: 'Faol guruhlar',
      value: data.activeGroupsCount,
      icon: Users,
      gradient: 'from-emerald-400 to-green-500',
      link: '/groups?status=ACTIVE'
    },
    {
      title: 'Nabor guruhlar',
      value: data.naborGroupsCount,
      icon: UserPlus,
      gradient: 'from-amber-400 to-orange-500',
      link: '/groups?status=NABOR'
    },
    {
      title: 'Faol o\'quvchilar',
      value: data.activeStudentsCount,
      icon: UserCheck,
      gradient: 'from-cyan-400 to-blue-500',
      link: '/students?status=ACTIVE'
    },
    {
      title: 'Oylik tushum',
      value: `${data.monthlyRevenue.toLocaleString()}`,
      subtitle: "so'm",
      icon: Wallet,
      gradient: 'from-indigo-400 to-purple-500',
      link: '/payments'
    },
    {
      title: 'Bugungi darslar',
      value: data.todaysGroups,
      icon: Calendar,
      gradient: 'from-pink-400 to-rose-500',
      link: '/attendance'
    },
    {
      title: 'Qarzdorlar',
      value: data.debtorsCount,
      icon: AlertCircle,
      gradient: 'from-red-400 to-rose-500',
      link: '/students?status=DEBTOR',
      alert: data.debtorsCount > 0
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
            <Sparkles className="text-amber-400" size={24} />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            {format(new Date(), "d MMMM yyyy, EEEE", { locale: uz })}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow">
          <TrendingUp className="text-emerald-500" size={20} />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Bu oy: <strong className="text-emerald-600 dark:text-emerald-400">{data.monthlyRevenue.toLocaleString()} so'm</strong>
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              to={stat.link}
              className={`stats-card p-6 rounded-2xl shadow-lg card-hover animate-fade-in-up ${stat.alert ? 'ring-2 ring-red-400 ring-offset-2 dark:ring-offset-gray-900' : ''}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                    {stat.subtitle && (
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                        {stat.subtitle}
                      </span>
                    )}
                  </p>
                </div>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                  <Icon className="text-white" size={28} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Payments Due */}
        {data.paymentsDueTodayList && data.paymentsDueTodayList.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden animate-fade-in-up delay-300">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Clock className="text-white" size={20} />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Bugun to'lov qiladiganlar
                  </h2>
                </div>
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium">
                  {data.paymentsDueTodayList.length}
                </span>
              </div>
            </div>
            <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
              {data.paymentsDueTodayList.map((student) => (
                <div
                  key={student._id}
                  className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl table-row-hover"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {student.full_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {student.group_id?.name} • {student.phone}
                    </p>
                  </div>
                  <Link
                    to={`/payments?student_id=${student._id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
                  >
                    To'lov
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debtors */}
        {data.debtorsList && data.debtorsList.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden animate-fade-in-up delay-400">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center">
                    <AlertCircle className="text-white" size={20} />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Qarzdorlar
                  </h2>
                </div>
                <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-medium">
                  {data.debtorsList.length}
                </span>
              </div>
            </div>
            <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
              {data.debtorsList.slice(0, 5).map((student) => (
                <div
                  key={student._id}
                  className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-xl table-row-hover"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {student.full_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {student.group_id?.name} • {student.phone}
                    </p>
                    {student.next_payment_date && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                        To'lov: {format(new Date(student.next_payment_date), 'dd.MM.yyyy')}
                      </p>
                    )}
                  </div>
                  <Link
                    to={`/payments?student_id=${student._id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-400 to-rose-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
                  >
                    To'lov
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ))}
              {data.debtorsList.length > 5 && (
                <Link
                  to="/students?status=DEBTOR"
                  className="block text-center py-3 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  Barchasini ko'rish ({data.debtorsList.length})
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Today's Groups */}
      {data.todaysGroupsList && data.todaysGroupsList.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden animate-fade-in-up delay-500">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                <Calendar className="text-white" size={20} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Bugungi darslar
              </h2>
            </div>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.todaysGroupsList.map((group) => (
              <Link
                key={group._id}
                to={`/attendance?group_id=${group._id}&date=${format(new Date(), 'yyyy-MM-dd')}`}
                className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
              >
                <p className="font-semibold text-gray-900 dark:text-white mb-1">
                  {group.name}
                </p>
                <p className="text-sm text-indigo-600 dark:text-indigo-400">
                  {group.time || 'Vaqt belgilanmagan'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
