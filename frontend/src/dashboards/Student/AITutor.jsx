import React, { useState, useEffect, useRef } from 'react';

const AITutor = () => {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Namaste! I am your GyanSetu AI Tutor. I have been upgraded to provide faster, direct answers. Ask me anything about GPSC subjects, exam patterns, or study tips!' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Internal Server Error");
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error) {
      console.error("AI Tutor Error:", error);
      
      // Intelligent Error Message for Rate Limits (429)
      const isRateLimit = error.message.includes("429") || error.message.includes("quota");
      const displayError = isRateLimit 
        ? "⏳ The AI is receiving many requests. Please wait 10 seconds and try again."
        : `⚠️ System Error: ${error.message}. Ensure your backend is running.`;

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: displayError 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <div className="p-6 bg-indigo-600 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shadow-inner animate-pulse">🤖</div>
          <div>
            <h2 className="text-xl font-black tracking-tight">AI Expert Tutor</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Direct Intelligence Active</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setMessages([{ role: 'assistant', content: 'Chat history cleared. How can I help you now?' }])}
          className="text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
        >
          Clear Chat
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
              msg.role === 'user' 
              ? 'bg-indigo-600 text-white rounded-tr-none font-medium' 
              : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none leading-relaxed'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 p-5 rounded-2xl rounded-tl-none shadow-sm">
              <span className="flex gap-1.5">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-300"></span>
              </span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Footer */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your GPSC question here..."
            className="flex-1 p-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all shadow-inner"
          />
          <button 
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-indigo-600 text-white px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? 'Consulting...' : 'Ask AI'}
          </button>
        </form>
        <p className="text-[10px] text-center text-gray-400 mt-3 font-medium">
          Note: This AI model uses its internal database to answer. Always cross-check dates with official notifications.
        </p>
      </div>
    </div>
  );
};

export default AITutor;