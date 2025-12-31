import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Trophy, 
  Star, 
  Medal,
  Crown,
  Users,
  TrendingUp,
  ArrowLeft,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

export default function StudentRating() {
  const [ratings, setRatings] = useState([]);
  const [myRating, setMyRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRatings();
    fetchMyRating();
  }, []);

  const fetchRatings = async () => {
    try {
      // Use admin endpoint with student token - we need to create a public ratings endpoint
      const response = await api.get('/tasks/ratings/students');
      setRatings(response.data);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRating = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      const response = await api.get('/student-auth/my-rating', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyRating(response.data);
    } catch (error) {
      console.error('Error fetching my rating:', error);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-emerald-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="text-yellow-400" size={28} />;
    if (rank === 2) return <Medal className="text-gray-400" size={24} />;
    if (rank === 3) return <Medal className="text-amber-600" size={24} />;
    return <span className="text-gray-400 font-bold">{rank}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const top3 = ratings.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/20 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/student')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Trophy className="text-white" size={24} />
              </div>
              <h1 className="font-bold text-gray-900 dark:text-white">Reyting</h1>
            </div>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* My Rating Card */}
        {myRating && (
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-6 mb-8 text-white shadow-xl animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Sizning o'rningiz</p>
                <div className="flex items-center gap-3">
                  <span className="text-5xl font-bold">#{myRating.rank}</span>
                  <div className="text-white/90">
                    <p>{myRating.totalStudents} ta o'quvchi orasida</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-sm mb-1">O'rtacha ball</p>
                <div className="flex items-center gap-2">
                  <Star className="fill-white" size={24} />
                  <span className="text-4xl font-bold">{myRating.averageScore}</span>
                </div>
                <p className="text-white/80 text-sm mt-1">
                  {myRating.taskCount} vazifa • {myRating.attendanceCount} baho
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Top 3 Podium */}
        {top3.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <div className="flex flex-col items-center mt-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center mb-3 shadow-lg shadow-gray-400/30">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate max-w-[150px]">
                  {top3[1]?.student?.full_name}
                </h3>
                <p className="text-sm text-gray-500 truncate max-w-[150px]">
                  {top3[1]?.student?.group?.name}
                </p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="text-gray-400 fill-gray-400" size={16} />
                  <span className="font-bold text-gray-600 dark:text-gray-300">
                    {top3[1]?.averageScore}
                  </span>
                </div>
              </div>
              <div className="w-full h-24 bg-gradient-to-b from-gray-300 to-gray-400 rounded-t-lg mt-4"></div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center animate-fade-in-up">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center mb-3 shadow-lg shadow-yellow-500/30">
                  <Crown className="text-white" size={36} />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Star className="text-white fill-white" size={16} />
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate max-w-[150px]">
                  {top3[0]?.student?.full_name}
                </h3>
                <p className="text-sm text-gray-500 truncate max-w-[150px]">
                  {top3[0]?.student?.group?.name}
                </p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="text-yellow-500 fill-yellow-500" size={18} />
                  <span className="font-bold text-xl text-yellow-600">
                    {top3[0]?.averageScore}
                  </span>
                </div>
              </div>
              <div className="w-full h-32 bg-gradient-to-b from-yellow-400 to-amber-500 rounded-t-lg mt-4"></div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center mt-12 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/30">
                <span className="text-xl font-bold text-white">3</span>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate max-w-[150px]">
                  {top3[2]?.student?.full_name}
                </h3>
                <p className="text-sm text-gray-500 truncate max-w-[150px]">
                  {top3[2]?.student?.group?.name}
                </p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="text-amber-500 fill-amber-500" size={16} />
                  <span className="font-bold text-amber-600">
                    {top3[2]?.averageScore}
                  </span>
                </div>
              </div>
              <div className="w-full h-16 bg-gradient-to-b from-amber-500 to-orange-500 rounded-t-lg mt-4"></div>
            </div>
          </div>
        )}

        {/* Rest of the list */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-orange-500" />
              Barcha o'quvchilar
            </h2>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {ratings.map((rating, index) => (
              <div 
                key={rating.student?._id}
                className={`flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors animate-fade-in-up ${
                  rating.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-900/10' : ''
                }`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Rank */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  rating.rank === 1 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                  rating.rank === 2 ? 'bg-gray-100 dark:bg-gray-700' :
                  rating.rank === 3 ? 'bg-amber-100 dark:bg-amber-900/30' :
                  'bg-gray-50 dark:bg-gray-700/50'
                }`}>
                  {getRankIcon(rating.rank)}
                </div>

                {/* Student Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {rating.student?.full_name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users size={14} />
                    <span className="truncate">{rating.student?.group?.name || 'Guruh yo\'q'}</span>
                    <span>•</span>
                    <span>{rating.taskCount} vazifa</span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(rating.averageScore)}`}>
                    {rating.averageScore}
                  </div>
                  <div className="text-xs text-gray-400">ball</div>
                </div>

                {/* Stars for top 3 */}
                {rating.rank <= 3 && (
                  <div className="flex gap-1">
                    {[...Array(4 - rating.rank)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`${
                          rating.rank === 1 ? 'text-yellow-400 fill-yellow-400' :
                          rating.rank === 2 ? 'text-gray-400 fill-gray-400' :
                          'text-amber-500 fill-amber-500'
                        }`} 
                        size={16} 
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {ratings.length === 0 && (
              <div className="p-12 text-center">
                <Trophy className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
                <p className="text-gray-500 dark:text-gray-400">O'quvchilar topilmadi</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

