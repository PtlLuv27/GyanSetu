import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const { user, supabase } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Menu configurations mapped to user roles
  const menus = {
    student: [
      { name: 'Dashboard', path: '/student', icon: '📊' },
      { name: 'Syllabus', path: '/student/syllabus', icon: '📚' },
      { name: 'Materials', path: '/student/materials', icon: '📄' },
      { name: 'Videos', path: '/student/videos', icon: '🎥' },
      { name: 'AI Tutor', path: '/student/ai-tutor', icon: '🤖' } // Matches App.jsx route
    ],
    expert: [
      { name: 'Dashboard', path: '/expert', icon: '📊' },
      { name: 'Manage Syllabus', path: '/expert/syllabus', icon: '📚' },
      { name: 'Manage Materials', path: '/expert/materials', icon: '📄' },
      { name: 'Manage Videos', path: '/expert/videos', icon: '🎥' },
      { name: 'Manage Students', path: '/expert/students', icon: '👥' },
    ] 
  };

  // Fallback to student menu if role is undefined
  const activeMenu = menus[user?.role] || menus['student'];

  return (
    <aside className="w-64 h-screen bg-slate-900 text-white fixed left-0 top-0 flex flex-col z-50 shadow-2xl">
      {/* Brand Header */}
      <div className="p-6">
        <h1 className="text-2xl font-black tracking-tight text-indigo-400">GyanSetu</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className={`w-1.5 h-1.5 rounded-full ${user?.role === 'expert' ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`}></span>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
            {user?.role === 'expert' ? 'Expert Control Panel' : 'Student Learning Portal'}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
        {activeMenu.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span> 
              <span className="font-bold text-sm tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout Section */}
      <div className="p-4 relative border-t border-slate-800/50">
        {showLogout && (
          <div className="absolute bottom-24 left-4 right-4 bg-white rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-bottom-4 border border-gray-100 z-50">
            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-red-600 font-black text-xs hover:bg-red-50 rounded-xl transition-colors flex items-center gap-3"
            >
              <span className="text-lg">🚪</span> Sign Out Account
            </button>
          </div>
        )}
        
        <button 
          onClick={() => setShowLogout(!showLogout)}
          className={`w-full bg-slate-800/40 p-3 rounded-2xl flex items-center gap-3 transition-all duration-300 hover:bg-slate-800 border border-transparent ${showLogout ? 'border-indigo-500 bg-slate-800' : ''}`}
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center font-black text-white shadow-inner">
            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="text-left truncate flex-1">
            <p className="text-xs font-black truncate text-slate-100">{user?.full_name || 'User'}</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
              {user?.role === 'expert' ? 'GPSC Senior Faculty' : 'GPSC Aspirant'}
            </p>
          </div>
          <span className={`text-slate-600 text-xs transition-transform duration-300 ${showLogout ? 'rotate-180' : ''}`}>
            ▲
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;