'use client';

import { useState } from 'react';
import QuizInterface from '@/components/quiz/QuizInterface';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Users, Star } from 'lucide-react';

const sampleQuiz = {
  id: 'html-basics-quiz',
  title: 'HTML Fundamentals Quiz',
  description: 'Test your knowledge of HTML basics including tags, attributes, and structure.',
  timeLimit: 10,
  questions: [
    {
      id: 'q1',
      text: 'What is the correct HTML element for the largest heading?',
      type: 'MULTIPLE_CHOICE' as const,
      options: [
        { id: 'q1-opt1', text: '<h6>', isCorrect: false },
        { id: 'q1-opt2', text: '<h1>', isCorrect: true },
        { id: 'q1-opt3', text: '<heading>', isCorrect: false },
        { id: 'q1-opt4', text: '<head>', isCorrect: false }
      ]
    },
    {
      id: 'q2',
      text: 'Which HTML attribute is used to define inline styles?',
      type: 'MULTIPLE_CHOICE' as const,
      options: [
        { id: 'q2-opt1', text: 'styles', isCorrect: false },
        { id: 'q2-opt2', text: 'class', isCorrect: false },
        { id: 'q2-opt3', text: 'style', isCorrect: true },
        { id: 'q2-opt4', text: 'font', isCorrect: false }
      ]
    },
    {
      id: 'q3',
      text: 'What is the correct HTML for creating a hyperlink?',
      type: 'MULTIPLE_CHOICE' as const,
      options: [
        { id: 'q3-opt1', text: '<a href="url">link</a>', isCorrect: true },
        { id: 'q3-opt2', text: '<link>url</link>', isCorrect: false },
        { id: 'q3-opt3', text: '<hyperlink>url</hyperlink>', isCorrect: false },
        { id: 'q3-opt4', text: '<href>url</href>', isCorrect: false }
      ]
    },
    {
      id: 'q4',
      text: 'Which HTML element is used for the largest heading?',
      type: 'TRUE_FALSE' as const,
      options: [
        { id: 'q4-opt1', text: 'True', isCorrect: false },
        { id: 'q4-opt2', text: 'False', isCorrect: true }
      ]
    },
    {
      id: 'q5',
      text: 'What does HTML stand for?',
      type: 'MULTIPLE_CHOICE' as const,
      options: [
        { id: 'q5-opt1', text: 'Hyper Text Markup Language', isCorrect: true },
        { id: 'q5-opt2', text: 'High Tech Modern Language', isCorrect: false },
        { id: 'q5-opt3', text: 'Home Tool Markup Language', isCorrect: false },
        { id: 'q5-opt4', text: 'Hyperlinks and Text Markup Language', isCorrect: false }
      ]
    }
  ]
};

export default function QuizDemo() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);

  const handleQuizComplete = (results: any) => {
    setQuizResults(results);
    setShowQuiz(false);
  };

  if (showQuiz) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Button 
                variant="ghost" 
                onClick={() => setShowQuiz(false)}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quiz Info
              </Button>
              <span className="font-semibold">HTML Fundamentals Quiz</span>
            </div>
          </div>
        </div>
        
        <QuizInterface quiz={sampleQuiz} onComplete={handleQuizComplete} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => window.history.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>

        {/* Quiz Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-orange-100 text-orange-800">HTML</Badge>
                  <Badge variant="outline">Beginner</Badge>
                </div>
                <CardTitle className="text-3xl">{sampleQuiz.title}</CardTitle>
                <CardDescription className="text-lg">
                  {sampleQuiz.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold">{sampleQuiz.timeLimit} minutes</div>
                  <div className="text-sm text-slate-600">Time limit</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold">{sampleQuiz.questions.length} questions</div>
                  <div className="text-sm text-slate-600">Multiple choice</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold">1,234 taken</div>
                  <div className="text-sm text-slate-600">Attempts</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Instructions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quiz Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">1</div>
              <div>
                <div className="font-medium">Read each question carefully</div>
                <div className="text-sm text-slate-600">Make sure you understand what's being asked before selecting an answer.</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">2</div>
              <div>
                <div className="font-medium">Choose the best answer</div>
                <div className="text-sm text-slate-600">Select the option that best answers the question. You can only choose one answer per question.</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">3</div>
              <div>
                <div className="font-medium">Manage your time</div>
                <div className="text-sm text-slate-600">You have {sampleQuiz.timeLimit} minutes to complete all {sampleQuiz.questions.length} questions. The timer will be visible at all times.</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">4</div>
              <div>
                <div className="font-medium">Earn XP points</div>
                <div className="text-sm text-slate-600">Earn 10 XP for each correct answer. Perfect scores earn bonus XP!</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Results (if available) */}
        {quizResults && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Previous Attempt Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">
                    {quizResults.score}/{quizResults.totalQuestions}
                  </div>
                  <div className="text-sm text-green-600">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">
                    {Math.round((quizResults.score / quizResults.totalQuestions) * 100)}%
                  </div>
                  <div className="text-sm text-green-600">Percentage</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">
                    {Math.floor(quizResults.timeSpent / 60)}:{(quizResults.timeSpent % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-green-600">Time Spent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">
                    +{quizResults.score * 10}
                  </div>
                  <div className="text-sm text-green-600">XP Earned</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Start Quiz Button */}
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={() => setShowQuiz(true)}
            className="px-8 py-3 text-lg"
          >
            Start Quiz
          </Button>
          <p className="text-sm text-slate-600 mt-2">
            Ready to test your HTML knowledge?
          </p>
        </div>
      </div>
    </div>
  );
}