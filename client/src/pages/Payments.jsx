import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Plus, Edit, Trash2, X, CreditCard, Search, Wallet, Calendar, Banknote } from 'lucide-react';
import { format } from 'date-fns';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchParams] = useSearchParams();
  const studentFilter = searchParams.get('student_id');
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [formData, setFormData] = useState({
    student_id: '',
    amount: '',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    payment_type: 'CASH',
    note: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchPayments();
  }, [studentFilter, selectedMonth, selectedYear]);

  useEffect(() => {
    if (studentFilter) {
      setFormData(prev => ({ ...prev, student_id: studentFilter }));
    }
  }, [studentFilter]);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const params = {};
      if (studentFilter) params.student_id = studentFilter;
      if (selectedMonth && selectedYear) {
        params.month = selectedMonth;
        params.year = selectedYear;
      }
      
      const response = await api.get('/payments', { params });
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPayment) {
        await api.put(`/payments/${editingPayment._id}`, formData);
      } else {
        await api.post('/payments', formData);
      }
      setShowModal(false);
      setEditingPayment(null);
      resetForm();
      fetchPayments();
      fetchStudents();
    } catch (error) {
      console.error('Error saving payment:', error);
      alert(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setFormData({
      student_id: payment.student_id._id || payment.student_id,
      amount: payment.amount,
      payment_date: format(new Date(payment.payment_date), 'yyyy-MM-dd'),
      payment_type: payment.payment_type,
      note: payment.note || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('To\'lovni o\'chirishni tasdiqlaysizmi?')) return;
    try {
      await api.delete(`/payments/${id}`);
      fetchPayments();
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: studentFilter || '',
      amount: '',
      payment_date: format(new Date(), 'yyyy-MM-dd'),
      payment_type: 'CASH',
      note: ''
    });
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

  const getPaymentTypeGradient = (type) => {
    switch (type) {
      case 'CASH': return 'from-emerald-400 to-green-500';
      case 'CARD': return 'from-blue-400 to-indigo-500';
      case 'CLICK': return 'from-purple-400 to-pink-500';
      case 'PAYME': return 'from-cyan-400 to-blue-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.student_id?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

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
          <h1 className="text-3xl font-bold gradient-text">To'lovlar</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Jami: {filteredPayments.length} ta to'lov • {totalAmount.toLocaleString()} so'm
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="1">Yanvar</option>
              <option value="2">Fevral</option>
              <option value="3">Mart</option>
              <option value="4">Aprel</option>
              <option value="5">May</option>
              <option value="6">Iyun</option>
              <option value="7">Iyul</option>
              <option value="8">Avgust</option>
              <option value="9">Sentabr</option>
              <option value="10">Oktabr</option>
              <option value="11">Noyabr</option>
              <option value="12">Dekabr</option>
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>
          <div className="relative flex-1 lg:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="O'quvchi qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                setEditingPayment(null);
                resetForm();
                setShowModal(true);
              }}
              className="btn-success flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold whitespace-nowrap"
            >
              <Plus size={20} />
              To'lov qo'shish
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['CASH', 'CARD', 'CLICK', 'PAYME'].map(type => {
          const typePayments = filteredPayments.filter(p => p.payment_type === type);
          const typeTotal = typePayments.reduce((sum, p) => sum + p.amount, 0);
          return (
            <div key={type} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getPaymentTypeGradient(type)} flex items-center justify-center`}>
                  <Banknote className="text-white" size={20} />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {getPaymentTypeLabel(type)}
                </span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {typeTotal.toLocaleString()} <span className="text-sm font-normal text-gray-500">so'm</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  O'quvchi
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Summa
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sana
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Turi
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Izoh
                </th>
                {isAdmin && (
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amallar
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredPayments.map((payment, index) => (
                <tr 
                  key={payment._id} 
                  className="table-row-hover"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getPaymentTypeGradient(payment.payment_type)} flex items-center justify-center`}>
                        <CreditCard className="text-white" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {payment.student_id?.full_name || 'Noma\'lum'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {payment.student_id?.group_id?.name || ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {payment.amount.toLocaleString()} so'm
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {format(new Date(payment.payment_date), 'dd.MM.yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getPaymentTypeGradient(payment.payment_type)}`}>
                      {getPaymentTypeLabel(payment.payment_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                    {payment.note || '-'}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(payment)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(payment._id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <Wallet className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400">To'lovlar topilmadi</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingPayment ? 'To\'lovni tahrirlash' : 'Yangi to\'lov'}
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
                  O'quvchi *
                </label>
                <select
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  required
                  disabled={!!studentFilter}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 transition-all"
                >
                  <option value="">O'quvchini tanlang</option>
                  {students.map(student => (
                    <option key={student._id} value={student._id}>
                      {student.full_name} - {student.group_id?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Summa (so'm) *
                </label>
                <div className="relative">
                  <Wallet size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    min="0"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    placeholder="500000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sana *
                  </label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={formData.payment_date}
                      onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Turi *
                  </label>
                  <select
                    value={formData.payment_type}
                    onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                  >
                    <option value="CASH">💵 Naqd</option>
                    <option value="CARD">💳 Karta</option>
                    <option value="CLICK">📱 Click</option>
                    <option value="PAYME">💰 Payme</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Izoh
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all resize-none"
                  placeholder="Qo'shimcha izoh..."
                />
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
                  className="flex-1 btn-success px-4 py-3 rounded-xl font-medium"
                >
                  {editingPayment ? 'Saqlash' : 'To\'lov qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
