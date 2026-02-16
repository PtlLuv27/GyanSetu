import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const UploadMaterials = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ title: '', category: 'prelims', subject: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [list, setList] = useState([]);

  const fetchMyMaterials = async () => {
    if (!user) return;
    // We select specifically by uploaded_by to ensure the Expert only sees their own work
    const { data, error } = await supabase.from('materials')
      .select('*')
      .eq('content_type', 'material')
      .eq('uploaded_by', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Fetch Error:", error.message);
    } else {
      setList(data || []);
    }
  };

  useEffect(() => { fetchMyMaterials(); }, [user]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file first!");

    setUploading(true);
    try {
      // 1. Upload File to Supabase Storage Bucket 'gyansetu-files'
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `materials/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gyansetu-files')
        .upload(filePath, file);

      if (uploadError) throw new Error(`Storage Error: ${uploadError.message}`);

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gyansetu-files')
        .getPublicUrl(filePath);

      // 3. Save Record to Materials Table
      // This step fails with "new row violates RLS" if your role isn't 'expert' in the users table
      const { error: dbError } = await supabase.from('materials').insert([{
        ...formData,
        file_url: publicUrl,
        content_type: 'material',
        uploaded_by: user.id
      }]);

      if (dbError) throw new Error(`Database Error: ${dbError.message}`);

      alert("Material published successfully!");
      setFile(null);
      e.target.reset(); // Reset the form UI
      fetchMyMaterials();
    } catch (error) {
      console.error(error);
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
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Study Material</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <input 
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" 
            placeholder="Material Title" 
            required
            onChange={e => setFormData({...formData, title: e.target.value})} 
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" 
              placeholder="Subject (e.g. History)" 
              required
              onChange={e => setFormData({...formData, subject: e.target.value})} 
            />
            <input 
              type="file" 
              accept=".pdf,.doc,.docx"
              className="p-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer"
              onChange={e => setFile(e.target.files[0])} 
            />
          </div>
          <button 
            disabled={uploading}
            className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
          >
            {uploading ? "Processing Upload..." : "Publish to Student Portal"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Recently Uploaded</h3>
            <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full uppercase">Material Library</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-black uppercase text-gray-400">
              <tr>
                <th className="p-6">Content Title</th>
                <th className="p-6">Subject</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {list.map(m => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-6">
                    <p className="font-bold text-gray-800">{m.title}</p>
                    <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-tighter">{m.category}</p>
                  </td>
                  <td className="p-6 text-gray-500 font-medium">{m.subject}</td>
                  <td className="p-6 text-right space-x-4">
                    <a 
                        href={m.file_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-indigo-600 text-sm font-bold hover:text-indigo-800 transition-colors"
                    >
                        Preview
                    </a>
                    <button 
                      onClick={() => handleDelete(m.id)} 
                      className="text-red-500 text-sm font-bold hover:text-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && (
            <div className="p-12 text-center text-gray-400 font-medium">
                No materials uploaded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadMaterials;