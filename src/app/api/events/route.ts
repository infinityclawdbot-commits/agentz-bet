import { NextRequest, NextResponse } from 'next/server';
import { db, events } from '@/lib/db';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    
    // Build conditions
    const conditions = [];
    if (status) {
      conditions.push(eq(events.status, status as 'open' | 'closed' | 'resolved'));
    }
    if (category) {
      conditions.push(eq(events.category, category));
    }
    
    const allEvents = await db
      .select()
      .from(events)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(events.createdAt));
    
    return NextResponse.json({ success: true, data: allEvents });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
