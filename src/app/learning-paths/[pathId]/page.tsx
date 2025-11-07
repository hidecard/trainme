'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { ArrowLeft, BookOpen, HelpCircle, CheckCircle, Play, Trophy } from 'lucide-react';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  estimatedTime: number;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  lessons: string[];
  quizzes: string[];
  isActive: boolean;
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  order: number;
  isPublished: boolean;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  timeLimit?: number;
  isPublished: boolean;
}

interface UserProgress {
  pathId: string;
  completedLessons: string[];
  completedQuizzes: string[];
  totalXp: number;
  startedAt: string;
  lastActivity: string;
}

export default function LearningPathDetailPage() {
  const { pathId } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [path, setPath] = useState<LearningPath | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathId) {
      fetchPathData();
    }
  }, [pathId]);

  useEffect(() => {
    if (user && path) {
      fetchUserProgress();
    }
  }, [user, path]);

  const fetchPathData = async () => {
    try {
      const pathDoc = await getDoc(doc(db, 'learningPaths', pathId as string));
      if (pathDoc.exists()) {
        const pathData = { id: pathDoc.id, ...pathDoc.data() } as LearningPath;
        setPath(pathData);

        // Fetch lessons and quizzes
        await fetchLessonsAndQuizzes(pathData);
      }
    } catch (error) {
      console.error('Error fetching path data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessonsAndQuizzes = async (pathData: LearningPath) => {
    try {
      const [lessonsSnapshot, quizzesSnapshot] = await Promise.all([
        getDocs(collection(db, 'lessons')),
        getDocs(collection(db, 'quizzes'))
      ]);

      const allLessons = lessonsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lesson));
      const allQuizzes = quizzesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));

      const pathLessons = allLessons.filter(lesson => pathData.lessons.includes(lesson.id));
      const pathQuizzes = allQuizzes.filter(quiz => pathData.quizzes.includes(quiz.id));

      setLessons(pathLessons);
      setQuizzes(pathQuizzes);
    } catch (error) {
      console.error('Error fetching lessons and quizzes:', error);
    }
  };

  const fetchUserProgress = async () => {
    if (!user || !path) return;

    try {
      const progressDoc = await getDoc(doc(db, 'userProgress', `${user.uid}_${path.id}`));
      if (progressDoc.exists()) {
        setUserProgress({ pathId: path.id, ...progressDoc.data() } as UserProgress);
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const startLesson = async (lessonId: string) => {
    if (!user || !path) return;

    // Initialize progress if not exists
    if (!userProgress) {
      const progressRef = doc(db, 'userProgress', `${user.uid}_${path.id}`);
      const newProgress: UserProgress = {
        pathId: path.id,
        completedLessons: [],
        completedQuizzes: [],
        totalXp: 0,
        startedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };
      await setDoc(progressRef, newProgress);
      setUserProgress(newProgress);
    }

    router.push(`/lessons/${lessonId}?path=${path.id}`);
  };

  const startQuiz = async (quizId: string) => {
    if (!user || !path) return;

    // Initialize progress if not exists
    if (!userProgress) {
      const progressRef = doc(db, 'userProgress', `${user.uid}_${path.id}`);
      const newProgress: UserProgress = {
        pathId: path.id,
        completedLessons: [],
        completedQuizzes: [],
        totalXp: 0,
        startedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };
      await setDoc(progressRef, newProgress);
      setUserProgress(newProgress);
    }

    router.push(`/quizzes/${quizId}?path=${path.id}`);
  };

  const calculateProgress = (): number => {
    if (!path || !userProgress) return 0;

    const totalItems = path.lessons.length + path.quizzes.length;
    const completedItems = userProgress.completedLessons.length + userProgress.completedQuizzes.length;

    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  };

  const isItemCompleted = (itemId: string, type: 'lesson' | 'quiz'): boolean => {
    if (!userProgress) return false;

    return type === 'lesson'
      ? userProgress.completedLessons.includes(itemId)
      : userProgress.completedQuizzes.includes(itemId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading learning path...</p>
        </div>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">Learning Path Not Found</h3>
          <Button onClick={() => router.push('/learning-paths')}>
            Back to Learning Paths
          </Button>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const isCompleted = progress === 100;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="outline" onClick={() => router.push('/learning-paths')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Learning Paths
          </Button>

          <div className="flex items-center gap-4 mb-6">
            <div className="text-4xl">{path.icon}</div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{path.title}</h1>
              <p className="text-slate-600">{path.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <Badge className={getDifficultyColor(path.difficulty)}>
              {path.difficulty}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-slate-600">
              <BookOpen className="h-4 w-4" />
              {path.lessons.length} lessons
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-600">
              <HelpCircle className="h-4 w-4" />
              {path.quizzes.length} quizzes
            </div>
          </div>

          {userProgress && (
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Your Progress</h3>
                <span className="text-sm text-slate-600">{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-3" />
              {isCompleted && (
                <div className="flex items-center gap-2 mt-2 text-green-600">
                  <Trophy className="h-4 w-4" />
                  <span className="text-sm font-medium">Path Completed!</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Lessons Section */}
          {lessons.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Lessons</h2>
              <div className="space-y-4">
                {lessons
                  .sort((a, b) => a.order - b.order)
                  .map((lesson, index) => {
                    const isCompleted = isItemCompleted(lesson.id, 'lesson');
                    return (
                      <Card key={lesson.id} className={`transition-all ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold">
                                {index + 1}
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{lesson.title}</h3>
                                {lesson.description && (
                                  <p className="text-slate-600 text-sm">{lesson.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isCompleted && (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              )}
                              <Button
                                onClick={() => startLesson(lesson.id)}
                                disabled={!user}
                              >
                                {isCompleted ? 'Review' : 'Start'} Lesson
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Quizzes Section */}
          {quizzes.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Quizzes</h2>
              <div className="space-y-4">
                {quizzes.map((quiz, index) => {
                  const isCompleted = isItemCompleted(quiz.id, 'quiz');
                  return (
                    <Card key={quiz.id} className={`transition-all ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-semibold">
                              Q{index + 1}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{quiz.title}</h3>
                              {quiz.description && (
                                <p className="text-slate-600 text-sm">{quiz.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {quiz.timeLimit} min
                                </Badge>
                                <Badge className={`text-xs ${getDifficultyColor(quiz.difficulty)}`}>
                                  {quiz.difficulty}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isCompleted && (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                            <Button
                              onClick={() => startQuiz(quiz.id)}
                              disabled={!user}
                              variant={isCompleted ? 'outline' : 'default'}
                            >
                              {isCompleted ? 'Retake' : 'Start'} Quiz
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
