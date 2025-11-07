'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import {
  Trophy,
  Zap,
  Star,
  Target,
  Award,
  Flame,
  TrendingUp,
  BookOpen,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  getDoc,
  doc,
  serverTimestamp 
} from 'firebase/firestore';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: string;
}

interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  achievement: Achievement;
}

interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: string;
}

export default function ProgressDashboard() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'achievements'>('overview');
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, refreshKey]);

  const fetchUserData = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Fetch user achievements
      const achievementsQuery = query(
        collection(db, 'userAchievements'),
        where('userId', '==', user.uid)
      );
      const achievementsSnapshot = await getDocs(achievementsQuery);
      const achievementsData = achievementsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UserAchievement));
      setUserAchievements(achievementsData);

      // Fetch recent quiz attempts
      const attemptsQuery = query(
        collection(db, 'quizAttempts'),
        where('userId', '==', user.uid),
        limit(10)
      );
      const attemptsSnapshot = await getDocs(attemptsQuery);
      const attemptsData = attemptsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as QuizAttempt));
      setQuizAttempts(attemptsData);

    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate XP needed for next level
  const getXpForNextLevel = (level: number) => {
    return level * 100; // Simple formula: 100 XP per level
  };

  const currentLevelXp = user ? getXpForNextLevel(user.level - 1) : 0;
  const nextLevelXp = user ? getXpForNextLevel(user.level) : 100;
  const xpProgress = user ? ((user.totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100 : 0;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-purple-600 bg-purple-100';
    if (streak >= 14) return 'text-red-600 bg-red-100';
    if (streak >= 7) return 'text-orange-600 bg-orange-100';
    if (streak >= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getLevelColor = (level: number) => {
    if (level >= 20) return 'text-purple-600';
    if (level >= 15) return 'text-blue-600';
    if (level >= 10) return 'text-green-600';
    if (level >= 5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  // Calculate additional stats
  const totalQuizzesTaken = quizAttempts.length;
  const averageScore = totalQuizzesTaken > 0 
    ? quizAttempts.reduce((sum, attempt) => sum + (attempt.score / attempt.totalQuestions) * 100, 0) / totalQuizzesTaken
    : 0;
  const totalStudyTime = quizAttempts.reduce((sum, attempt) => sum + (attempt.timeSpent || 0), 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <p>Please sign in to view your progress.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Your Progress</h1>
            <p className="text-slate-600 text-sm md:text-base">Track your learning journey and achievements</p>
          </div>
          <Button onClick={() => setRefreshKey(prev => prev + 1)} variant="outline" size="sm" className="flex-shrink-0">
            <RefreshCw className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Level Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-bl-full opacity-10"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Trophy className={`w-6 h-6 ${getLevelColor(user.level)}`} />
                <Badge variant="outline" className="text-xs">
                  Level {user.level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold">{user.totalXp.toLocaleString()}</div>
                  <div className="text-sm text-slate-600">Total XP</div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>{nextLevelXp - user.totalXp} XP to Level {user.level + 1}</span>
                    <span>{Math.round(xpProgress)}%</span>
                  </div>
                  <Progress value={xpProgress} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Streak Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-bl-full opacity-10"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Flame className="w-6 h-6 text-orange-600" />
                <Badge className={`text-xs ${getStreakColor(user.streak)}`}>
                  {user.streak} days
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold">{user.streak}</div>
                  <div className="text-sm text-slate-600">Day Streak</div>
                </div>
                <div className="text-xs text-slate-600">
                  Keep it up! Come back tomorrow to maintain your streak.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quizzes Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-bl-full opacity-10"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <BookOpen className="w-6 h-6 text-green-600" />
                <Badge variant="outline" className="text-xs">
                  {isNaN(averageScore) ? 0 : Math.round(averageScore)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold">{totalQuizzesTaken}</div>
                  <div className="text-sm text-slate-600">Quizzes Taken</div>
                </div>
                <Progress value={isNaN(averageScore) ? 0 : averageScore} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Study Time Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-bl-full opacity-10"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Clock className="w-6 h-6 text-purple-600" />
                <Badge variant="outline" className="text-xs">
                  This week
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold">{formatTime(Math.floor(totalStudyTime / 60))}</div>
                  <div className="text-sm text-slate-600">Study Time</div>
                </div>
                <div className="text-xs text-slate-600">
                  Great consistency! You're making steady progress.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-4 md:mb-6 bg-slate-100 p-1 rounded-lg w-fit overflow-x-auto">
          <Button
            variant={selectedTab === 'overview' ? 'default' : 'ghost'}
            onClick={() => setSelectedTab('overview')}
            className="px-3 md:px-4 text-sm md:text-base flex-shrink-0"
          >
            Overview
          </Button>
          <Button
            variant={selectedTab === 'achievements' ? 'default' : 'ghost'}
            onClick={() => setSelectedTab('achievements')}
            className="px-3 md:px-4 text-sm md:text-base flex-shrink-0"
          >
            Achievements
          </Button>
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    </div>
                  ) : quizAttempts.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <p>No quiz attempts yet. Start learning to see your progress here!</p>
                    </div>
                  ) : (
                    quizAttempts.slice(0, 5).map((attempt, index) => (
                      <div key={attempt.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">Completed Quiz</div>
                          <div className="text-xs text-slate-600">
                            Score: {attempt.score && attempt.totalQuestions ? Math.round((attempt.score / attempt.totalQuestions) * 100) : 0}% • +{(attempt.score || 0) * 10} XP
                          </div>
                        </div>
                        <div className="text-xs text-slate-500">
                          {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString() : 'Invalid Date'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quiz Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Quiz Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{isNaN(averageScore) ? 0 : Math.round(averageScore)}%</div>
                    <div className="text-sm text-slate-600">Average Score</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="text-xl font-semibold">{totalQuizzesTaken}</div>
                      <div className="text-xs text-slate-600">Quizzes Taken</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="text-xl font-semibold text-green-600">
                        {quizAttempts.filter(a => a.score && a.totalQuestions && (a.score / a.totalQuestions) >= 0.7).length}
                      </div>
                      <div className="text-xs text-slate-600">Passed</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Performance</span>
                      <span className="font-medium">Good</span>
                    </div>
                    <Progress value={isNaN(averageScore) ? 0 : averageScore} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === 'achievements' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p>Loading achievements...</p>
              </div>
            ) : userAchievements.length === 0 ? (
              <div className="col-span-full text-center py-8 text-slate-500">
                <p>No achievements unlocked yet. Keep learning to unlock your first achievement!</p>
              </div>
            ) : (
              userAchievements.map((userAchievement) => (
                <Card 
                  key={userAchievement.id}
                  className="relative overflow-hidden transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="text-3xl">{userAchievement.achievement?.icon || '🏆'}</div>
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Unlocked
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <CardTitle className="text-lg">{userAchievement.achievement?.title || 'Achievement'}</CardTitle>
                      <CardDescription>{userAchievement.achievement?.description || 'Description'}</CardDescription>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600">+{userAchievement.achievement?.xpReward || 0} XP</span>
                        <span className="text-xs text-slate-500">
                          {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}