'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Clock, BookOpen, Trophy, Play, LogOut, Menu, X } from 'lucide-react';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  estimatedTime: number; // in minutes
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  lessons: string[]; // lesson IDs
  quizzes: string[]; // quiz IDs
  isActive: boolean;
}

interface UserProgress {
  pathId: string;
  completedLessons: string[];
  completedQuizzes: string[];
  totalXp: number;
  startedAt: string;
  lastActivity: string;
}

export default function LearningPathsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({});
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchLearningPaths();
  }, [user]);

  useEffect(() => {
    if (user && paths.length > 0) {
      fetchUserProgress();
    }
  }, [user, paths]);

  const fetchLearningPaths = async () => {
    try {
      const pathsSnapshot = await getDocs(collection(db, 'learningPaths'));
      const pathsData = pathsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as LearningPath))
        .filter(path => path.isActive);
      setPaths(pathsData);
    } catch (error) {
      console.error('Error fetching learning paths:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    if (!user) return;

    try {
      const progressPromises = paths.map(async (path) => {
        const progressDoc = await getDoc(doc(db, 'userProgress', `${user.uid}_${path.id}`));
        if (progressDoc.exists()) {
          return { pathId: path.id, ...progressDoc.data() } as UserProgress;
        }
        return null;
      });

      const progressData = await Promise.all(progressPromises);
      const progressMap = progressData.reduce((acc, progress) => {
        if (progress) {
          acc[progress.pathId] = progress;
        }
        return acc;
      }, {} as Record<string, UserProgress>);

      setUserProgress(progressMap);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const startPath = async (path: LearningPath) => {
    if (!user) return;

    try {
      const progressRef = doc(db, 'userProgress', `${user.uid}_${path.id}`);
      const progressData: UserProgress = {
        pathId: path.id,
        completedLessons: [],
        completedQuizzes: [],
        totalXp: 0,
        startedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };

      await setDoc(progressRef, progressData);
      setUserProgress(prev => ({ ...prev, [path.id]: progressData }));

      // Navigate to first lesson or path overview
      if (path.lessons.length > 0) {
        router.push(`/learning-paths/${path.id}`);
      }
    } catch (error) {
      console.error('Error starting path:', error);
    }
  };

  const continuePath = (path: LearningPath) => {
    router.push(`/learning-paths/${path.id}`);
  };

  const calculateProgress = (path: LearningPath): number => {
    const progress = userProgress[path.id];
    if (!progress) return 0;

    const totalItems = path.lessons.length + path.quizzes.length;
    const completedItems = progress.completedLessons.length + progress.completedQuizzes.length;

    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading learning paths...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">TrainMe</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <Button variant="ghost" onClick={() => window.location.href = '/learning-paths'} className="bg-blue-50">
                    Learning Paths
                  </Button>
                  <Button variant="ghost" onClick={() => window.location.href = '/progress'}>
                    Progress
                  </Button>
                  <Button variant="ghost" onClick={() => window.location.href = '/profile'}>
                    Profile
                  </Button>
                  <Button variant="ghost" onClick={() => window.location.href = '/leaderboard'}>
                    Leaderboard
                  </Button>
                  {user.isAdmin && (
                    <Button variant="ghost" onClick={() => window.location.href = '/admin'}>
                      Admin
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => window.location.href = '/learning-paths'} className="bg-blue-50">
                    Learning Paths
                  </Button>
                  <Button variant="ghost" onClick={() => window.location.href = '/auth'}>
                    Sign In
                  </Button>
                  <Button variant="ghost" onClick={() => window.location.href = '/progress'}>
                    Progress
                  </Button>
                  <Button variant="ghost" onClick={() => window.location.href = '/leaderboard'}>
                    Leaderboard
                  </Button>
                  <Button variant="ghost" onClick={() => window.location.href = '/quizzes'}>
                    Quizzes
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t bg-white/95 backdrop-blur-sm">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {user ? (
                  <>
                    <Button variant="ghost" className="w-full justify-start bg-blue-50" onClick={() => { window.location.href = '/learning-paths'; setMobileMenuOpen(false); }}>
                      Learning Paths
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { window.location.href = '/progress'; setMobileMenuOpen(false); }}>
                      Progress
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { window.location.href = '/profile'; setMobileMenuOpen(false); }}>
                      Profile
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { window.location.href = '/leaderboard'; setMobileMenuOpen(false); }}>
                      Leaderboard
                    </Button>
                    {user.isAdmin && (
                      <Button variant="ghost" className="w-full justify-start" onClick={() => { window.location.href = '/admin'; setMobileMenuOpen(false); }}>
                        Admin
                      </Button>
                    )}
                    <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full justify-start bg-blue-50" onClick={() => { window.location.href = '/learning-paths'; setMobileMenuOpen(false); }}>
                      Learning Paths
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { window.location.href = '/auth'; setMobileMenuOpen(false); }}>
                      Sign In
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { window.location.href = '/progress'; setMobileMenuOpen(false); }}>
                      Progress
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { window.location.href = '/leaderboard'; setMobileMenuOpen(false); }}>
                      Leaderboard
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { window.location.href = '/quizzes'; setMobileMenuOpen(false); }}>
                      Quizzes
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4">Learning Paths</h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Choose your path and start your journey to becoming a web development expert
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {paths.map((path) => {
            const progress = calculateProgress(path);
            const hasStarted = userProgress[path.id];
            const isCompleted = progress === 100;

            return (
              <Card key={path.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">{path.icon}</div>
                    <Badge className={getDifficultyColor(path.difficulty)}>
                      {path.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{path.title}</CardTitle>
                  <CardDescription>{path.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        ~{path.estimatedTime} min
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {path.lessons.length} lessons
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        {path.quizzes.length} quizzes
                      </div>
                    </div>

                    {hasStarted && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}

                    <Button
                      className="w-full"
                      onClick={() => hasStarted ? continuePath(path) : startPath(path)}
                      disabled={!user}
                    >
                      {isCompleted ? (
                        <>
                          <Trophy className="h-4 w-4 mr-2" />
                          Completed
                        </>
                      ) : hasStarted ? (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Continue Path
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start Path
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {paths.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No Learning Paths Available</h3>
            <p className="text-slate-500">Check back later for new learning paths!</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
