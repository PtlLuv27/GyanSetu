import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';

const ExpertDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ materials: 0, videos: 0, students: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1. Fetch Material Count (where type is material)
        const { count: matCount } = await supabase
          .from('materials')
          .select('*', { count: 'exact', head: true })
          .eq('content_type', 'material');

        // 2. Fetch Video Count
        const { count: vidCount } = await supabase
          .from('videos')
          .select('*', { count: 'exact', head: true });

        // 3. Fetch Student Count
        // Using ilike to be case-insensitive ('student' vs 'Student')
        const { count: stuCount, error: stuError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .ilike('role', 'student'); 

        if (stuError) console.error("Error fetching students:", stuError);

        setStats({ 
          materials: matCount || 0, 
          videos: vidCount || 0, 
          students: stuCount || 0 
        });
      } catch (err) {
        console.error("Dashboard Stats Error:", err);
      }
    };

    if (user) fetchStats();
  }, [user]);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">Expert Control Panel</h1>
        <p className="text-gray-500 font-medium">Welcome, {user?.full_name || 'Expert'}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Materials</p>
          <p className="text-4xl font-black text-gray-900 mt-2">{stats.materials}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Videos Published</p>
          <p className="text-4xl font-black text-indigo-600 mt-2">{stats.videos}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <p className="text-xs font-black text-green-400 uppercase tracking-widest">Enrolled Students</p>
          <p className="text-4xl font-black text-green-600 mt-2">{stats.students}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="font-bold text-gray-800">Platform Performance</h2>
          <span className="text-[10px] font-bold bg-green-50 text-green-600 px-2 py-1 rounded-full uppercase">Database Connected</span>
        </div>
        <div className="p-12 text-center text-gray-400 font-medium">
          Analytics graph will populate as content is consumed.
        </div>
      </div>
    </div>
  );
};

export default ExpertDashboard;