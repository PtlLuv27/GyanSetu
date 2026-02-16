import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const Videos = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?\s*v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all videos
      let videoQuery = supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (activeCategory !== 'all' && activeCategory !== 'saved') {
        videoQuery = videoQuery.eq('category', activeCategory);
      }

      const { data: videoData } = await videoQuery;

      // 2. Fetch user's bookmarks
      const { data: bookmarkData } = await supabase
        .from('video_bookmarks')
        .select('video_id')
        .eq('user_id', user.id);

      const bookmarkSet = new Set(bookmarkData?.map(b => b.video_id));
      setBookmarkedIds(bookmarkSet);

      // 3. Filter for 'saved' tab if active
      let finalVideos = videoData || [];
      if (activeCategory === 'saved') {
        finalVideos = finalVideos.filter(v => bookmarkSet.has(v.id));
      }

      setVideos(finalVideos);
      setFilteredVideos(finalVideos);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeCategory]);

  // Handle Real-time Search Filter
  useEffect(() => {
    const results = videos.filter(video =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVideos(results);
  }, [searchTerm, videos]);

  const toggleBookmark = async (videoId) => {
    try {
      if (bookmarkedIds.has(videoId)) {
        // Remove Bookmark
        await supabase
          .from('video_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('video_id', videoId);
        
        setBookmarkedIds(prev => {
          const next = new Set(prev);
          next.delete(videoId);
          return next;
        });

        // If we are in the 'saved' tab, remove it from view immediately
        if (activeCategory === 'saved') {
          setVideos(prev => prev.filter(v => v.id !== videoId));
        }
      } else {
        // Add Bookmark
        await supabase
          .from('video_bookmarks')
          .insert([{ user_id: user.id, video_id: videoId }]);
        
        setBookmarkedIds(prev => new Set(prev).add(videoId));
      }
    } catch (error) {
      console.error("Bookmark error:", error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {activeCategory === 'saved' ? 'Saved Lectures 🔖' : 'Video Lectures'}
          </h1>
          <p className="text-gray-500 mt-1">
            {activeCategory === 'saved' 
              ? 'Your personalized collection of important GPSC topics.' 
              : 'Structured video guidance for GPSC preparation.'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-full sm:w-auto">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input 
              type="text"
              placeholder="Search title or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-64 shadow-sm transition-all"
            />
          </div>

          {/* Category & Saved Filter */}
          <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm overflow-x-auto max-w-full">
            {['all', 'prelims', 'mains', 'interview', 'saved'].map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all whitespace-nowrap ${
                  activeCategory === cat 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : cat === 'saved' ? 'text-indigo-600 hover:bg-indigo-50' : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                {cat === 'saved' ? '⭐ SAVED' : cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="py-20 text-center text-gray-400 animate-pulse">Updating library...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((vid) => (
            <div key={vid.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group relative">
              {/* Bookmark Toggle */}
              <button 
                onClick={() => toggleBookmark(vid.id)}
                className={`absolute top-4 right-4 z-10 p-2 rounded-full shadow-lg transition-all transform active:scale-90 ${
                  bookmarkedIds.has(vid.id) 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white/80 text-gray-400 hover:text-indigo-600 backdrop-blur-md'
                }`}
              >
                {bookmarkedIds.has(vid.id) ? '⭐' : '☆'}
              </button>

              <div className="aspect-video bg-black relative">
                <iframe 
                  className="w-full h-full" 
                  src={getEmbedUrl(vid.video_url)} 
                  title={vid.title}
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-5">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{vid.subject}</span>
                <h3 className="font-bold text-gray-800 text-lg mt-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">{vid.title}</h3>
                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-[10px] text-gray-400">
                  <span className="font-black uppercase bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg">{vid.category}</span>
                  <span className="font-medium">{new Date(vid.created_at).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredVideos.length === 0 && !loading && (
        <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <div className="text-4xl mb-4">{activeCategory === 'saved' ? '📑' : '🔍'}</div>
          <p className="text-gray-400 font-bold">
            {activeCategory === 'saved' 
              ? "You haven't bookmarked any lectures yet." 
              : `No lectures found matching "${searchTerm}"`}
          </p>
        </div>
      )}
    </div>
  );
};

export default Videos;