import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Trophy, 
  Star, 
  Medal,
  Crown,
  Users,
  TrendingUp,
  Search
} from 'lucide-react';

export default function Rating() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const response = await api.get('/tasks/ratings/students');
      setRatings(response.data);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
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

  const getRankStyle = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 shadow-lg shadow-yellow-500/30';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 shadow-lg shadow-gray-400/30';
    if (rank === 3) return 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 shadow-lg shadow-amber-500/30';
    return 'bg-white dark:bg-gray-800';
  };

  const filteredRatings = ratings.filter(r =>
    r.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.student?.group?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const top3 = filteredRatings.slice(0, 3);
  const rest = filteredRatings.slice(3);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
            Reyting
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {ratings.length} ta o'quvchi
          </p>
        </div>

        <div className="relative w-full lg:w-80">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

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
          {filteredRatings.map((rating, index) => (
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
                <div className="text-xs text-gray-400">o'rtacha ball</div>
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

          {filteredRatings.length === 0 && (
            <div className="p-12 text-center">
              <Trophy className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400">O'quvchilar topilmadi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

