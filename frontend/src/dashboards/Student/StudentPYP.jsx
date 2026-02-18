import React, { useEffect, useState } from 'react';

const StudentPYP = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState('All');

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      // Fetching from the same backend structure as your Materials component
      const res = await fetch('http://localhost:5000/api/pyp');
      const data = await res.json();
      
      if (res.ok) {
        // Ensure data is an array before setting state
        setPapers(Array.isArray(data) ? data : []);
      } else {
        console.error("Backend error:", data.error);
      }
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Improved Filter logic with safety checks for null/undefined values
  const filteredPapers = papers.filter(paper => {
    const title = paper.title || "";
    const examName = paper.exam_name || "";
    
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExam = selectedExam === 'All' || examName === selectedExam;
    
    return matchesSearch && matchesExam;
  });

  // Generate unique exam list safely
  const uniqueExams = ['All', ...new Set(papers.map(p => p.exam_name).filter(Boolean))];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Previous Year Papers 📜</h1>
          <p className="text-gray-500 font-medium mt-1">Access actual GPSC questions from past exams.</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <input 
            type="text"
            placeholder="Search papers..."
            className="px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none w-full"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white font-bold text-sm"
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
          >
            {uniqueExams.map(exam => <option key={exam} value={exam}>{exam}</option>)}
          </select>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredPapers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map((paper) => (
            <div key={paper.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col">
              {/* Visual Header matching Materials style */}
              <div className="h-32 bg-indigo-50 flex items-center justify-center text-4xl">📜</div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                    {paper.exam_year || 'Year N/A'}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-50 px-2 py-0.5 rounded-md">
                    {paper.category}
                  </span>
                </div>
                
                <h3 className="font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition-colors">
                  {paper.exam_name || 'General Paper'}
                </h3>
                <p className="text-sm text-gray-500 mb-6 flex-1">{paper.title}</p>
                
                <div className="pt-4 border-t border-gray-50 space-y-3">
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                    <span>Subject: {paper.subject || 'Mixed'}</span>
                  </div>
                  <a 
                    href={paper.file_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="block w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 text-center transition-all"
                  >
                    Download PDF 📥
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <p className="text-gray-400 font-bold">No papers found matching your filters.</p>
        </div>
      )}
    </div>
  );
};

export default StudentPYP;