'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
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
  Save,
  X,
  RefreshCw
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
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';

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
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  description?: string;
  categoryId: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
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

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Category form state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: '',
    color: ''
  });

  // Form states
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);

  // Lesson form state
  const [lessonForm, setLessonForm] = useState({
    title: '',
    content: '',
    description: '',
    categoryId: '',
    order: 0,
    isPublished: false
  });

  // Quiz form state
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    difficulty: 'BEGINNER' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
    timeLimit: 10,
    isPublished: false
  });

  // Check if user is admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      window.location.href = '/';
    }
  }, [user]);

  // Fetch data from Firebase
  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as User));
      setUsers(usersData);

      // Fetch lessons
      const lessonsSnapshot = await getDocs(
        query(collection(db, 'lessons'), orderBy('order', 'asc'))
      );
      const lessonsData = lessonsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Lesson));
      setLessons(lessonsData);

      // Fetch quizzes
      const quizzesSnapshot = await getDocs(collection(db, 'quizzes'));
      const quizzesData = quizzesSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Quiz));
      setQuizzes(quizzesData);

      // Fetch categories
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Category));
      setCategories(categoriesData);

      // Fetch learning paths
      const pathsSnapshot = await getDocs(collection(db, 'learningPaths'));
      const pathsData = pathsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LearningPath));
      setLearningPaths(pathsData);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data from Firebase');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Set up real-time listener for data changes
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ 
        uid: doc.id, 
        ...doc.data() 
      } as User));
      setUsers(usersData);
    });

    const unsubscribeLessons = onSnapshot(
      query(collection(db, 'lessons'), orderBy('order', 'asc')),
      (snapshot) => {
        const lessonsData = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as Lesson));
        setLessons(lessonsData);
      }
    );

    const unsubscribeQuizzes = onSnapshot(collection(db, 'quizzes'), (snapshot) => {
      const quizzesData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Quiz));
      setQuizzes(quizzesData);
    });

    const unsubscribeCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const categoriesData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Category));
      setCategories(categoriesData);
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeUsers();
      unsubscribeLessons();
      unsubscribeQuizzes();
      unsubscribeCategories();
    };
  }, [refreshKey]);

  // Category management
  const saveCategory = async () => {
    try {
      if (editingCategory) {
        await updateDoc(doc(db, 'categories', editingCategory.id), {
          ...categoryForm,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'categories'), {
          ...categoryForm,
          createdAt: serverTimestamp()
        });
      }

      setCategoryForm({
        name: '',
        description: '',
        icon: '',
        color: ''
      });
      setEditingCategory(null);
      setShowCategoryForm(false);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Error saving category:', err);
      setError('Failed to save category');
    }
  };

  const deleteCategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteDoc(doc(db, 'categories', id));
        setRefreshKey(prev => prev + 1);
      } catch (err) {
        console.error('Error deleting category:', err);
        setError('Failed to delete category');
      }
    }
  };

  // Lesson management
  const saveLesson = async () => {
    try {
      if (editingLesson) {
        await updateDoc(doc(db, 'lessons', editingLesson.id), {
          ...lessonForm,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'lessons'), {
          ...lessonForm,
          createdAt: serverTimestamp()
        });
      }
      
      setLessonForm({
        title: '',
        content: '',
        description: '',
        categoryId: '',
        order: 0,
        isPublished: false
      });
      setEditingLesson(null);
      setShowLessonForm(false);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Error saving lesson:', err);
      setError('Failed to save lesson');
    }
  };

  const deleteLesson = async (id: string) => {
    if (confirm('Are you sure you want to delete this lesson?')) {
      try {
        await deleteDoc(doc(db, 'lessons', id));
        setRefreshKey(prev => prev + 1);
      } catch (err) {
        console.error('Error deleting lesson:', err);
        setError('Failed to delete lesson');
      }
    }
  };

  // Quiz management
  const saveQuiz = async () => {
    try {
      if (editingQuiz) {
        await updateDoc(doc(db, 'quizzes', editingQuiz.id), {
          ...quizForm,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'quizzes'), {
          ...quizForm,
          createdAt: serverTimestamp()
        });
      }
      
      setQuizForm({
        title: '',
        description: '',
        categoryId: '',
        difficulty: 'BEGINNER' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
        timeLimit: 10,
        isPublished: false
      });
      setEditingQuiz(null);
      setShowQuizForm(false);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Error saving quiz:', err);
      setError('Failed to save quiz');
    }
  };

  const deleteQuiz = async (id: string) => {
    if (confirm('Are you sure you want to delete this quiz?')) {
      try {
        await deleteDoc(doc(db, 'quizzes', id));
        setRefreshKey(prev => prev + 1);
      } catch (err) {
        console.error('Error deleting quiz:', err);
        setError('Failed to delete quiz');
      }
    }
  };

  // Learning Path management
  const deleteLearningPath = async (id: string) => {
    if (confirm('Are you sure you want to delete this learning path?')) {
      try {
        await deleteDoc(doc(db, 'learningPaths', id));
        setRefreshKey(prev => prev + 1);
      } catch (err) {
        console.error('Error deleting learning path:', err);
        setError('Failed to delete learning path');
      }
    }
  };

  // Make user admin
  const makeAdmin = async (userId: string) => {
    if (confirm(`Make user ${userId} an admin?`)) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          isAdmin: true,
          updatedAt: serverTimestamp()
        });
        setRefreshKey(prev => prev + 1);
      } catch (err) {
        console.error('Error making user admin:', err);
        setError('Failed to update user role');
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertDescription>
            You don't have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
            <p className="text-slate-600 text-sm md:text-base">Manage users, lessons, and quizzes</p>
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 gap-1 md:gap-0">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Categories ({categories.length})
            </TabsTrigger>
            <TabsTrigger value="lessons" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Lessons ({lessons.length})
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Quizzes ({quizzes.length})
            </TabsTrigger>
            <TabsTrigger value="paths" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Learning Paths ({learningPaths.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Categories Management</CardTitle>
                    <CardDescription>Create and manage learning categories</CardDescription>
                  </div>
                  <Button onClick={() => setShowCategoryForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showCategoryForm && (
                  <Card className="mb-6 border-2 border-blue-200">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>{editingCategory ? 'Edit Category' : 'Create Category'}</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setShowCategoryForm(false);
                          setEditingCategory(null);
                        }}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="category-name">Name</Label>
                          <Input
                            id="category-name"
                            value={categoryForm.name}
                            onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                            placeholder="Category name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="category-icon">Icon</Label>
                          <Input
                            id="category-icon"
                            value={categoryForm.icon}
                            onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
                            placeholder="Icon emoji (e.g., 📄)"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="category-description">Description</Label>
                        <Input
                          id="category-description"
                          value={categoryForm.description}
                          onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                          placeholder="Category description"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category-color">Color Class</Label>
                        <Input
                          id="category-color"
                          value={categoryForm.color}
                          onChange={(e) => setCategoryForm({...categoryForm, color: e.target.value})}
                          placeholder="Tailwind color class (e.g., bg-blue-100 text-blue-800)"
                        />
                      </div>
                      <div className="flex items-center space-x-4">
                        <Button onClick={saveCategory}>
                          <Save className="h-4 w-4 mr-2" />
                          {editingCategory ? 'Update' : 'Create'} Category
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Icon</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="text-2xl">{category.icon || '📚'}</TableCell>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>{category.description}</TableCell>
                          <TableCell>
                            <Badge className={category.color || 'bg-gray-100 text-gray-800'}>
                              {category.color || 'Default'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingCategory(category);
                                  setCategoryForm({
                                    name: category.name,
                                    description: category.description || '',
                                    icon: category.icon || '',
                                    color: category.color || ''
                                  });
                                  setShowCategoryForm(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteCategory(category.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Users Management</CardTitle>
                <CardDescription>View and manage all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>XP</TableHead>
                        <TableHead>Streak</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.uid}>
                          <TableCell className="font-medium">{user.displayName || 'N/A'}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.level}</TableCell>
                          <TableCell>{user.totalXp}</TableCell>
                          <TableCell>{user.streak} days</TableCell>
                          <TableCell>
                            <Badge variant={user.isAdmin ? 'default' : 'secondary'}>
                              {user.isAdmin ? 'Admin' : 'User'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {!user.isAdmin && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => makeAdmin(user.uid)}
                                >
                                  Make Admin
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lessons Tab */}
          <TabsContent value="lessons">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Lessons Management</CardTitle>
                    <CardDescription>Create and manage learning content</CardDescription>
                  </div>
                  <Button onClick={() => router.push('/admin/lessons/add')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lesson
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showLessonForm && (
                  <Card className="mb-6 border-2 border-blue-200">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>{editingLesson ? 'Edit Lesson' : 'Create Lesson'}</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setShowLessonForm(false);
                          setEditingLesson(null);
                        }}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="lesson-title">Title</Label>
                          <Input
                            id="lesson-title"
                            value={lessonForm.title}
                            onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})}
                            placeholder="Lesson title"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lesson-category">Category</Label>
                          <Select value={lessonForm.categoryId} onValueChange={(value) => setLessonForm({...lessonForm, categoryId: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="lesson-description">Description</Label>
                        <Input
                          id="lesson-description"
                          value={lessonForm.description}
                          onChange={(e) => setLessonForm({...lessonForm, description: e.target.value})}
                          placeholder="Lesson description"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lesson-order">Order</Label>
                        <Input
                          id="lesson-order"
                          type="number"
                          value={lessonForm.order}
                          onChange={(e) => setLessonForm({...lessonForm, order: parseInt(e.target.value)})}
                          placeholder="Lesson order"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lesson-published">Published</Label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="lesson-published"
                            checked={lessonForm.isPublished}
                            onChange={(e) => setLessonForm({...lessonForm, isPublished: e.target.checked})}
                          />
                          <Label htmlFor="lesson-published">Published</Label>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="lesson-content">Content</Label>
                          <Textarea
                            id="lesson-content"
                            value={lessonForm.content}
                            onChange={(e) => setLessonForm({...lessonForm, content: e.target.value})}
                            placeholder="Lesson content (Markdown supported)"
                            rows={6}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Button onClick={saveLesson}>
                          <Save className="h-4 w-4 mr-2" />
                          {editingLesson ? 'Update' : 'Create'} Lesson
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lessons.map((lesson) => (
                        <TableRow key={lesson.id}>
                          <TableCell className="font-medium">{lesson.title}</TableCell>
                          <TableCell>{categories.find(c => c.id === lesson.categoryId)?.name || 'N/A'}</TableCell>
                          <TableCell>{lesson.order}</TableCell>
                          <TableCell>
                            <Badge variant={lesson.isPublished ? 'default' : 'secondary'}>
                              {lesson.isPublished ? 'Published' : 'Draft'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setEditingLesson(lesson);
                                  setLessonForm({
                                    title: lesson.title,
                                    content: lesson.content,
                                    description: lesson.description || '',
                                    categoryId: lesson.categoryId,
                                    order: lesson.order,
                                    isPublished: lesson.isPublished
                                  });
                                  setShowLessonForm(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => deleteLesson(lesson.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Quizzes Management</CardTitle>
                    <CardDescription>Create and manage quiz content</CardDescription>
                  </div>
                  <Button onClick={() => router.push('/admin/quizzes/add')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Quiz
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showQuizForm && (
                  <Card className="mb-6 border-2 border-blue-200">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>{editingQuiz ? 'Edit Quiz' : 'Create Quiz'}</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setShowQuizForm(false);
                          setEditingQuiz(null);
                        }}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="quiz-title">Title</Label>
                          <Input
                            id="quiz-title"
                            value={quizForm.title}
                            onChange={(e) => setQuizForm({...quizForm, title: e.target.value})}
                            placeholder="Quiz title"
                          />
                        </div>
                        <div>
                          <Label htmlFor="quiz-category">Category</Label>
                          <Select value={quizForm.categoryId} onValueChange={(value) => setQuizForm({...quizForm, categoryId: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="quiz-description">Description</Label>
                        <Input
                          id="quiz-description"
                          value={quizForm.description}
                          onChange={(e) => setQuizForm({...quizForm, description: e.target.value})}
                          placeholder="Quiz description"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="quiz-difficulty">Difficulty</Label>
                          <Select value={quizForm.difficulty} onValueChange={(value) => setQuizForm({...quizForm, difficulty: value as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'})}>
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
                          <Label htmlFor="quiz-time">Time Limit (minutes)</Label>
                          <Input
                            id="quiz-time"
                            type="number"
                            value={quizForm.timeLimit}
                            onChange={(e) => setQuizForm({...quizForm, timeLimit: parseInt(e.target.value)})}
                            min="1"
                            max="120"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="quiz-published"
                            checked={quizForm.isPublished}
                            onChange={(e) => setQuizForm({...quizForm, isPublished: e.target.checked})}
                          />
                          <Label htmlFor="quiz-published">Published</Label>
                        </div>
                        <Button onClick={saveQuiz}>
                          <Save className="h-4 w-4 mr-2" />
                          {editingQuiz ? 'Update' : 'Create'} Quiz
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Time Limit</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quizzes.map((quiz) => (
                        <TableRow key={quiz.id}>
                          <TableCell className="font-medium">{quiz.title}</TableCell>
                          <TableCell>{categories.find(c => c.id === quiz.categoryId)?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={
                              quiz.difficulty === 'BEGINNER' ? 'secondary' :
                              quiz.difficulty === 'INTERMEDIATE' ? 'default' : 'destructive'
                            }>
                              {quiz.difficulty}
                            </Badge>
                          </TableCell>
                          <TableCell>{quiz.timeLimit} min</TableCell>
                          <TableCell>
                            <Badge variant={quiz.isPublished ? 'default' : 'secondary'}>
                              {quiz.isPublished ? 'Published' : 'Draft'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setEditingQuiz(quiz);
                                  setQuizForm({
                                    title: quiz.title,
                                    description: quiz.description || '',
                                    categoryId: quiz.categoryId,
                                    difficulty: quiz.difficulty,
                                    timeLimit: quiz.timeLimit || 10,
                                    isPublished: quiz.isPublished
                                  });
                                  setShowQuizForm(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => deleteQuiz(quiz.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Paths Tab */}
          <TabsContent value="paths">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Learning Paths Management</CardTitle>
                    <CardDescription>Create and manage structured learning paths</CardDescription>
                  </div>
                  <Button onClick={() => router.push('/admin/learning-paths/add')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Learning Path
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Icon</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Lessons</TableHead>
                        <TableHead>Quizzes</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {learningPaths.map((path) => (
                        <TableRow key={path.id}>
                          <TableCell className="text-2xl">{path.icon}</TableCell>
                          <TableCell className="font-medium">{path.title}</TableCell>
                          <TableCell className="max-w-xs truncate">{path.description}</TableCell>
                          <TableCell>
                            <Badge className={
                              path.difficulty === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                              path.difficulty === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {path.difficulty}
                            </Badge>
                          </TableCell>
                          <TableCell>{path.lessons.length}</TableCell>
                          <TableCell>{path.quizzes.length}</TableCell>
                          <TableCell>
                            <Badge variant={path.isActive ? 'default' : 'secondary'}>
                              {path.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/admin/learning-paths/edit/${path.id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteLearningPath(path.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{lessons.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{quizzes.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Categories</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{categories.length}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}