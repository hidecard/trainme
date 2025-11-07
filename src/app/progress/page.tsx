'use client';

import ProgressDashboard from '@/components/progress/ProgressDashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ProgressPage() {
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