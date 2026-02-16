import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const UploadVideos = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', video_url: '', subject: '', category: 'prelims' });

  // CRITICAL: Helper to convert any YouTube link to an Embed link
  const getEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?\s*v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
  };

  const fetchVideos = async () => {
    const { data } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });
    setVideos(data || []);
  };

  useEffect(() => { fetchVideos(); }, []);

  const handlePublish = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('videos').insert([{
        ...formData,
        uploaded_by: user.id
      }]);
      if (error) throw error;
      alert("Video published successfully!");
      setFormData({ title: '', video_url: '', subject: '', category: 'prelims' });
      fetchVideos();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently remove this video lecture?")) return;
    try {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) throw error;
      fetchVideos();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* 1. IMPROVED UPLOAD FORM WITH LIVE PREVIEW */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Video Lecture</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <form onSubmit={handlePublish} className="space-y-4">
            <input 
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" 
              placeholder="Video Title" 
              required 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})} 
            />
            <input 
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" 
              placeholder="YouTube URL (Paste link here)" 
              required 
              value={formData.video_url}
              onChange={e => setFormData({...formData, video_url: e.target.value})} 
            />
            <div className="grid grid-cols-2 gap-4">
              <input 
                className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" 
                placeholder="Subject" 
                required 
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})} 
              />
              <select 
                className="p-3 border border-gray-200 rounded-xl outline-none"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="prelims">Prelims</option>
                <option value="mains">Mains</option>
                <option value="interview">Interview</option>
              </select>
            </div>
            <button 
              disabled={loading}
              className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-indigo-700 disabled:bg-gray-400 transition"
            >
              {loading ? "Publishing..." : "Publish Video Lecture"}
            </button>
          </form>

          {/* NEW: LIVE FORM PREVIEW */}
          <div className="flex flex-col">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Live Preview</p>
            <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
              {getEmbedUrl(formData.video_url) ? (
                <iframe 
                  className="w-full h-full" 
                  src={getEmbedUrl(formData.video_url)} 
                  title="Form Preview"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="text-gray-500 text-center p-6">
                  <p className="text-2xl mb-2">📺</p>
                  <p className="text-sm">Enter a valid YouTube URL to see preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. PUBLISHED VIDEO LIST (Same as Student View) */}
      <h2 className="text-xl font-bold text-gray-800 px-2">Published Lectures</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((vid) => {
          const embedUrl = getEmbedUrl(vid.video_url);
          return (
            <div key={vid.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group">
              <div className="aspect-video bg-black relative">
                {embedUrl ? (
                  <iframe 
                    className="w-full h-full" 
                    src={embedUrl}
                    title={vid.title}
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xs bg-gray-900">
                    Invalid URL Format
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{vid.subject}</span>
                  <button 
                    onClick={() => handleDelete(vid.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    title="Delete Video"
                  >
                    🗑️
                  </button>
                </div>
                <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{vid.title}</h3>
                <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center text-[10px] text-gray-400">
                  <span className="font-bold uppercase">{vid.category}</span>
                  <span>{new Date(vid.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UploadVideos;