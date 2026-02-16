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

  const menus = {
    student: [
      { name: 'Dashboard', path: '/student', icon: '📊' },
      { name: 'Syllabus', path: '/student/syllabus', icon: '📚' },
      { name: 'Materials', path: '/student/materials', icon: '📄' },
      { name: 'Videos', path: '/student/videos', icon: '🎥' },
      { name: 'AI Tutor', path: '/student/ai-tutor', icon: '🤖' }
    ],
    expert: [
      { name: 'Dashboard', path: '/expert', icon: '📊' },
      { name: 'Syllabus', path: '/expert/syllabus', icon: '📚' },
      { name: 'Materials', path: '/expert/materials', icon: '📄' },
      { name: 'Videos', path: '/expert/videos', icon: '🎥' },
      { name: 'Manage Students', path: '/expert/students', icon: '👥' },
    ] 
  };

  const activeMenu = menus[user?.role] || menus['student'];

  return (
    <aside className="w-64 h-screen bg-slate-900 text-white fixed left-0 top-0 flex flex-col z-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight text-indigo-400">GyanSetu</h1>
        {/* Dynamic Portal Label */}
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
          {user?.role === 'expert' ? 'Expert Portal' : 'Student Portal'}
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {activeMenu.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span> 
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile Section with Logout Popup */}
      <div className="p-4 relative">
        {showLogout && (
          <div className="absolute bottom-20 left-4 right-4 bg-white rounded-xl shadow-2xl p-2 animate-in slide-in-from-bottom-2 border border-gray-100">
            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-red-600 font-bold text-sm hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>🚪</span> Logout
            </button>
          </div>
        )}
        
        <button 
          onClick={() => setShowLogout(!showLogout)}
          className={`w-full bg-slate-800/50 p-3 rounded-2xl flex items-center gap-3 transition-all hover:bg-slate-800 ${showLogout ? 'ring-2 ring-indigo-500' : ''}`}
        >
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="text-left truncate">
            <p className="text-xs font-bold truncate">{user?.full_name || 'User'}</p>
            {/* Dynamic Role Label */}
            <p className="text-[10px] text-slate-500 capitalize">
              {user?.role === 'expert' ? 'GPSC Faculty' : 'GPSC Aspirant'}
            </p>
          </div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;