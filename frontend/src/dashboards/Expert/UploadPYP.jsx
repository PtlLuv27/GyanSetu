import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const UploadPYP = () => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [myPapers, setMyPapers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Indian Polity',
    exam_name: 'GPSC Class 1/2',
    exam_year: new Date().getFullYear(),
    category: 'prelims'
  });

  useEffect(() => {
    fetchMyPapers();
  }, []);

  const fetchMyPapers = async () => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('content_type', 'pyp')
      .order('created_at', { ascending: false });
    
    if (!error) setMyPapers(data);
  };

  const handleDelete = async (paper) => {
    if (!window.confirm("Are you sure you want to delete this paper?")) return;

    try {
      // 1. Delete from Storage
      const fileName = paper.file_url.split('/').pop();
      await supabase.storage.from('gyansetu-files').remove([`materials/${fileName}`]);

      // 2. Delete from Database
      await supabase.from('materials').delete().eq('id', paper.id);

      alert("Paper deleted successfully");
      fetchMyPapers();
    } catch (error) {
      alert("Delete failed: " + error.message);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a PDF file");

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `materials/${fileName}`; 

      const { error: uploadError } = await supabase.storage
        .from('gyansetu-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('gyansetu-files').getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('materials').insert([{
        ...formData,
        file_url: urlData.publicUrl,
        content_type: 'pyp', 
        uploaded_by: user.id
      }]);

      if (dbError) throw dbError;
      
      alert("Previous Year Paper uploaded successfully! 🚀");
      setFile(null);
      fetchMyPapers(); // Refresh list
    } catch (error) {
      console.error(error);
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* Upload Form Section */}
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-gray-800">Upload Previous Year Paper 📚</h2>
          <p className="text-gray-500 text-sm">Add real exam papers to the GyanSetu database.</p>
        </div>

        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-black uppercase text-gray-400 mb-2">Paper Title</label>
            <input 
              type="text" required
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 outline-none transition-all"
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-gray-400 mb-2">Exam Name</label>
            <select 
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 outline-none"
              onChange={(e) => setFormData({...formData, exam_name: e.target.value})}
            >
              <option>GPSC Class 1/2</option>
              <option>DYSO</option>
              <option>STI</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-gray-400 mb-2">Exam Year</label>
            <input 
              type="number" required
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 outline-none"
              onChange={(e) => setFormData({...formData, exam_year: e.target.value})}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-black uppercase text-gray-400 mb-2">PDF Document</label>
            <input 
              type="file" accept=".pdf" required
              className="w-full p-4 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-indigo-400 transition-all"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          <button 
            type="submit" disabled={uploading}
            className="md:col-span-2 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            {uploading ? 'Processing Upload...' : 'Publish Paper'}
          </button>
        </form>
      </div>

      {/* Management Table Section */}
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <h3 className="text-xl font-black text-gray-800 mb-6">Manage Uploaded Papers 📂</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-4 text-xs font-black uppercase text-gray-400">Title</th>
                <th className="pb-4 text-xs font-black uppercase text-gray-400">Exam</th>
                <th className="pb-4 text-xs font-black uppercase text-gray-400">Year</th>
                <th className="pb-4 text-xs font-black uppercase text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {myPapers.map((paper) => (
                <tr key={paper.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 font-bold text-gray-800">{paper.title}</td>
                  <td className="py-4 text-sm text-gray-500">{paper.exam_name}</td>
                  <td className="py-4 text-sm font-black text-indigo-600">{paper.exam_year}</td>
                  <td className="py-4 flex gap-3">
                    <a href={paper.file_url} target="_blank" rel="noreferrer" className="p-2 hover:bg-white rounded-lg shadow-sm border border-gray-100">👁️</a>
                    <button onClick={() => handleDelete(paper)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg shadow-sm border border-gray-100">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UploadPYP;