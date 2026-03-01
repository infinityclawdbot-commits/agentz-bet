import { NextRequest, NextResponse } from 'next/server';
import { db, events, bets } from '@/lib/db';
import { eq, count } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);
    
    if (event.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Get bet count for this event
    const betCount = await db
      .select({ count: count() })
      .from(bets)
      .where(eq(bets.eventId, id));
    
    return NextResponse.json({
      success: true,
      data: {
        ...event[0],
        betCount: betCount[0].count,
      },
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}
