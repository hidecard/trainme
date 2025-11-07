'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus,
  Edit,
  Trash2,
  Users,
  BookOpen,
  HelpCircle,
  BarChart3,
  Loader2,
  Trophy,
  Crown,
  Medal,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface User {
  uid: string;
  email: string;
  displayName?: string;
  totalXp: number;
  level: number;
  streak: number;
  createdAt: string;
  lastActive: string;
  isAdmin?: boolean;
  // Extended properties for leaderboard
  id?: string;
  totalQuizzesTaken?: number;
  averageScore?: number;
  totalStudyTime?: number;
  rank?: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  timeLimit?: number;
  isPublished: boolean;
  createdAt: string;
  questions?: any[];
}

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
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

export default function Leaderboard() {
  const { user, logout } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [timeframe, setTimeframe] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchLeaderboardData();
  }, [timeframe, refreshKey]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch users with their quiz attempts
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as User));
      
      // Fetch quiz attempts for each user
      const attemptsSnapshot = await getDocs(collection(db, 'quizAttempts'));
      const attemptsData = attemptsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as QuizAttempt)).filter(attempt => attempt.userId); // Filter out invalid attempts

      // Fetch categories
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = categoriesSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Category));

      setCategories(categoriesData);

      // Calculate user stats
      const userStats = usersData.map(user => {
        const userAttempts = attemptsData.filter(attempt => attempt.userId === user.uid);
        const totalQuizzesTaken = userAttempts.length;
        const averageScore = totalQuizzesTaken > 0
          ? userAttempts.reduce((sum, attempt) => sum + (attempt.score / attempt.totalQuestions) * 100, 0) / totalQuizzesTaken
          : 0;
        const totalStudyTime = userAttempts.reduce((sum, attempt) => sum + (attempt.timeSpent || 0), 0);

        return {
          ...user,
          totalQuizzesTaken,
          averageScore: Math.round(averageScore),
          totalStudyTime,
          previousRank: user.uid // This would be calculated from historical data
        };
      });

      // Sort users by total XP (for ranking)
      const sortedUsers = userStats.sort((a, b) => b.totalXp - a.totalXp);
      
      // Assign ranks
      const rankedUsers = sortedUsers.map((userStat, index) => ({
        ...userStat,
        rank: index + 1,
        id: userStat.uid
      }));

      setLeaderboardData(rankedUsers);

    } catch (err) {
      console.error('Error fetching leaderboard data:', err);
      setError('Failed to fetch leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Trophy className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-sm font-medium text-slate-600">#{rank}</span>;
    }
  };

  const getRankChange = (current: number, previous?: number) => {
    if (!previous) return <Minus className="w-4 h-4 text-slate-400" />;
    if (current < previous) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (current > previous) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
    return 'bg-slate-100 text-slate-700';
  };

  const getLevelColor = (level: number) => {
    if (level >= 20) return 'text-purple-600';
    if (level >= 15) return 'text-blue-600';
    if (level >= 10) return 'text-green-600';
    if (level >= 5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
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
                  <Button variant="ghost" onClick={() => window.location.href = '/learning-paths'}>
                    Learning Paths
                  </Button>
                  <Button variant="ghost" onClick={() => window.location.href = '/progress'}>
                    Progress
                  </Button>
                  <Button variant="ghost" onClick={() => window.location.href = '/profile'}>
                    Profile
                  </Button>
                    <Button variant="ghost" className="bg-blue-50" onClick={() => window.location.href = '/leaderboard'}>
                      Leaderboard
                    </Button>
                  {user.isAdmin && (
                    <Button variant="ghost" onClick={() => window.location.href = '/admin'}>
                      Admin
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => logout()}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => window.location.href = '/learning-paths'}>
                    Learning Paths
                  </Button>
                  <Button variant="ghost" onClick={() => window.location.href = '/auth'}>
                    Sign In
                  </Button>
                  <Button variant="ghost" onClick={() => window.location.href = '/progress'}>
                    Progress
                  </Button>
                  <Button variant="ghost" onClick={() => window.location.href = '/leaderboard'} className="bg-blue-50">
                    Leaderboard
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
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { window.location.href = '/learning-paths'; setMobileMenuOpen(false); }}>
                      Learning Paths
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { window.location.href = '/progress'; setMobileMenuOpen(false); }}>
                      Progress
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { window.location.href = '/profile'; setMobileMenuOpen(false); }}>
                      Profile
                    </Button>
                    <Button variant="ghost" className="w-full justify-start bg-blue-50" onClick={() => { window.location.href = '/leaderboard'; setMobileMenuOpen(false); }}>
                      Leaderboard
                    </Button>
                    {user.isAdmin && (
                      <Button variant="ghost" className="w-full justify-start" onClick={() => { window.location.href = '/admin'; setMobileMenuOpen(false); }}>
                        Admin
                      </Button>
                    )}
                    <Button variant="outline" className="w-full justify-start" onClick={() => logout()}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { window.location.href = '/learning-paths'; setMobileMenuOpen(false); }}>
                      Learning Paths
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { window.location.href = '/auth'; setMobileMenuOpen(false); }}>
                      Sign In
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { window.location.href = '/progress'; setMobileMenuOpen(false); }}>
                      Progress
                    </Button>
                    <Button variant="ghost" className="w-full justify-start bg-blue-50" onClick={() => { window.location.href = '/leaderboard'; setMobileMenuOpen(false); }}>
                      Leaderboard
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Global Leaderboard</h1>
              <p className="text-slate-600 text-sm md:text-base">Compete with learners worldwide</p>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4 w-full sm:w-auto">
              <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
                <SelectTrigger className="w-32 md:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setRefreshKey(prev => prev + 1)} variant="outline" size="sm" className="flex-shrink-0">
                <RefreshCw className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="text-center">
            <CardContent className="pt-4 md:pt-6">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-bold">{leaderboardData.length}</div>
              <div className="text-xs md:text-sm text-slate-600">Active Learners</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-4 md:pt-6">
              <HelpCircle className="w-6 h-6 md:w-8 md:h-8 text-green-600 mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-bold">
                {leaderboardData.reduce((sum, user) => sum + (user.totalQuizzesTaken || 0), 0)}
              </div>
              <div className="text-xs md:text-sm text-slate-600">Quizzes Today</div>
            </CardContent>
          </Card>
          <Card className="text-center sm:col-span-2 lg:col-span-1">
            <CardContent className="pt-4 md:pt-6">
              <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-bold">
                {leaderboardData.reduce((sum, user) => sum + (user.totalStudyTime || 0), 0)}
              </div>
              <div className="text-xs md:text-sm text-slate-600">Study Time (min)</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Leaderboard */}
        {user ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span>Top Performers</span>
              </CardTitle>
              <CardDescription>
                {timeframe === 'all' && 'All-time highest XP earners'}
                {timeframe === 'monthly' && 'This month\'s top performers'}
                {timeframe === 'weekly' && 'This week\'s champions'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead className="min-w-32">Name</TableHead>
                        <TableHead className="w-20">Level</TableHead>
                        <TableHead className="w-20">XP</TableHead>
                        <TableHead className="w-16">Streak</TableHead>
                        <TableHead className="w-16">Quizzes</TableHead>
                        <TableHead className="w-16">Score</TableHead>
                        <TableHead className="w-20">Study Time</TableHead>
                        <TableHead className="w-16">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboardData.map((user) => {
                        const isCurrentUser = user.uid === user.id;
                        return (
                          <TableRow
                            key={user.id}
                            className={isCurrentUser ? 'bg-blue-50 border-2 border-blue-200' : ''}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-2">
                                {getRankIcon(user.rank!)}
                                <span className="ml-2 text-sm md:text-base">{user.rank}</span>
                                {isCurrentUser && (
                                  <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className={isCurrentUser ? 'font-medium' : ''}>
                              <div className="flex flex-col">
                                <span className="text-sm md:text-base">{user.displayName || 'N/A'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-xs ${getLevelColor(user.level)}`}>
                                {user.level}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-sm md:text-base">{user.totalXp.toLocaleString()}</TableCell>
                            <TableCell className="text-sm md:text-base">{user.streak}</TableCell>
                            <TableCell className="text-sm md:text-base">{user.totalQuizzesTaken || 0}</TableCell>
                            <TableCell className="text-sm md:text-base">{user.averageScore || 0}%</TableCell>
                            <TableCell className="text-sm md:text-base">{formatTime(user.totalStudyTime || 0)}</TableCell>
                            <TableCell>
                              <Badge variant={user.isAdmin ? 'default' : 'secondary'} className="text-xs">
                                {user.isAdmin ? 'Admin' : 'User'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Sign In to View Leaderboard</h3>
              <p className="text-slate-500 mb-6">Join the competition and see how you rank against other learners!</p>
              <Button onClick={() => window.location.href = '/auth'}>
                Sign In to Compete
              </Button>
            </CardContent>
          </Card>
        )}

        {/* User's Rank */}
        {user && leaderboardData.find(u => u.uid === user.uid) && (() => {
          const currentUserData = leaderboardData.find(u => u.uid === user.uid)!;
          return (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800">Your Ranking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankBadge(currentUserData.rank!)}`}>
                      {getRankIcon(currentUserData.rank!)}
                      <span className="text-lg font-bold text-white">#{currentUserData.rank}</span>
                    </div>
                    <div className="flex-1">
                      <div>
                        <div className="text-2xl font-bold text-blue-800">{user.displayName || 'Anonymous'}</div>
                        <div className="text-sm text-blue-600">Level {user.level} • {user.totalXp.toLocaleString()} XP</div>
                      </div>
                      <div className="text-sm text-blue-600">
                        {user.streak} day streak • {currentUserData.totalQuizzesTaken || 0} quizzes taken
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-blue-600">
                      Top {Math.round((currentUserData.rank! / leaderboardData.length) * 100)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}
        </div>
      </div>
    </div>
  );
}
