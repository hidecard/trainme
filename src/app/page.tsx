'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Trophy, Users, Zap, Star, Target, Clock, Award, LogOut, RefreshCw, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where
} from 'firebase/firestore';

export default function Home() {
  const { user, logout } = useAuth();
  const [activeFeature, setActiveFeature] = useState(0);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuizzes: 0,
    totalLessons: 0
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const features = [
    {
      icon: BookOpen,
      title: 'Interactive Lessons',
      description: 'Learn HTML, CSS, JavaScript, and more through engaging, bite-sized lessons.',
      color: 'text-blue-600'
    },
    {
      icon: Trophy,
      title: 'Gamified Learning',
      description: 'Earn XP, level up, and unlock achievements as you progress.',
      color: 'text-green-600'
    },
    {
      icon: Users,
      title: 'Global Leaderboard',
      description: 'Compete with learners worldwide and climb the rankings.',
      color: 'text-purple-600'
    },
    {
      icon: Zap,
      title: 'Real-time Feedback',
      description: 'Get instant feedback on your answers and track your improvement.',
      color: 'text-orange-600'
    }
  ];

  // Categories will be loaded from Firebase

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  useEffect(() => {
    fetchHomePageData();
  }, [refreshKey]);

  const fetchHomePageData = async () => {
    setLoading(true);
    try {
      // Fetch real stats from Firebase
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const quizzesSnapshot = await getDocs(collection(db, 'quizzes'));
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));

      // Calculate quiz attempts
      const attemptsSnapshot = await getDocs(collection(db, 'quizAttempts'));
      const totalQuizAttempts = attemptsSnapshot.size;

      setStats({
        totalUsers: usersSnapshot.size,
        totalQuizzes: quizzesSnapshot.size,
        totalLessons: totalQuizAttempts // Using attempts as lessons for now
      });

      // Set categories from Firebase
      const categoriesData = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesData);

      // Fetch top 5 users for leaderboard preview
      const usersQuery = query(collection(db, 'users'), orderBy('totalXp', 'desc'), limit(5));
      const leaderboardSnapshot = await getDocs(usersQuery);
      const leaderboardData = leaderboardSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeaderboard(leaderboardData);

    } catch (error) {
      console.error('Error fetching home page data:', error);
      // Fallback to default stats
      setStats({
        totalUsers: 0,
        totalQuizzes: 0,
        totalLessons: 0
      });
      setCategories([]);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
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
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Button variant="ghost" onClick={() => window.location.href = '/learning-paths'}>
                    Learning Paths
                  </Button>
                  <Button variant="ghost" onClick={() => window.location.href = '/progress'}>
                    Progress
                  </Button>
                  <Button variant="ghost" onClick={() => window.location.href = '/leaderboard'}>
                    Leaderboard
                  </Button>
                  <Button variant="ghost" onClick={() => window.location.href = '/quiz-demo'}>
                    Try Quiz
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
                  <Button variant="ghost" onClick={() => window.location.href = '/learning-paths'}>
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
                  <Button variant="ghost" onClick={() => window.location.href = '/quiz-demo'}>
                    Try Quiz
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                🚀 Master Web Development Through Interactive Learning
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Learn, Practice, and
                <br />
                <span className="text-slate-900">Level Up Your Skills</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Transform your web development journey with interactive lessons, 
                challenging quizzes, and a gamified learning experience that keeps you motivated.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => window.location.href = '/quiz-demo'} className="px-8 py-3 text-lg">
                Try Quiz Demo
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.href = '/progress'} className="px-8 py-3 text-lg">
                View Progress
              </Button>
              <Button size="lg" variant="outline" onClick={() => setRefreshKey(prev => prev + 1)} className="px-8 py-3 text-lg">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </div>

            {/* Welcome message for logged in users */}
            {user && (
              <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-green-600 mb-2">
                  Welcome back, {user.displayName || user.email?.split('@')[0]}! 👋
                </h2>
                <p className="text-slate-600">
                  Ready to continue your learning journey? You're at level {user.level} with {user.totalXp} XP.
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {loading ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : stats.totalUsers.toLocaleString()}
                </div>
                <div className="text-slate-600">Active Learners</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {loading ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : stats.totalQuizzes}
                </div>
                <div className="text-slate-600">Interactive Quizzes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {loading ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : stats.totalLessons}
                </div>
                <div className="text-slate-600">Quiz Attempts</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose TrainMe?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to master web development in one platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className={`relative transition-all duration-300 hover:shadow-lg cursor-pointer ${
                    activeFeature === index ? 'ring-2 ring-blue-500 shadow-lg' : ''
                  }`}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center ${feature.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Learning Paths Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Learning Paths
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Choose your path and start your journey to becoming a web development expert
            </p>
          </div>

          <div className="text-center mb-8">
            <Button size="lg" onClick={() => window.location.href = '/learning-paths'} className="px-8 py-3 text-lg">
              Explore All Learning Paths
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : categories.length > 0 ? (
              categories.slice(0, 4).map((category, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/learning-paths'}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl">{category.icon || '📚'}</div>
                      <Badge className={category.color || 'bg-blue-100 text-blue-800'}>
                        {category.name || 'Category'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Progress</span>
                        <span className="font-medium">0%</span>
                      </div>
                      <Progress value={0} className="h-2" />
                      <div className="flex justify-between text-sm text-slate-600">
                        <span>{category.description || 'Learn the fundamentals'}</span>
                        <span>~15 min</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-slate-500">
                <p>No learning paths available yet.</p>
                <p className="text-sm mt-2">Check back soon for new content!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Top Learners
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              See how our community is excelling in their learning journey
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              </div>
            ) : leaderboard.length > 0 ? (
              <div className="space-y-4">
                {leaderboard.slice(0, 5).map((user, index) => (
                  <Card key={user.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{user.displayName || user.email?.split('@')[0] || 'Anonymous'}</div>
                          <div className="text-sm text-slate-600">Level {user.level || 1} • {user.streak || 0} day streak</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{user.totalXp || 0} XP</div>
                        <div className="text-sm text-slate-600">Total Experience</div>
                      </div>
                    </div>
                  </Card>
                ))}
                <div className="text-center mt-6">
                  <Button variant="outline" onClick={() => window.location.href = '/leaderboard'}>
                    View Full Leaderboard
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>No leaderboard data available yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Start learning in minutes with our simple 3-step process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold">Choose Your Path</h3>
              <p className="text-slate-600">
                Select from HTML, CSS, JavaScript, or React learning paths tailored to your goals.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">Learn & Practice</h3>
              <p className="text-slate-600">
                Go through interactive lessons and test your knowledge with engaging quizzes.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold">Earn & Grow</h3>
              <p className="text-slate-600">
                Collect XP, unlock achievements, and climb the leaderboard as you master new skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {user ? 'Continue Your Learning Journey!' : 'Ready to Start Your Learning Journey?'}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {user 
              ? 'Pick up where you left off and keep building your skills.' 
              : 'Join thousands of learners mastering web development the interactive way.'
            }
          </p>
          <Button size="lg" variant="secondary" className="px-8 py-3 text-lg" onClick={() => window.location.href = user ? '/progress' : '/auth'}>
            {user ? 'View Progress' : 'Get Started Free'}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">TrainMe</span>
              </div>
              <p className="text-slate-400">
                Master web development through interactive learning and gamification.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Learning</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">HTML</a></li>
                <li><a href="#" className="hover:text-white transition-colors">CSS</a></li>
                <li><a href="#" className="hover:text-white transition-colors">JavaScript</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>© 2024 TrainMe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}