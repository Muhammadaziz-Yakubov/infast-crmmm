import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Edit, Trash2, X, UserCheck, Search, Users, Phone, User, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [groupFilter, setGroupFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    group_id: '',
    lead_status: 'INTERESTED'
  });

  useEffect(() => {
    fetchGroups();
    fetchLeads();
  }, [groupFilter]);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      setGroups(response.data.filter(g => g.status === 'NABOR'));
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchLeads = async () => {
    try {
      const params = groupFilter ? { group_id: groupFilter } : {};
      const response = await api.get('/leads', { params });
      setLeads(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLead) {
        await api.put(`/leads/${editingLead._id}`, formData);
      } else {
        await api.post('/leads', formData);
      }
      setShowModal(false);
      setEditingLead(null);
      resetForm();
      fetchLeads();
    } catch (error) {
      console.error('Error saving lead:', error);
      alert(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleConvert = async (leadId) => {
    if (!confirm('Nabor o\'quvchini o\'quvchiga aylantirishni tasdiqlaysizmi?')) return;
    try {
      await api.post(`/leads/${leadId}/convert`);
      fetchLeads();
    } catch (error) {
      console.error('Error converting lead:', error);
      alert(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name,
      phone: lead.phone,
      group_id: lead.group_id._id || lead.group_id,
      lead_status: lead.lead_status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Nabor o\'quvchini o\'chirishni tasdiqlaysizmi?')) return;
    try {
      await api.delete(`/leads/${id}`);
      fetchLeads();
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      group_id: '',
      lead_status: 'INTERESTED'
    });
  };

  const getStatusGradient = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'from-emerald-400 to-green-500';
      case 'REGISTERED': return 'from-blue-400 to-indigo-500';
      case 'INTERESTED': return 'from-amber-400 to-orange-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'Tasdiqlangan';
      case 'REGISTERED': return 'Ro\'yxatdan o\'tgan';
      case 'INTERESTED': return 'Qiziqish bildirgan';
      default: return status;
    }
  };

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm)
  );

  // Stats
  const stats = {
    interested: leads.filter(l => l.lead_status === 'INTERESTED').length,
    registered: leads.filter(l => l.lead_status === 'REGISTERED').length,
    confirmed: leads.filter(l => l.lead_status === 'CONFIRMED').length
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
          <h1 className="text-3xl font-bold gradient-text">Nabor</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Jami: {leads.length} ta potensial o'quvchi
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

          <button
            onClick={() => {
              setEditingLead(null);
              resetForm();
              setShowModal(true);
            }}
            className="btn-primary flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold whitespace-nowrap"
          >
            <Plus size={20} />
            Yangi nabor
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.interested}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Qiziqish bildirgan</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
              <User className="text-white" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.registered}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ro'yxatdan o'tgan</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
              <UserCheck className="text-white" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.confirmed}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tasdiqlangan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLeads.map((lead, index) => (
          <div 
            key={lead._id} 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden card-hover animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={`h-2 bg-gradient-to-r ${getStatusGradient(lead.lead_status)}`}></div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {lead.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Phone size={14} />
                    {lead.phone}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getStatusGradient(lead.lead_status)}`}>
                  {getStatusLabel(lead.lead_status)}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-sm font-medium">
                  {lead.group_id?.name || 'Noma\'lum'}
                </span>
                <span className="text-xs text-gray-400">
                  {format(new Date(lead.createdAt), 'dd.MM.yyyy')}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => handleConvert(lead._id)}
                  className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <UserCheck size={16} />
                  O'quvchiga aylantirish
                  <ArrowRight size={14} />
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(lead)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(lead._id)}
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

      {filteredLeads.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <Users className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
          <p className="text-gray-500 dark:text-gray-400">Nabor o'quvchilar topilmadi</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingLead ? 'Nabor o\'quvchini tahrirlash' : 'Yangi nabor o\'quvchi'}
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
                  Ism *
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    placeholder="Ism Familiya"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Telefon *
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    placeholder="+998901234567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Guruh (Nabor) *
                </label>
                <select
                  value={formData.group_id}
                  onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                  required
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
                  Holati
                </label>
                <select
                  value={formData.lead_status}
                  onChange={(e) => setFormData({ ...formData, lead_status: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                >
                  <option value="INTERESTED">🟡 Qiziqish bildirgan</option>
                  <option value="REGISTERED">🔵 Ro'yxatdan o'tgan</option>
                  <option value="CONFIRMED">🟢 Tasdiqlangan</option>
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
                  {editingLead ? 'Saqlash' : 'Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
