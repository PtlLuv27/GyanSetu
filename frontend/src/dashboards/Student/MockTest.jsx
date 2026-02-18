import React, { useState } from 'react';
import { useAuth } from "../../context/AuthContext";
const MockTest = () => {
    const { user } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [currentStep, setCurrentStep] = useState(0); // 0: Setup, 1: Quiz, 2: Result
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [testId, setTestId] = useState(null); // To link attempt to a test

    const startQuiz = async (subject) => {
        setLoading(true);
        try {
            // Updated to fetch from your new DB-only endpoint
            const res = await fetch('http://localhost:5000/api/ai/generate-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject })
            });
            const data = await res.json();
            
            if (res.ok) {
                setQuestions(data);
                // Assume the first question's test_id if available, or use a default
                setTestId(data[0]?.test_id || 1); 
                setCurrentStep(1);
            } else {
                alert(data.error || "No questions found for this subject.");
            }
        } catch (err) {
            alert("Database connection failed");
        } finally {
            setLoading(false);
        }
    };

    const saveResult = async (finalScore) => {
        const accuracy = (finalScore / questions.length) * 100;
        try {
            await fetch('http://localhost:5000/api/test/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    test_id: testId,
                    score: finalScore,
                    accuracy: accuracy.toFixed(2)
                })
            });
        } catch (err) {
            console.error("Failed to save result:", err);
        }
    };

    const handleAnswer = (idx) => {
        setSelectedOption(idx);
        setShowExplanation(true);
        if (idx === questions[currentIndex].correct_answer) {
            setScore(prev => prev + 1);
        }
    };

    const nextQuestion = () => {
        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(currentIndex + 1);
            setSelectedOption(null);
            setShowExplanation(false);
        } else {
            const finalScore = score + (selectedOption === questions[currentIndex].correct_answer ? 1 : 0);
            saveResult(finalScore);
            setCurrentStep(2);
        }
    };

    if (loading) return <div className="p-10 text-center font-bold animate-pulse text-indigo-600">Fetching Real GPSC Questions... 📜</div>;

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-3xl shadow-2xl mt-10 border border-gray-100">
            {currentStep === 0 && (
                <div className="text-center">
                    <h2 className="text-3xl font-black mb-2 text-gray-800">Mock Test Center</h2>
                    <p className="text-gray-500 mb-8 font-medium">Test your knowledge with previous year questions.</p>
                    <div className="grid grid-cols-2 gap-4">
                        {['Gujarat History', 'Indian Polity', 'Geography', 'Economics'].map(s => (
                            <button key={s} onClick={() => startQuiz(s)} className="p-6 bg-slate-50 border-2 border-transparent hover:border-indigo-500 hover:bg-white rounded-2xl transition-all font-bold text-gray-700 shadow-sm">
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {currentStep === 1 && questions.length > 0 && (
                <div>
                    <div className="flex justify-between mb-6 items-center">
                        <span className="px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-black uppercase">
                            Question {currentIndex + 1} of {questions.length}
                        </span>
                        <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-indigo-600 transition-all duration-500" 
                                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-8 text-gray-800 leading-relaxed">
                        {questions[currentIndex].question}
                    </h3>

                    <div className="space-y-4">
                        {questions[currentIndex].options.map((opt, i) => {
                            const isCorrect = i === questions[currentIndex].correct_answer;
                            const isSelected = i === selectedOption;
                            
                            let btnStyle = "border-gray-100 hover:border-indigo-300 bg-gray-50";
                            if (showExplanation) {
                                if (isCorrect) btnStyle = "border-green-500 bg-green-50 text-green-700";
                                else if (isSelected) btnStyle = "border-red-400 bg-red-50 text-red-700";
                                else btnStyle = "border-gray-100 opacity-50";
                            }

                            return (
                                <button 
                                    key={i} 
                                    disabled={showExplanation}
                                    onClick={() => handleAnswer(i)}
                                    className={`w-full p-5 text-left rounded-2xl border-2 font-bold transition-all flex justify-between items-center ${btnStyle}`}
                                >
                                    {opt}
                                    {showExplanation && isCorrect && <span>✅</span>}
                                    {showExplanation && isSelected && !isCorrect && <span>❌</span>}
                                </button>
                            );
                        })}
                    </div>

                    {showExplanation && (
                        <div className="mt-8 animate-in slide-in-from-top-4 duration-300">
                            <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <p className="text-sm text-indigo-900 leading-relaxed">
                                    <span className="font-black uppercase text-[10px] block mb-1">Expert Explanation</span>
                                    {questions[currentIndex].explanation}
                                </p>
                            </div>
                            <button onClick={nextQuestion} className="mt-6 w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 shadow-xl transition-all">
                                {currentIndex + 1 === questions.length ? "Finish & Save" : "Next Question →"}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {currentStep === 2 && (
                <div className="text-center py-10">
                    <div className="text-6xl mb-6">🏆</div>
                    <h2 className="text-4xl font-black text-gray-800 mb-2">Quiz Complete!</h2>
                    <p className="text-gray-500 font-bold mb-8">Your results have been saved to your profile.</p>
                    
                    <div className="bg-indigo-600 text-white p-8 rounded-3xl mb-8 inline-block min-w-[200px]">
                        <p className="text-xs uppercase font-black opacity-70 mb-1">Final Score</p>
                        <p className="text-5xl font-black">{score} <span className="text-xl opacity-50">/ {questions.length}</span></p>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button onClick={() => window.location.reload()} className="bg-gray-100 text-gray-800 px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-gray-200 transition-all">
                            Retake Quiz
                        </button>
                        <button onClick={() => window.location.href = '/student'} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MockTest;