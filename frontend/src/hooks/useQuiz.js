import { useState, useCallback } from 'react';
import { fetchQuiz, submitQuizResult, saveBookmarkToDb } from '../utils/api.js';

// Helper to ensure options are always randomized across A, B, C, D
function shuffleQuestionClient(q) {
  if (!q || !Array.isArray(q.options) || q.options.length < 4) return q;
  const rawOptions = q.options.map(opt => opt.replace(/^[A-D\d][.)]\s*/, '').trim());
  const correctIdx = typeof q.correct === 'number' ? q.correct : 0;
  
  const tagged = rawOptions.map((text, idx) => ({
    text,
    isCorrect: idx === correctIdx
  }));

  // Fisher-Yates shuffle
  for (let i = tagged.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = tagged[i];
    tagged[i] = tagged[j];
    tagged[j] = temp;
  }

  const letters = ['A', 'B', 'C', 'D'];
  const newOptions = tagged.map((item, idx) => `${letters[idx]}. ${item.text}`);
  const newCorrectIdx = tagged.findIndex(item => item.isCorrect);

  return {
    ...q,
    options: newOptions,
    correct: newCorrectIdx >= 0 ? newCorrectIdx : 0
  };
}

export function useQuiz() {
  const [topic, setTopic] = useState('Constitutional Law');
  const [questionCount, setQuestionCount] = useState(20);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [wrongAnswers, setWrongAnswers] = useState([]);

  const resetQuiz = useCallback(() => {
    setIsFinished(false);
    setCurrentIndex(0);
    setUserAnswers([]);
    setWrongAnswers([]);
    setQuestions([]);
    setError(null);
  }, []);

  const startQuiz = useCallback(async (selectedTopic, count) => {
    setLoading(true);
    setIsFinished(false);
    setError(null);
    setCurrentIndex(0);
    setUserAnswers([]);
    setWrongAnswers([]);
    const t = selectedTopic || topic;
    const c = count || questionCount;
    setTopic(t);
    setQuestionCount(c);

    try {
      const data = await fetchQuiz(t, c);
      if (data && data.questions && data.questions.length > 0) {
        const shuffledList = data.questions.map(shuffleQuestionClient);
        setQuestions(shuffledList);
      } else {
        setError("Could not generate questions. Please retry.");
      }
    } catch (err) {
      console.error("Failed to start quiz:", err);
      setError("Network or server issue generating quiz. Please retry.");
    } finally {
      setLoading(false);
    }
  }, [topic, questionCount]);

  const handleSelectAnswer = useCallback((isCorrect, answerDetails) => {
    setUserAnswers(prev => [...prev, { isCorrect, ...answerDetails }]);
    if (!isCorrect) {
      const wrongItem = {
        id: Date.now() + Math.random(),
        topic,
        question: answerDetails.question,
        options: answerDetails.options,
        correct: answerDetails.correct,
        selected: answerDetails.selected,
        explanation: answerDetails.explanation,
        date: new Date().toLocaleDateString()
      };

      setWrongAnswers(prev => [...prev, wrongItem]);
      
      // Auto-save wrong answers to bookmarks in localStorage
      try {
        const savedWrong = JSON.parse(localStorage.getItem('sukhman_wrong_answers') || '[]');
        const updated = [wrongItem, ...savedWrong];
        localStorage.setItem('sukhman_wrong_answers', JSON.stringify(updated.slice(0, 50)));

        // Persist to backend SQLite
        saveBookmarkToDb({
          item_type: 'wrong_answer',
          title: (answerDetails.question || '').slice(0, 100),
          content: wrongItem,
          topic
        });
      } catch (e) {
        console.warn("Storage error for wrong answers:", e);
      }
    }
  }, [topic]);

  const finishQuiz = useCallback(async () => {
    setIsFinished(true);
    // Calculate CLAT score: +1 for correct, -0.25 for wrong
    let rawScore = 0;
    let correctCount = 0;
    userAnswers.forEach(ans => {
      if (ans.isCorrect) {
        rawScore += 1;
        correctCount += 1;
      } else {
        rawScore = Math.max(0, rawScore - 0.25);
      }
    });

    const total = questions.length || 1;
    const percentage = Math.round((correctCount / total) * 100);

    let badge = "Back to Books 📚";
    if (percentage >= 80) {
      badge = "NLS Ready 🏆";
    } else if (percentage >= 50) {
      badge = "Keep Grinding 💪";
    }

    // Persist result locally
    try {
      const pastQuizzes = JSON.parse(localStorage.getItem('sukhman_quiz_history') || '[]');
      const newResult = {
        id: Date.now(),
        topic,
        score: Math.round(rawScore * 10) / 10,
        correctCount,
        totalQuestions: total,
        percentage,
        badge,
        date: new Date().toLocaleDateString()
      };
      localStorage.setItem('sukhman_quiz_history', JSON.stringify([newResult, ...pastQuizzes].slice(0, 30)));
      
      // Submit to backend
      submitQuizResult({
        topic,
        score: Math.round(rawScore),
        total,
        percentage,
        badge
      });
    } catch (e) {
      console.warn("Error saving quiz history:", e);
    }
  }, [questions.length, topic, userAnswers]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  }, [currentIndex, questions.length, finishQuiz]);

  const calculateCurrentStats = useCallback(() => {
    let correct = 0;
    let wrong = 0;
    let clatScore = 0;
    userAnswers.forEach(a => {
      if (a.isCorrect) {
        correct++;
        clatScore += 1;
      } else {
        wrong++;
        clatScore -= 0.25;
      }
    });
    const percentage = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    let badge = "Back to Books 📚";
    if (percentage >= 80) badge = "NLS Ready 🏆";
    else if (percentage >= 50) badge = "Keep Grinding 💪";

    return {
      correct,
      wrong,
      clatScore: Math.max(0, Math.round(clatScore * 100) / 100),
      percentage,
      badge
    };
  }, [questions.length, userAnswers]);

  return {
    topic,
    setTopic,
    questionCount,
    setQuestionCount,
    questions,
    currentIndex,
    loading,
    isFinished,
    error,
    startQuiz,
    resetQuiz,
    handleSelectAnswer,
    handleNext,
    userAnswers,
    wrongAnswers,
    calculateCurrentStats
  };
}
