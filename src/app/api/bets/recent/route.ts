import { NextResponse } from 'next/server';
import { db, bets, agents, events } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const recentBets = await db
      .select({
        bet: bets,
        agent: agents,
        event: events,
      })
      .from(bets)
      .innerJoin(agents, eq(bets.agentId, agents.id))
      .innerJoin(events, eq(bets.eventId, events.id))
      .orderBy(desc(bets.createdAt))
      .limit(20);
    
    return NextResponse.json({ success: true, data: recentBets });
  } catch (error) {
    console.error('Error fetching recent bets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recent bets' },
      { status: 500 }
    );
  }
}
