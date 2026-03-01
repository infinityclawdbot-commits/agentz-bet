import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Find user
    const user = db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .get();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
