'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle, Clock, Trophy, X, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  increment,
  setDoc
} from 'firebase/firestore';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit?: number;
  xpReward?: number;
  difficulty?: string;
}

export default function QuizPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const pathId = searchParams.get('path');
  const { user } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    if (id) {
      fetchQuiz();
    }
  }, [id]);

  useEffect(() => {
    if (quizStarted && timeLeft !== null && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      submitQuiz();
    }
  }, [timeLeft, quizStarted]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const quizDoc = await getDoc(doc(db, 'quizzes', id as string));
      if (quizDoc.exists()) {
        const quizData = { id: quizDoc.id, ...quizDoc.data() } as Quiz;
        setQuiz(quizData);
        setSelectedAnswers(new Array((quizData.questions || []).length).fill(-1));
        if (quizData.timeLimit) {
          setTimeLeft(quizData.timeLimit * 60); // Convert minutes to seconds
        }
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < ((quiz?.questions || []).length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitQuiz = async () => {
    if (!quiz || !user) return;

    let correctAnswers = 0;
    (quiz.questions || []).forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / (quiz.questions || []).length) * 100);
    setScore(finalScore);
    setShowResults(true);

    try {
      // Save quiz attempt
      await addDoc(collection(db, 'quizAttempts'), {
        userId: user.uid,
        quizId: id,
        quizTitle: quiz.title,
        pathId: pathId,
        score: finalScore,
        totalQuestions: (quiz.questions || []).length,
        answers: selectedAnswers,
        completedAt: new Date(),
        timeSpent: quiz.timeLimit ? (quiz.timeLimit * 60) - (timeLeft || 0) : null
      });

      // Update learning path progress if pathId is provided
      if (pathId) {
        const pathProgressRef = doc(db, 'userProgress', `${user.uid}_${pathId}`);
        const pathProgressDoc = await getDoc(pathProgressRef);

        if (pathProgressDoc.exists()) {
          const currentProgress = pathProgressDoc.data();
          const completedQuizzes = currentProgress.completedQuizzes || [];
          if (!completedQuizzes.includes(id as string)) {
            await updateDoc(pathProgressRef, {
              completedQuizzes: [...completedQuizzes, id as string],
              lastActivity: new Date().toISOString()
            });
          }
        } else {
          // Create new path progress if it doesn't exist
          await setDoc(pathProgressRef, {
            pathId: pathId,
            completedLessons: [],
            completedQuizzes: [id as string],
            totalXp: 0,
            startedAt: new Date().toISOString(),
            lastActivity: new Date().toISOString()
          });
        }
      }

      // Update user XP if score is good enough
      if (finalScore >= 70) {
        const xpGained = quiz.xpReward || 20;
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          totalXp: increment(xpGained)
        });
      }
    } catch (error) {
      console.error('Error saving quiz attempt:', error);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(new Array((quiz?.questions || []).length).fill(-1));
    setShowResults(false);
    setScore(0);
    setQuizStarted(false);
    if (quiz?.timeLimit) {
      setTimeLeft(quiz.timeLimit * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Quiz Not Found</h1>
          <p className="text-gray-600 mb-8">The quiz you're looking for doesn't exist.</p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-2xl w-full mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">{quiz.title}</CardTitle>
            <CardDescription className="text-lg">{quiz.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{(quiz.questions || []).length}</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{quiz.xpReward || 20}</div>
                <div className="text-sm text-gray-600">XP Reward</div>
              </div>
              {quiz.timeLimit && (
                <div>
                  <div className="text-2xl font-bold text-orange-600">{quiz.timeLimit}</div>
                  <div className="text-sm text-gray-600">Minutes</div>
                </div>
              )}
              <div>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {quiz.difficulty || 'Intermediate'}
                </Badge>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Quiz Instructions:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Read each question carefully</li>
                <li>• Select the best answer for each question</li>
                <li>• You can navigate between questions</li>
                <li>• Submit when you're ready</li>
                {quiz.timeLimit && <li>• Complete within the time limit</li>}
              </ul>
            </div>

            <Button onClick={startQuiz} className="w-full text-lg py-3">
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const correctAnswers = Math.round((score / 100) * (quiz.questions || []).length);
    const passed = score >= 70;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardHeader className="text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                passed ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {passed ? (
                  <Trophy className={`w-10 h-10 ${passed ? 'text-green-600' : 'text-red-600'}`} />
                ) : (
                  <X className="w-10 h-10 text-red-600" />
                )}
              </div>
              <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
              <CardDescription className="text-lg">
                {quiz.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold mb-2" style={{ color: passed ? '#16a34a' : '#dc2626' }}>
                  {score}%
                </div>
                <p className="text-gray-600">
                  {correctAnswers} out of {(quiz.questions || []).length} correct
                </p>
                {passed && (
                  <p className="text-green-600 font-semibold mt-2">
                    Congratulations! You earned {quiz.xpReward || 20} XP!
                  </p>
                )}
              </div>

              <div className="space-y-4">
                {(quiz.questions || []).map((question, index) => {
                  const isCorrect = selectedAnswers[index] === question.correctAnswer;
                  return (
                    <Card key={index} className={`p-4 ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                      <div className="flex items-start space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                          isCorrect ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium mb-2">{question.question}</p>
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="font-medium">Your answer:</span>{' '}
                              <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                                {question.options[selectedAnswers[index]] || 'Not answered'}
                              </span>
                            </p>
                            {!isCorrect && (
                              <p className="text-sm">
                                <span className="font-medium">Correct answer:</span>{' '}
                                <span className="text-green-600">
                                  {question.options[question.correctAnswer]}
                                </span>
                              </p>
                            )}
                          </div>
                          {question.explanation && (
                            <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                              <strong>Explanation:</strong> {question.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="flex gap-4">
                <Button onClick={resetQuiz} variant="outline" className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake Quiz
                </Button>
                <Button
                  onClick={() => window.location.href = pathId ? `/learning-paths/${pathId}` : '/learning-paths'}
                  className="flex-1"
                >
                  Back to Learning Path
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQ = (quiz.questions || [])[currentQuestion];
  const progress = ((currentQuestion + 1) / (quiz.questions || []).length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => window.location.href = pathId ? `/learning-paths/${pathId}` : '/learning-paths'}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit Quiz
            </Button>
            {timeLeft !== null && (
              <div className="flex items-center space-x-2 text-lg font-mono">
                <Clock className="w-5 h-5" />
                <span className={timeLeft < 300 ? 'text-red-600' : 'text-gray-600'}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Question {currentQuestion + 1} of {(quiz.questions || []).length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{currentQ?.question || 'Question not found'}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentQ && (
              <RadioGroup
                value={selectedAnswers[currentQuestion]?.toString()}
                onValueChange={(value) => handleAnswerSelect(currentQuestion, parseInt(value))}
                className="space-y-3"
              >
                {currentQ.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
          >
            Previous
          </Button>

          <div className="flex space-x-2">
            {currentQuestion === (quiz.questions || []).length - 1 ? (
              <Button
                onClick={submitQuiz}
                disabled={selectedAnswers[currentQuestion] === -1}
                className="px-8"
              >
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={selectedAnswers[currentQuestion] === -1}
              >
                Next
              </Button>
            )}
          </div>
        </div>

        {/* Question Navigation */}
        <div className="mt-8">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Jump to Question:</h3>
          <div className="flex flex-wrap gap-2">
            {(quiz.questions || []).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-full text-sm font-medium border-2 ${
                  index === currentQuestion
                    ? 'bg-blue-600 text-white border-blue-600'
                    : selectedAnswers[index] !== -1
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
