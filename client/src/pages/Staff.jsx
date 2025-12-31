import { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  UserCog,
  Shield,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'MANAGER',
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await api.get('/staff');
      setStaff(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await api.put(`/staff/${editingStaff._id}`, formData);
      } else {
        await api.post('/staff', formData);
      }
      setShowModal(false);
      setEditingStaff(null);
      resetForm();
      fetchStaff();
    } catch (error) {
      console.error('Error saving staff:', error);
      alert(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleEdit = (member) => {
    setEditingStaff(member);
    setFormData({
      email: member.email,
      password: '',
      full_name: member.full_name || '',
      role: member.role,
      status: member.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Xodimni o\'chirishni tasdiqlaysizmi?')) return;
    try {
      await api.delete(`/staff/${id}`);
      fetchStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      full_name: '',
      role: 'MANAGER',
      status: 'ACTIVE'
    });
    setShowPassword(false);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'from-purple-500 to-indigo-500';
      case 'MANAGER': return 'from-cyan-500 to-blue-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMIN': return 'Admin';
      case 'MANAGER': return 'Manager';
      default: return role;
    }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Xodimlar</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Tizim foydalanuvchilarini boshqarish
          </p>
        </div>
        <button
          onClick={() => {
            setEditingStaff(null);
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2 px-5 py-3 rounded-xl font-semibold"
        >
          <Plus size={20} />
          Yangi xodim
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((member, index) => (
          <div 
            key={member._id} 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden card-hover animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`h-2 bg-gradient-to-r ${getRoleColor(member.role)}`}></div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRoleColor(member.role)} flex items-center justify-center`}>
                    {member.role === 'ADMIN' ? (
                      <Shield className="text-white" size={24} />
                    ) : (
                      <UserCog className="text-white" size={24} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {member.full_name || 'Ism belgilanmagan'}
                    </h3>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getRoleColor(member.role)}`}>
                      {getRoleLabel(member.role)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  {member.status === 'ACTIVE' ? (
                    <span className="flex items-center gap-1 text-emerald-500 text-sm">
                      <CheckCircle size={16} />
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-500 text-sm">
                      <XCircle size={16} />
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail size={16} />
                  <span>{member.email}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  member.status === 'ACTIVE' 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {member.status === 'ACTIVE' ? 'Faol' : 'Faol emas'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(member)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(member._id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {staff.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <UserCog className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
          <p className="text-gray-500 dark:text-gray-400">Hali xodimlar mavjud emas</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingStaff ? 'Xodimni tahrirlash' : 'Yangi xodim'}
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
                  To'liq ism
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    placeholder="Ism Familiya"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Parol {editingStaff ? '(bo\'sh qoldiring o\'zgarmaslik uchun)' : '*'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingStaff}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rol
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                >
                  <option value="MANAGER">Manager (faqat ko'rish)</option>
                  <option value="ADMIN">Admin (to'liq huquq)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Holati
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                >
                  <option value="ACTIVE">Faol</option>
                  <option value="INACTIVE">Faol emas</option>
                </select>
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
                  {editingStaff ? 'Saqlash' : 'Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

