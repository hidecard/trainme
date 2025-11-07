'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BookOpen, CheckCircle, Clock, Play, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  increment,
  addDoc,
  setDoc
} from 'firebase/firestore';

export default function LessonPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const pathId = searchParams.get('path');
  const { user } = useAuth();

  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (id) {
      fetchLesson();
    }
  }, [id, user]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const lessonDoc = await getDoc(doc(db, 'lessons', id as string));
      if (lessonDoc.exists()) {
        const lessonData = { id: lessonDoc.id, ...lessonDoc.data() };
        setLesson(lessonData);

        // Check if user has completed this lesson
        if (user) {
          const progressQuery = query(
            collection(db, 'userProgress'),
            where('userId', '==', user.uid),
            where('lessonId', '==', id)
          );
          const progressSnapshot = await getDocs(progressQuery);
          if (!progressSnapshot.empty) {
            const progressData = progressSnapshot.docs[0].data();
            setCompleted(progressData.completed || false);
            setProgress(progressData.progress || 0);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async () => {
    if (!user || !lesson) return;

    try {
      // Update or create progress record
      const progressQuery = query(
        collection(db, 'userProgress'),
        where('userId', '==', user.uid),
        where('lessonId', '==', id)
      );
      const progressSnapshot = await getDocs(progressQuery);

      if (!progressSnapshot.empty) {
        // Update existing progress
        await updateDoc(progressSnapshot.docs[0].ref, {
          completed: true,
          progress: 100,
          completedAt: new Date()
        });
      } else {
        // Create new progress record
        await addDoc(collection(db, 'userProgress'), {
          userId: user.uid,
          lessonId: id,
          pathId: pathId,
          completed: true,
          progress: 100,
          completedAt: new Date(),
          startedAt: new Date()
        });
      }

      // Update learning path progress if pathId is provided
      if (pathId) {
        const pathProgressRef = doc(db, 'userProgress', `${user.uid}_${pathId}`);
        const pathProgressDoc = await getDoc(pathProgressRef);

        if (pathProgressDoc.exists()) {
          const currentProgress = pathProgressDoc.data();
          const completedLessons = currentProgress.completedLessons || [];
          if (!completedLessons.includes(id as string)) {
            await updateDoc(pathProgressRef, {
              completedLessons: [...completedLessons, id as string],
              lastActivity: new Date().toISOString()
            });
          }
        } else {
          // Create new path progress if it doesn't exist
          await setDoc(pathProgressRef, {
            pathId: pathId,
            completedLessons: [id as string],
            completedQuizzes: [],
            totalXp: 0,
            startedAt: new Date().toISOString(),
            lastActivity: new Date().toISOString()
          });
        }
      }

      // Update user XP and level
      const xpGained = lesson.xpReward || 10;
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        totalXp: increment(xpGained),
        lessonsCompleted: increment(1)
      });

      setCompleted(true);
      setProgress(100);

      // Show success message
      alert(`Lesson completed! You earned ${xpGained} XP!`);
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Lesson Not Found</h1>
          <p className="text-gray-600 mb-8">The lesson you're looking for doesn't exist.</p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => window.location.href = pathId ? `/learning-paths/${pathId}` : '/learning-paths'}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Learning Path
            </Button>
            <div className="flex items-center space-x-2">
              <Badge variant={completed ? "default" : "secondary"}>
                {completed ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Completed
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-1" />
                    In Progress
                  </>
                )}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
                <p className="text-gray-600">{lesson.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{lesson.estimatedTime || 15} min read</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4" />
                <span>{lesson.xpReward || 10} XP</span>
              </div>
              <div className="flex items-center space-x-1">
                <Badge variant="outline">{lesson.difficulty || 'Beginner'}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lesson Content */}
            <Card>
              <CardHeader>
                <CardTitle>Lesson Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {lesson.content ? (
                    <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                  ) : (
                    <div className="text-gray-600">
                      <p>This lesson content is being prepared. Please check back soon!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Code Examples */}
            {lesson.codeExamples && lesson.codeExamples.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Code Examples</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lesson.codeExamples.map((example: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">{example.title}</h4>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                          <code>{example.code}</code>
                        </pre>
                        {example.explanation && (
                          <p className="text-sm text-gray-600 mt-2">{example.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quiz Section */}
            {lesson.quizId && (
              <Card>
                <CardHeader>
                  <CardTitle>Test Your Knowledge</CardTitle>
                  <CardDescription>
                    Complete the quiz to reinforce what you've learned.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => window.location.href = `/quiz-demo?id=${lesson.quizId}`}
                    className="w-full"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Take Quiz
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!completed ? (
                  <Button onClick={markAsCompleted} className="w-full">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Completed
                  </Button>
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-green-600 font-semibold">Lesson Completed!</p>
                    <p className="text-sm text-gray-600">Great job!</p>
                  </div>
                )}

                {lesson.quizId && (
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = `/quiz-demo?id=${lesson.quizId}`}
                    className="w-full"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Practice Quiz
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Lesson Info */}
            <Card>
              <CardHeader>
                <CardTitle>Lesson Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty</span>
                  <Badge variant="outline">{lesson.difficulty || 'Beginner'}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">XP Reward</span>
                  <span className="font-semibold">{lesson.xpReward || 10} XP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Time</span>
                  <span>{lesson.estimatedTime || 15} min</span>
                </div>
                {lesson.tags && lesson.tags.length > 0 && (
                  <div>
                    <span className="text-gray-600 block mb-2">Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {lesson.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
