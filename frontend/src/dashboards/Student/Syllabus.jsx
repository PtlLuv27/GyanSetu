import React, { useState, useEffect } from 'react';

const Syllabus = () => {
  const [activeCategory, setActiveCategory] = useState('prelims');
  const [syllabusData, setSyllabusData] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'prelims', label: 'Prelims' },
    { id: 'mains', label: 'Mains' },
    { id: 'interview', label: 'Interview' }
  ];

  useEffect(() => {
    const fetchSyllabus = async () => {
      setLoading(true);
      try {
        // We filter for content_type 'syllabus'
        const res = await fetch(`http://localhost:5000/api/materials?type=syllabus&category=${activeCategory}`);
        if (res.ok) {
          const data = await res.json();
          setSyllabusData(data);
        }
      } catch (error) {
        console.error("Database fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSyllabus();
  }, [activeCategory]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">GPSC Syllabus</h1>
        <p className="text-gray-500 mt-1">Official curriculum guidelines and topics.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-3">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full text-left px-5 py-3.5 rounded-2xl font-bold transition-all ${
                activeCategory === cat.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                : 'bg-white text-gray-600 border border-gray-100 hover:border-indigo-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 space-y-4">
          {loading ? (
            <div className="p-10 text-center text-gray-400">Loading syllabus...</div>
          ) : syllabusData.length > 0 ? (
            syllabusData.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between hover:shadow-md transition-all group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-xl">📖</div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{item.title}</h3>
                    <p className="text-xs text-gray-400">{item.subject} • {item.topics_count || 0} Sub-topics</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {item.file_url && (
                    <a 
                      href={item.file_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="px-4 py-2 bg-gray-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      View PDF
                    </a>
                  )}
                  <span className="text-gray-200">❯</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <div className="text-4xl mb-4 text-gray-200">📂</div>
              <p className="text-gray-400 font-bold">No syllabus items found for {activeCategory}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Syllabus;