'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, Clock, Award, Star, BookOpen, Users, Zap, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';

interface UserStats {
  totalXp: number;
  level: number;
  quizzesCompleted: number;
  lessonsCompleted: number;
  streak: number;
  achievements: string[];
}

interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  completedAt: Date;
  xpEarned: number;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch user stats
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserStats;
        setUserStats(userData);
      }

      // Fetch recent quiz attempts
      const attemptsQuery = query(
        collection(db, 'quizAttempts'),
        where('userId', '==', user.uid)
      );
      const attemptsSnapshot = await getDocs(attemptsQuery);
      const attemptsData = attemptsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          completedAt: doc.data().completedAt?.toDate ? doc.data().completedAt.toDate() : new Date(doc.data().completedAt || Date.now())
        } as QuizAttempt))
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
        .slice(0, 10);

      // Calculate quizzes completed from attempts
      const quizzesCompleted = attemptsData.length;

      // Update user stats with calculated quizzes completed
      setUserStats(prevStats => ({
        ...prevStats,
        quizzesCompleted: quizzesCompleted
      } as UserStats));

      setQuizAttempts(attemptsData);

    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getLevelProgress = (xp: number) => {
    const currentLevel = Math.floor(xp / 100) + 1;
    const xpForCurrentLevel = (currentLevel - 1) * 100;
    const xpForNextLevel = currentLevel * 100;
    const progress = ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
    return { currentLevel, progress, xpForNextLevel };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="border-b bg-white sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-xl">TrainMe</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={() => window.location.href = '/learning-paths'}>
                  Learning Paths
                </Button>
                <Button variant="ghost" onClick={() => window.location.href = '/progress'}>
                  Progress
                </Button>
                <Button variant="ghost" onClick={() => window.location.href = '/leaderboard'}>
                  Leaderboard
                </Button>
                <Button variant="ghost" onClick={() => window.location.href = '/auth'}>
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your profile</h1>
            <Button onClick={() => window.location.href = '/auth'}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const levelInfo = user && userStats ? getLevelProgress(userStats.totalXp) : { currentLevel: 1, progress: 0, xpForNextLevel: 100 };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => window.location.href = '/'}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">TrainMe</span>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.photoURL || ''} />
              <AvatarFallback className="text-2xl">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {user.displayName || user.email?.split('@')[0] || 'User'}
              </h1>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="secondary" className="px-3 py-1">
                  Level {levelInfo.currentLevel}
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  {userStats?.totalXp || 0} XP
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  {userStats?.streak || 0} day streak
                </Badge>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Level {levelInfo.currentLevel}</span>
              <span>{levelInfo.xpForNextLevel} XP to next level</span>
            </div>
            <Progress value={levelInfo.progress} className="h-3" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total XP</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.totalXp || 0}</div>
              <p className="text-xs text-muted-foreground">
                Experience points earned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quizzes Completed</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.quizzesCompleted || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total quizzes finished
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
              <BookOpen className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.lessonsCompleted || 0}</div>
              <p className="text-xs text-muted-foreground">
                Interactive lessons done
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Zap className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.streak || 0}</div>
              <p className="text-xs text-muted-foreground">
                Days in a row
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for detailed information */}
        <Tabs defaultValue="recent-activity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="recent-activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Quiz Attempts</CardTitle>
                <CardDescription>
                  Your latest quiz performance and progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading activity...</p>
                    </div>
                  ) : quizAttempts.length > 0 ? (
                    <div className="space-y-4">
                      {quizAttempts.map((attempt) => (
                        <div key={attempt.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              attempt.score >= 80 ? 'bg-green-100 text-green-800' :
                              attempt.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              <Trophy className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-medium">{attempt.quizTitle || 'Quiz'}</h4>
                              <p className="text-sm text-gray-600">
                                {attempt.completedAt.toLocaleDateString()} • {attempt.xpEarned || 0} XP earned
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{attempt.score}%</div>
                            <Badge variant={attempt.score >= 70 ? 'default' : 'secondary'}>
                              {attempt.score >= 70 ? 'Passed' : 'Try Again'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No quiz attempts yet</p>
                      <p className="text-sm">Complete your first quiz to see your activity here!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>
                  Unlock achievements as you progress in your learning journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: 'First Steps', description: 'Complete your first lesson', icon: BookOpen, unlocked: (userStats?.lessonsCompleted || 0) > 0 },
                    { title: 'Quiz Master', description: 'Complete 5 quizzes', icon: Target, unlocked: (userStats?.quizzesCompleted || 0) >= 5 },
                    { title: 'Streak Keeper', description: 'Maintain a 7-day streak', icon: Zap, unlocked: (userStats?.streak || 0) >= 7 },
                    { title: 'XP Collector', description: 'Earn 500 XP', icon: Star, unlocked: (userStats?.totalXp || 0) >= 500 },
                    { title: 'Level Up', description: 'Reach level 5', icon: Trophy, unlocked: levelInfo.currentLevel >= 5 },
                    { title: 'Perfect Score', description: 'Get 100% on a quiz', icon: Award, unlocked: quizAttempts.some(a => a.score === 100) }
                  ].map((achievement, index) => (
                    <div key={index} className={`p-4 border rounded-lg ${achievement.unlocked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          achievement.unlocked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <achievement.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">{achievement.title}</h4>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive updates about your progress</p>
                  </div>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Learning Reminders</h4>
                    <p className="text-sm text-gray-600">Daily reminders to continue learning</p>
                  </div>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Data Export</h4>
                    <p className="text-sm text-gray-600">Download your learning data</p>
                  </div>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
