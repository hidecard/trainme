import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const user = await db.user.findUnique({
      where: { id: params.id },
      include: {
        userProgress: {
          include: {
            lesson: {
              include: {
                category: true
              }
            }
          }
        },
        quizAttempts: {
          include: {
            quiz: {
              include: {
                category: true
              }
            }
          },
          orderBy: {
            completedAt: 'desc'
          },
          take: limit,
          skip: (page - 1) * limit
        },
        achievements: {
          include: {
            achievement: true
          }
        },
        _count: {
          select: {
            quizAttempts: true,
            userProgress: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate additional stats
    const totalQuizzesTaken = user._count.quizAttempts;
    const averageScore = totalQuizzesTaken > 0 
      ? user.quizAttempts.reduce((sum, attempt) => sum + (attempt.score / attempt.totalQuestions) * 100, 0) / totalQuizzesTaken
      : 0;

    const completedLessons = user._count.userProgress;
    const totalStudyTime = user.quizAttempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        totalXp: user.totalXp,
        level: user.level,
        streak: user.streak,
        lastActive: user.lastActive,
        createdAt: user.createdAt
      },
      stats: {
        totalQuizzesTaken,
        averageScore: Math.round(averageScore),
        completedLessons,
        totalStudyTime,
        achievementsUnlocked: user.achievements.length
      },
      progress: user.userProgress,
      recentAttempts: user.quizAttempts,
      achievements: user.achievements
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user progress' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, avatar, streak } = body;

    const user = await db.user.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar }),
        ...(streak !== undefined && { streak }),
        lastActive: new Date()
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}