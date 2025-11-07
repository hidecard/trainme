import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    let dateFilter = {};
    const now = new Date();
    
    if (timeframe === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = {
        quizAttempts: {
          some: {
            completedAt: {
              gte: weekAgo
            }
          }
        }
      };
    } else if (timeframe === 'monthly') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = {
        quizAttempts: {
          some: {
            completedAt: {
              gte: monthAgo
            }
          }
        }
      };
    }

    const users = await db.user.findMany({
      where: dateFilter,
      include: {
        quizAttempts: {
          where: timeframe === 'all' ? {} : {
            completedAt: timeframe === 'weekly' 
              ? { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
              : { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
          },
          include: {
            quiz: true
          }
        },
        userProgress: {
          include: {
            lesson: true
          }
        },
        achievements: {
          include: {
            achievement: true
          }
        }
      },
      orderBy: {
        totalXp: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Calculate additional stats for each user
    const leaderboard = users.map((user, index) => {
      const totalQuizzesTaken = user.quizAttempts.length;
      const averageScore = totalQuizzesTaken > 0 
        ? user.quizAttempts.reduce((sum, attempt) => sum + (attempt.score / attempt.totalQuestions) * 100, 0) / totalQuizzesTaken
        : 0;

      const completedLessons = user.userProgress.filter(p => p.completed).length;
      const totalStudyTime = user.quizAttempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0);

      // Calculate rank change (this would require storing previous ranks in a real app)
      const previousRank = index + 1; // Placeholder - would come from historical data

      return {
        id: user.id,
        name: user.name || 'Anonymous User',
        avatar: user.avatar || '👤',
        totalXp: user.totalXp,
        level: user.level,
        streak: user.streak,
        completedLessons,
        quizScore: Math.round(averageScore),
        rank: index + 1,
        previousRank, // This would be calculated from historical data
        badges: user.achievements.map(a => a.achievement.icon).slice(0, 4),
        country: '🇺🇸', // This would come from user profile
        stats: {
          totalQuizzesTaken,
          totalStudyTime,
          achievementsUnlocked: user.achievements.length
        }
      };
    });

    const total = await db.user.count({ where: dateFilter });

    return NextResponse.json({
      leaderboard,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      timeframe,
      stats: {
        totalUsers: total,
        activeUsersThisWeek: await db.user.count({
          where: {
            lastActive: {
              gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        totalQuizzesToday: await db.quizAttempt.count({
          where: {
            completedAt: {
              gte: new Date(now.setHours(0, 0, 0, 0))
            }
          }
        }),
        totalXpEarnedToday: await db.quizAttempt.aggregate({
          where: {
            completedAt: {
              gte: new Date(now.setHours(0, 0, 0, 0))
            }
          },
          _sum: {
            score: true
          }
        })
      }
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}