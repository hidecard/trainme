'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Clock, CheckCircle, XCircle, Trophy, Zap } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'CODE_SNIPPET';
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  questions: Question[];
}

interface QuizInterfaceProps {
  quiz: Quiz;
  onComplete: (results: {
    score: number;
    totalQuestions: number;
    timeSpent: number;
    answers: Array<{ questionId: string; optionId: string; isCorrect: boolean }>;
  }) => void;
}

export default function QuizInterface({ quiz, onComplete }: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [answers, setAnswers] = useState<Array<{ questionId: string; optionId: string; isCorrect: boolean }>>([]);
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit ? quiz.timeLimit * 60 : null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  // Timer effect
  useEffect(() => {
    if (timeRemaining === null || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = useCallback(() => {
    if (!selectedOption) return;

    const selectedOptionData = currentQuestion.options.find(opt => opt.id === selectedOption);
    const isCorrect = selectedOptionData?.isCorrect || false;

    const newAnswer = {
      questionId: currentQuestion.id,
      optionId: selectedOption,
      isCorrect
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption('');
    } else {
      handleSubmit(updatedAnswers);
    }
  }, [selectedOption, currentQuestion, answers, currentQuestionIndex, quiz.questions.length]);

  const handleSubmit = (finalAnswers?: typeof answers) => {
    const finalAnswersToUse = finalAnswers || answers;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const score = finalAnswersToUse.filter(answer => answer.isCorrect).length;

    setIsSubmitted(true);
    onComplete({
      score,
      totalQuestions: quiz.questions.length,
      timeSpent,
      answers: finalAnswersToUse
    });
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      // Find the previously selected option for this question
      const previousAnswer = answers.find(a => a.questionId === quiz.questions[currentQuestionIndex - 1].id);
      setSelectedOption(previousAnswer?.optionId || '');
    }
  };

  const getScoreColor = (score: number) => {
    const percentage = (score / quiz.questions.length) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number) => {
    const percentage = (score / quiz.questions.length) * 100;
    if (percentage >= 90) return 'Outstanding! 🎉';
    if (percentage >= 80) return 'Excellent! 🌟';
    if (percentage >= 70) return 'Good job! 👍';
    if (percentage >= 60) return 'Not bad! 💪';
    return 'Keep practicing! 📚';
  };

  if (isSubmitted && showResult) {
    const score = answers.filter(answer => answer.isCorrect).length;
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="text-center">
          <CardHeader>
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
            <CardDescription>
              {quiz.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
                {score}/{quiz.questions.length}
              </div>
              <div className="text-xl text-slate-600">
                {percentage}% Correct
              </div>
              <div className="text-lg font-medium text-slate-700">
                {getScoreMessage(score)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-slate-600">Time Spent</div>
                <div className="font-semibold">{formatTime(timeSpent)}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-slate-600">XP Earned</div>
                <div className="font-semibold text-green-600">+{score * 10}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-left">Review Your Answers:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {quiz.questions.map((question, index) => {
                  const userAnswer = answers.find(a => a.questionId === question.id);
                  const isCorrect = userAnswer?.isCorrect || false;
                  
                  return (
                    <div key={question.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="text-sm">Question {index + 1}</span>
                      </div>
                      <Badge variant={isCorrect ? 'default' : 'destructive'}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => window.location.reload()} className="flex-1">
                Retake Quiz
              </Button>
              <Button variant="outline" onClick={() => window.history.back()} className="flex-1">
                Back to Course
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-slate-600 mt-1">{quiz.description}</p>
            )}
          </div>
          {timeRemaining !== null && (
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              timeRemaining < 60 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl leading-relaxed">
              {currentQuestion.text}
            </CardTitle>
            <Badge variant="outline">
              {currentQuestion.type.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedOption}
            onValueChange={setSelectedOption}
            className="space-y-3"
          >
            {currentQuestion.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-3">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label 
                  htmlFor={option.id} 
                  className="flex-1 cursor-pointer p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!selectedOption}
          className="min-w-24"
        >
          {currentQuestionIndex === quiz.questions.length - 1 ? 'Submit' : 'Next'}
        </Button>
      </div>

      {/* Question Navigation */}
      <div className="mt-6 flex justify-center">
        <div className="flex space-x-2">
          {quiz.questions.map((_, index) => {
            const hasAnswer = answers.some(a => a.questionId === quiz.questions[index].id);
            const isCurrent = index === currentQuestionIndex;
            
            return (
              <button
                key={index}
                onClick={() => {
                  setCurrentQuestionIndex(index);
                  const answer = answers.find(a => a.questionId === quiz.questions[index].id);
                  setSelectedOption(answer?.optionId || '');
                }}
                className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                  isCurrent
                    ? 'bg-blue-600 text-white'
                    : hasAnswer
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}