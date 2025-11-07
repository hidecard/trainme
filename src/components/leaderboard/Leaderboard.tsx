'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star, 
  TrendingUp,
  Users,
  Target,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface LeaderboardUser {
  id: string;
  name: string;
  avatar?: string;
  totalXp: number;
  level: number;
  streak: number;
  completedLessons: number;
  quizScore: number;
  rank: number;
  previousRank?: number;
  badges: string[];
  country?: string;
}

const sampleLeaderboardData: LeaderboardUser[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: '👩‍💻',
    totalXp: 3450,
    level: 24,
    streak: 45,
    completedLessons: 58,
    quizScore: 94,
    rank: 1,
    previousRank: 2,
    badges: ['🏆', '⭐', '🔥', '💎'],
    country: '🇺🇸'
  },
  {
    id: '2',
    name: 'Alex Rodriguez',
    avatar: '👨‍💻',
    totalXp: 3280,
    level: 22,
    streak: 30,
    completedLessons: 55,
    quizScore: 91,
    rank: 2,
    previousRank: 1,
    badges: ['🏆', '⭐', '🔥'],
    country: '🇲🇽'
  },
  {
    id: '3',
    name: 'Emma Johnson',
    avatar: '👩‍🎓',
    totalXp: 3150,
    level: 21,
    streak: 28,
    completedLessons: 52,
    quizScore: 89,
    rank: 3,
    previousRank: 4,
    badges: ['🏆', '⭐', '🎯'],
    country: '🇬🇧'
  },
  {
    id: '4',
    name: 'Michael Kim',
    avatar: '👨‍🎓',
    totalXp: 2980,
    level: 20,
    streak: 21,
    completedLessons: 48,
    quizScore: 87,
    rank: 4,
    previousRank: 6,
    badges: ['🏆', '⭐'],
    country: '🇰🇷'
  },
  {
    id: '5',
    name: 'Lisa Wang',
    avatar: '👩‍💼',
    totalXp: 2850,
    level: 19,
    streak: 18,
    completedLessons: 45,
    quizScore: 85,
    rank: 5,
    previousRank: 3,
    badges: ['🏆', '🎯'],
    country: '🇨🇦'
  },
  {
    id: '6',
    name: 'David Brown',
    avatar: '👨‍💼',
    totalXp: 2720,
    level: 18,
    streak: 15,
    completedLessons: 42,
    quizScore: 83,
    rank: 6,
    previousRank: 8,
    badges: ['⭐', '🎯'],
    country: '🇦🇺'
  },
  {
    id: '7',
    name: 'Sophie Martin',
    avatar: '👩‍🎨',
    totalXp: 2600,
    level: 17,
    streak: 14,
    completedLessons: 40,
    quizScore: 82,
    rank: 7,
    previousRank: 5,
    badges: ['⭐'],
    country: '🇫🇷'
  },
  {
    id: '8',
    name: 'James Wilson',
    avatar: '👨‍🔬',
    totalXp: 2480,
    level: 16,
    streak: 12,
    completedLessons: 38,
    quizScore: 80,
    rank: 8,
    previousRank: 9,
    badges: ['⭐'],
    country: '🇺🇸'
  }
];

const weeklyLeaderboardData: LeaderboardUser[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: '👩‍💻',
    totalXp: 450,
    level: 24,
    streak: 7,
    completedLessons: 8,
    quizScore: 96,
    rank: 1,
    previousRank: 3,
    badges: ['🏆', '⭐'],
    country: '🇺🇸'
  },
  {
    id: '2',
    name: 'Michael Kim',
    avatar: '👨‍🎓',
    totalXp: 420,
    level: 20,
    streak: 7,
    completedLessons: 7,
    quizScore: 92,
    rank: 2,
    previousRank: 5,
    badges: ['🏆', '⭐'],
    country: '🇰🇷'
  },
  {
    id: '3',
    name: 'Emma Johnson',
    avatar: '👩‍🎓',
    totalXp: 380,
    level: 21,
    streak: 7,
    completedLessons: 6,
    quizScore: 88,
    rank: 3,
    previousRank: 1,
    badges: ['⭐'],
    country: '🇬🇧'
  }
];

export default function Leaderboard() {
  const [timeframe, setTimeframe] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>(sampleLeaderboardData);
  const [userRank, setUserRank] = useState<LeaderboardUser | null>(null);

  useEffect(() => {
    // Simulate current user data
    const currentUser: LeaderboardUser = {
      id: 'current-user',
      name: 'You',
      avatar: '🎯',
      totalXp: 1250,
      level: 8,
      streak: 5,
      completedLessons: 23,
      quizScore: 78,
      rank: 42,
      previousRank: 48,
      badges: ['⭐'],
      country: '🇺🇸'
    };
    setUserRank(currentUser);
  }, []);

  useEffect(() => {
    // Update data based on timeframe
    if (timeframe === 'weekly') {
      setLeaderboardData(weeklyLeaderboardData);
    } else {
      setLeaderboardData(sampleLeaderboardData);
    }
  }, [timeframe]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Global Leaderboard</h1>
          <p className="text-xl text-slate-600">Compete with learners worldwide</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">15,234</div>
              <div className="text-sm text-slate-600">Active Learners</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">2,456</div>
              <div className="text-sm text-slate-600">Quizzes Today</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">89,234</div>
              <div className="text-sm text-slate-600">XP Earned Today</div>
            </CardContent>
          </Card>
        </div>

        {/* Timeframe Tabs */}
        <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="all">All Time</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Main Leaderboard */}
        <Card className="mb-8">
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
            <div className="space-y-4">
              {leaderboardData.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-200 hover:shadow-md ${
                    user.id === 'current-user' 
                      ? 'bg-blue-50 border-2 border-blue-200' 
                      : 'bg-white border border-slate-200'
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center space-x-2 w-16">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRankBadge(user.rank)}`}>
                      {getRankIcon(user.rank)}
                    </div>
                    <div className="flex flex-col items-center">
                      {getRankChange(user.rank, user.previousRank)}
                      <span className="text-xs text-slate-500">
                        {user.previousRank && user.previousRank !== user.rank && 
                          Math.abs(user.previousRank - user.rank)
                        }
                      </span>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="text-2xl">{user.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">
                          {user.name}
                          {user.id === 'current-user' && (
                            <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                          )}
                        </span>
                        <span>{user.country}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <span>Level {user.level}</span>
                        <span>🔥 {user.streak} day streak</span>
                        <span>📚 {user.completedLessons} lessons</span>
                        <span>🎯 {user.quizScore}% avg score</span>
                      </div>
                    </div>
                  </div>

                  {/* XP and Badges */}
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-600">
                      {user.totalXp.toLocaleString()} XP
                    </div>
                    <div className="flex space-x-1 mt-1">
                      {user.badges.map((badge, index) => (
                        <span key={index} className="text-sm">{badge}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User's Rank */}
        {userRank && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">Your Ranking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 p-4 bg-white rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-700">#{userRank.rank}</span>
                  </div>
                  {getRankChange(userRank.rank, userRank.previousRank)}
                </div>
                
                <div className="flex items-center space-x-3 flex-1">
                  <div className="text-2xl">{userRank.avatar}</div>
                  <div className="flex-1">
                    <div className="font-semibold">{userRank.name}</div>
                    <div className="text-sm text-slate-600">
                      Level {userRank.level} • 🔥 {userRank.streak} days • 📚 {userRank.completedLessons} lessons
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold text-blue-600">
                    {userRank.totalXp.toLocaleString()} XP
                  </div>
                  <div className="text-sm text-slate-600">
                    Top {Math.round((userRank.rank / 15234) * 100)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}