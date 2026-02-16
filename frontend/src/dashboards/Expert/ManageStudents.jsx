import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        // Use ilike for case-insensitive matching ('student' vs 'Student')
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .ilike('role', 'student')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setStudents(data || []);
      } catch (err) {
        console.error("Error fetching students:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Students</h1>
          <p className="text-gray-500 text-sm">Review and manage registered GPSC aspirants.</p>
        </div>
        <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-black uppercase">
          {students.length} Total Enrolled
        </div>
      </div>
      
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
            <tr>
              <th className="p-6">Student Name</th>
              <th className="p-6">Email Address</th>
              <th className="p-6">Registration Date</th>
              <th className="p-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan="4" className="p-20 text-center text-gray-400 font-medium">
                  Searching database...
                </td>
              </tr>
            ) : students.map(s => (
              <tr key={s.id} className="hover:bg-gray-50 transition group">
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">
                      {s.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-gray-800">{s.full_name}</span>
                  </div>
                </td>
                <td className="p-6 text-gray-500 font-medium">{s.email}</td>
                <td className="p-6 text-gray-400 text-sm">
                  {s.created_at ? new Date(s.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  }) : 'N/A'}
                </td>
                <td className="p-6 text-right">
                  <span className="bg-green-50 text-green-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {students.length === 0 && !loading && (
          <div className="p-20 text-center">
            <div className="text-4xl mb-4">👥</div>
            <p className="text-gray-400 font-bold">No students found.</p>
            <p className="text-gray-300 text-sm">Ensure your users have the 'student' role assigned in the database.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStudents;