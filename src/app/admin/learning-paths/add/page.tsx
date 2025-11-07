'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
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

export default function AddLearningPathPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '',
    color: '',
    estimatedTime: 15,
    difficulty: 'BEGINNER' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
    isActive: true
  });

  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [selectedQuizzes, setSelectedQuizzes] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesSnapshot, lessonsSnapshot, quizzesSnapshot] = await Promise.all([
        getDocs(collection(db, 'categories')),
        getDocs(collection(db, 'lessons')),
        getDocs(collection(db, 'quizzes'))
      ]);

      const categoriesData = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      const lessonsData = lessonsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lesson));
      const quizzesData = quizzesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));

      setCategories(categoriesData);
      setLessons(lessonsData.filter(lesson => lesson.isPublished));
      setQuizzes(quizzesData.filter(quiz => quiz.isPublished));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (selectedLessons.length === 0 && selectedQuizzes.length === 0) {
      alert('Please select at least one lesson or quiz for the learning path');
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, 'learningPaths'), {
        ...formData,
        lessons: selectedLessons,
        quizzes: selectedQuizzes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      router.push('/admin');
    } catch (error) {
      console.error('Error creating learning path:', error);
      alert('Failed to create learning path. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleLesson = (lessonId: string) => {
    setSelectedLessons(prev =>
      prev.includes(lessonId)
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const toggleQuiz = (quizId: string) => {
    setSelectedQuizzes(prev =>
      prev.includes(quizId)
        ? prev.filter(id => id !== quizId)
        : [...prev, quizId]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="outline" onClick={() => router.push('/admin')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Learning Path</h1>
          <p className="text-slate-600">Build a structured learning journey for your users</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Define the core details of your learning path</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., HTML Fundamentals"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="icon">Icon</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="e.g., 📚"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what users will learn in this path"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => setFormData({ ...formData, difficulty: value as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Beginner</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color Class</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="e.g., bg-blue-100 text-blue-800"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
                />
                <Label htmlFor="isActive">Active (visible to users)</Label>
              </div>
            </CardContent>
          </Card>

          {/* Lessons Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Lessons</CardTitle>
              <CardDescription>Select lessons to include in this learning path</CardDescription>
            </CardHeader>
            <CardContent>
              {lessons.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No published lessons available</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <Checkbox
                        id={`lesson-${lesson.id}`}
                        checked={selectedLessons.includes(lesson.id)}
                        onCheckedChange={() => toggleLesson(lesson.id)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={`lesson-${lesson.id}`} className="font-medium cursor-pointer">
                          {lesson.title}
                        </Label>
                        {lesson.description && (
                          <p className="text-sm text-slate-600 mt-1">{lesson.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            Order: {lesson.order}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {categories.find(c => c.id === lesson.categoryId)?.name || 'Unknown'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quizzes Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Quizzes</CardTitle>
              <CardDescription>Select quizzes to include in this learning path</CardDescription>
            </CardHeader>
            <CardContent>
              {quizzes.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No published quizzes available</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quizzes.map((quiz) => (
                    <div key={quiz.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <Checkbox
                        id={`quiz-${quiz.id}`}
                        checked={selectedQuizzes.includes(quiz.id)}
                        onCheckedChange={() => toggleQuiz(quiz.id)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={`quiz-${quiz.id}`} className="font-medium cursor-pointer">
                          {quiz.title}
                        </Label>
                        {quiz.description && (
                          <p className="text-sm text-slate-600 mt-1">{quiz.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={`text-xs ${getDifficultyColor(quiz.difficulty)}`}>
                            {quiz.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {quiz.timeLimit} min
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {categories.find(c => c.id === quiz.categoryId)?.name || 'Unknown'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Path Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{selectedLessons.length}</div>
                  <div className="text-sm text-slate-600">Lessons</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{selectedQuizzes.length}</div>
                  <div className="text-sm text-slate-600">Quizzes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{selectedLessons.length + selectedQuizzes.length}</div>
                  <div className="text-sm text-slate-600">Total Items</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">~{formData.estimatedTime} min</div>
                  <div className="text-sm text-slate-600">Estimated Time</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.push('/admin')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Learning Path
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
