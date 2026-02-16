import React, { useState, useEffect } from 'react';

const Materials = () => {
  const [activeCategory, setActiveCategory] = useState('prelims');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/materials?type=material&category=${activeCategory}`);
        if (res.ok) {
          const data = await res.json();
          setMaterials(data);
        }
      } catch (error) {
        console.error("Material fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [activeCategory]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Study Materials</h1>
        <div className="flex gap-3 mt-4">
          {['prelims', 'mains', 'interview'].map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-2xl text-sm font-bold transition-all ${
                activeCategory === cat ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-10 text-center text-gray-400">Loading resources...</div>
        ) : materials.length > 0 ? (
          materials.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="h-40 bg-indigo-50 flex items-center justify-center text-4xl">📄</div>
              <div className="p-6">
                <span className="text-[10px] font-black text-indigo-500 uppercase">{item.subject}</span>
                <h3 className="font-bold text-gray-800 text-lg mb-4">{item.title}</h3>
                <a href={item.file_url} target="_blank" rel="noreferrer" className="block w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 text-center">
                  Download PDF
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <p className="text-gray-400 font-bold">No materials found for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Materials;