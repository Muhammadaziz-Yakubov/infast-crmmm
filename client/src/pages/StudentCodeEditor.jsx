import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Code, 
  Play, 
  Send, 
  ArrowLeft, 
  Eye,
  Maximize2,
  Minimize2,
  FileCode,
  CheckCircle
} from 'lucide-react';
import api from '../utils/api';

export default function StudentCodeEditor() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState(`<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mening sahifam</title>
  <style>
    /* CSS kodingizni shu yerga yozing */
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
    }
  </style>
</head>
<body>
  <!-- HTML kodingizni shu yerga yozing -->
  <h1>Salom dunyo!</h1>
  
</body>
</html>`);
  const [description, setDescription] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  useEffect(() => {
    // Update preview when code changes
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      doc.open();
      doc.write(code);
      doc.close();
    }
  }, [code, showPreview]);

  const fetchTask = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      const response = await api.get(`/student-auth/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTask(response.data);
      
      // Load existing code if available
      if (response.data.submission?.code) {
        setCode(response.data.submission.code);
      }
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('studentToken');
      await api.post(`/student-auth/tasks/${taskId}/submit`, 
        { code, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitted(true);
      setShowSubmitModal(false);
      setTimeout(() => {
        navigate('/student/tasks');
      }, 2000);
    } catch (error) {
      console.error('Error submitting:', error);
      alert(error.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-orange-500 to-red-600">
        <div className="text-center text-white animate-fade-in-up">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Vazifa topshirildi!</h1>
          <p className="text-white/80">Tez orada natijani ko'rasiz</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col bg-gray-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/student/tasks')}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <FileCode className="text-orange-500" size={20} />
            <span className="font-medium text-white">{task?.title || 'Vazifa'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showPreview 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Eye size={18} />
            <span className="hidden sm:inline">Ko'rish</span>
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            <Send size={18} />
            <span>Topshirish</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor */}
        <div className={`flex flex-col ${showPreview ? 'w-1/2' : 'w-full'} border-r border-gray-700`}>
          <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
            <Code size={16} className="text-orange-500" />
            <span className="text-sm text-gray-400">HTML / CSS / JavaScript</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 bg-gray-900 text-gray-100 p-4 font-mono text-sm resize-none focus:outline-none"
            spellCheck={false}
            placeholder="Kodingizni shu yerga yozing..."
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="w-1/2 flex flex-col">
            <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
              <Play size={16} className="text-green-500" />
              <span className="text-sm text-gray-400">Natija</span>
            </div>
            <div className="flex-1 bg-white">
              <iframe
                ref={iframeRef}
                title="Preview"
                className="w-full h-full"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 animate-fade-in-up">
            <h2 className="text-xl font-bold text-white mb-4">
              Vazifani topshirish
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Izoh (ixtiyoriy)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                placeholder="Vazifa haqida qo'shimcha ma'lumot..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-4 py-3 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-colors font-medium"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                {submitting ? 'Yuborilmoqda...' : 'Topshirish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

