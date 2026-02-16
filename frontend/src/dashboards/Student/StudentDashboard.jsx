import React from 'react';
import { useAuth } from '../../context/AuthContext'; // Ensure the path is correct

const StudentDashboard = () => {
  const { user } = useAuth();

  // Extract first name for a friendlier greeting
  const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'Student';

  const stats = [
    { label: 'Study Hours', value: '156', trend: '+12%', color: 'bg-blue-50' },
    { label: 'Tests Completed', value: '28', trend: '15 this week', color: 'bg-indigo-50' },
    { label: 'Average Score', value: '78%', trend: '+5%', color: 'bg-green-50' },
    { label: 'Leaderboard Rank', value: '#127', trend: 'Top 5%', color: 'bg-orange-50' },
  ];

  const subjectProgress = [
    { name: 'Indian History', progress: 75 },
    { name: 'Gujarat Geography', progress: 60 },
    { name: 'Indian Polity', progress: 85 },
    { name: 'Science & Tech', progress: 45 },
    { name: 'Current Affairs', progress: 90 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        {/* Dynamic Name Integration */}
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {firstName}!
        </h1>
        <p className="text-gray-500">Let's continue your GPSC preparation journey.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.color} p-6 rounded-2xl border border-gray-100 shadow-sm transition hover:shadow-md`}>
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <h3 className="text-2xl font-bold mt-1 text-gray-900">{stat.value}</h3>
            <p className="text-xs text-green-600 mt-2 font-medium">{stat.trend} vs last week</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subject Progress */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-6 text-gray-800">Subject-wise Progress</h2>
          <div className="space-y-6">
            {subjectProgress.map((subject, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{subject.name}</span>
                  <span className="text-sm font-bold text-indigo-600">{subject.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-700 ease-out" 
                    style={{ width: `${subject.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tests */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-6 text-gray-800">Upcoming Tests</h2>
          <div className="space-y-4">
            <div className="p-4 border border-indigo-50 rounded-xl bg-indigo-50/30">
              <p className="font-bold text-sm text-gray-900">Full Length Mock Test #5</p>
              <p className="text-xs text-gray-500 mt-1">Tomorrow, 10:00 AM • 3 hours</p>
            </div>
            <div className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
              <p className="font-bold text-sm text-gray-900">Current Affairs Weekly</p>
              <p className="text-xs text-gray-500 mt-1">Feb 20, 2:00 PM • 1 hour</p>
            </div>
            <button className="w-full mt-2 py-3 text-indigo-600 font-bold text-sm border border-indigo-100 rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-200">
              View All Tests
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;