import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [savedVideos, setSavedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extract first name for a friendlier greeting
  const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'Student';

  useEffect(() => {
    const fetchSavedVideos = async () => {
      setLoading(true);
      try {
        // Fetch the user's bookmarked video IDs
        const { data: bookmarkData } = await supabase
          .from('video_bookmarks')
          .select('video_id')
          .eq('user_id', user.id);

        if (bookmarkData?.length > 0) {
          const videoIds = bookmarkData.map(b => b.video_id);
          
          // Fetch the actual video details for those IDs
          const { data: videoData } = await supabase
            .from('videos')
            .select('*')
            .in('id', videoIds)
            .limit(3); // Show only top 3 on dashboard

          setSavedVideos(videoData || []);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedVideos();
  }, [user.id]);

  const stats = [
    { label: 'Bookmarked', value: savedVideos.length, trend: 'Videos', color: 'bg-blue-50' },
    { label: 'Tests Completed', value: '28', trend: '15 this week', color: 'bg-indigo-50' },
    { label: 'Average Score', value: '78%', trend: '+5%', color: 'bg-green-50' },
    { label: 'Leaderboard Rank', value: '#127', trend: 'Top 5%', color: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">
            Welcome back, {firstName}! 📚
          </h1>
          <p className="text-gray-500 font-medium mt-1">Ready to ace your GPSC preparation today?</p>
        </div>
        <Link 
          to="/student/ai-tutor" 
          className="hidden md:block bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
        >
          Ask AI Tutor 🤖
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.color} p-6 rounded-3xl border border-white shadow-sm transition hover:shadow-md`}>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">{stat.label}</p>
            <h3 className="text-3xl font-black mt-2 text-gray-900">{stat.value}</h3>
            <p className="text-[10px] text-indigo-600 mt-2 font-bold bg-white/50 inline-block px-2 py-1 rounded-lg">
              {stat.trend}
            </p>
          </div>
        ))}
      </div>

      {/* NEW: Continue Watching (Saved Videos) */}
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-gray-800">Bookmarks 🔖</h2>
          <Link to="/student/videos" className="text-indigo-600 text-sm font-bold hover:underline">View All Saved</Link>
        </div>
        
        {loading ? (
          <div className="h-40 flex items-center justify-center text-gray-400 font-medium">Loading your favorites...</div>
        ) : savedVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {savedVideos.map((video) => (
              <Link to="/student/videos" key={video.id} className="group">
                <div className="aspect-video rounded-2xl bg-slate-100 overflow-hidden relative border border-gray-100 shadow-sm">
                  <img 
                    src={`https://img.youtube.com/vi/${video.video_url.split('v=')[1]?.split('&')[0]}/0.jpg`} 
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-all">
                      <span className="text-indigo-600 text-xl ml-1">▶</span>
                    </div>
                  </div>
                </div>
                <h4 className="mt-3 font-bold text-gray-800 text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors">
                  {video.title}
                </h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{video.subject}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
             <p className="text-gray-400 font-bold text-sm">No bookmarked videos yet.</p>
             <Link to="/student/videos" className="mt-2 text-xs text-indigo-500 font-black uppercase tracking-widest hover:underline">Explore Lectures</Link>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subject Progress */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-black mb-8 text-gray-800">Syllabus Coverage</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
            {[
              { name: 'Indian History', progress: 75, color: 'bg-orange-500' },
              { name: 'Gujarat Geography', progress: 60, color: 'bg-emerald-500' },
              { name: 'Indian Polity', progress: 85, color: 'bg-indigo-500' },
              { name: 'Science & Tech', progress: 45, color: 'bg-rose-500' },
            ].map((subject, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-black uppercase text-gray-500 tracking-wider">{subject.name}</span>
                  <span className="text-xs font-black text-gray-800">{subject.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`${subject.color} h-full rounded-full transition-all duration-1000`} 
                    style={{ width: `${subject.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tests */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-black mb-8 text-gray-800">Upcoming Tests</h2>
          <div className="space-y-4">
            <div className="p-5 border border-indigo-50 rounded-2xl bg-indigo-50/30 group hover:bg-indigo-600 transition-all duration-300">
              <p className="font-bold text-sm text-gray-900 group-hover:text-white">Mock Test #5</p>
              <p className="text-[10px] text-gray-500 mt-1 font-bold group-hover:text-indigo-200">TOMORROW • 10:00 AM</p>
            </div>
            <div className="p-5 border border-gray-50 rounded-2xl hover:bg-gray-50 transition-all duration-300 group">
              <p className="font-bold text-sm text-gray-900">Current Affairs Weekly</p>
              <p className="text-[10px] text-gray-400 mt-1 font-bold">FEB 20 • 2:00 PM</p>
            </div>
            <button className="w-full mt-4 py-4 text-indigo-600 font-black text-xs uppercase tracking-widest border-2 border-indigo-50 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
              View All Test Schedules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;