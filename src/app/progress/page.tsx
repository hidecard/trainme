'use client';

import ProgressDashboard from '@/components/progress/ProgressDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, TrendingUp, BookOpen, Trophy, Target } from 'lucide-react';

export default function ProgressPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <Target className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Please Sign In to View Your Progress</h3>
            <p className="text-slate-500 mb-6">Track your learning journey, view your achievements, and see your progress across all courses.</p>
            <Button onClick={() => window.location.href = '/auth'}>
              Sign In to View Progress
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="bg-white/80 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
      <ProgressDashboard />
    </div>
  );
}
