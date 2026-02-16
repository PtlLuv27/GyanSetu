import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const UploadSyllabus = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ title: '', category: 'prelims', subject: '', topics_count: 0 });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [list, setList] = useState([]);

  const fetchMySyllabus = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('materials')
      .select('*')
      .eq('content_type', 'syllabus')
      .eq('uploaded_by', user.id)
      .order('created_at', { ascending: false });
    
    if (error) console.error("Fetch error:", error.message);
    else setList(data || []);
  };

  useEffect(() => { fetchMySyllabus(); }, [user]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let publicUrl = '';

      if (file) {
        // 1. Upload to Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `syllabus_${Date.now()}.${fileExt}`;
        const filePath = `syllabus/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('gyansetu-files')
          .upload(filePath, file);

        if (uploadError) throw new Error(`Storage Error: ${uploadError.message}`);

        // 2. Get Public URL
        const { data: { publicUrl: url } } = supabase.storage
          .from('gyansetu-files')
          .getPublicUrl(filePath);
        
        publicUrl = url;
      }

      // 3. Insert into Database
      const { error: dbError } = await supabase.from('materials').insert([{
        ...formData,
        file_url: publicUrl,
        content_type: 'syllabus',
        uploaded_by: user.id
      }]);

      if (dbError) throw new Error(`Database Error: ${dbError.message}`);

      alert("Syllabus item added successfully!");
      setFile(null);
      e.target.reset(); // Clear form
      fetchMySyllabus();
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

const handleDelete = async (id) => {
  if (!window.confirm("Delete this entry?")) return;
  
  // This will now work because of the SQL policy added in Step 1
  const { error } = await supabase
    .from('materials')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Delete Error:", error.message);
    alert("Could not delete: " + error.message);
  } else {
    // Re-fetch the list to update the UI
    fetchMyContent(); 
  }
};

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Syllabus Topic</h2>
        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
            placeholder="Topic Title" 
            required 
            onChange={e => setFormData({...formData, title: e.target.value})} 
          />
          <select 
            className="p-3 border border-gray-200 rounded-xl outline-none" 
            onChange={e => setFormData({...formData, category: e.target.value})}
          >
            <option value="prelims">Prelims</option>
            <option value="mains">Mains</option>
            <option value="interview">Interview</option>
          </select>
          <input 
            className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
            placeholder="Subject" 
            required
            onChange={e => setFormData({...formData, subject: e.target.value})} 
          />
          <input 
            type="file" 
            accept=".pdf"
            className="p-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700 font-bold cursor-pointer"
            onChange={e => setFile(e.target.files[0])} 
          />
          <button 
            disabled={uploading}
            className="md:col-span-2 bg-indigo-600 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-all"
          >
            {uploading ? "Processing..." : "Publish Syllabus Topic"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <h3 className="font-bold text-gray-700">Published Topics</h3>
            <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full uppercase">Syllabus Registry</span>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs font-black uppercase text-gray-400">
            <tr>
              <th className="p-6">Topic</th>
              <th className="p-6">Category</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {list.map(item => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-6">
                   <p className="font-bold text-gray-800">{item.title}</p>
                   <p className="text-xs text-gray-400">{item.subject}</p>
                </td>
                <td className="p-6 uppercase text-[10px] font-black text-indigo-600 tracking-widest">{item.category}</td>
                <td className="p-6 text-right space-x-4">
                  {item.file_url && (
                    <a href={item.file_url} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">View PDF</a>
                  )}
                  <button onClick={() => handleDelete(item.id)} className="text-red-500 font-bold hover:underline text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UploadSyllabus;