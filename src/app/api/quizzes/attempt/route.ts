import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, quizId, answers, timeSpent } = body;

    if (!userId || !quizId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate score
    let score = 0;
    const processedAnswers = [];

    for (const answer of answers) {
      const { questionId, optionId } = answer;
      
      // Get the correct option for this question
      const question = await db.question.findUnique({
        where: { id: questionId },
        include: {
          options: true
        }
      });

      if (!question) {
        return NextResponse.json(
          { error: `Question ${questionId} not found` },
          { status: 400 }
        );
      }

      const selectedOption = question.options.find(opt => opt.id === optionId);
      const isCorrect = selectedOption?.isCorrect || false;
      
      if (isCorrect) {
        score++;
      }

      processedAnswers.push({
        questionId,
        optionId,
        isCorrect
      });
    }

    // Create quiz attempt
    const quizAttempt = await db.quizAttempt.create({
      data: {
        userId,
        quizId,
        score,
        totalQuestions: answers.length,
        timeSpent,
        answers: {
          create: processedAnswers
        }
      },
      include: {
        answers: {
          include: {
            question: {
              include: {
                options: true
              }
            },
            option: true
          }
        }
      }
    });

    // Update user XP and stats
    const xpEarned = score * 10; // 10 XP per correct answer
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (user) {
      await db.user.update({
        where: { id: userId },
        data: {
          totalXp: user.totalXp + xpEarned,
          level: Math.floor((user.totalXp + xpEarned) / 100) + 1,
          lastActive: new Date()
        }
      });
    }

    return NextResponse.json({
      quizAttempt,
      score,
      totalQuestions: answers.length,
      percentage: Math.round((score / answers.length) * 100),
      xpEarned
    });
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    return NextResponse.json(
      { error: 'Failed to submit quiz attempt' },
      { status: 500 }
    );
  }
}