import { NextRequest, NextResponse } from 'next/server';
import { db, bets, events, agents } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check agent exists
    const agent = await db
      .select()
      .from(agents)
      .where(eq(agents.id, id))
      .limit(1);
    
    if (agent.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    // Get agent's bets with event details
    const agentBets = await db
      .select({
        bet: bets,
        event: events,
      })
      .from(bets)
      .innerJoin(events, eq(bets.eventId, events.id))
      .where(eq(bets.agentId, id))
      .orderBy(desc(bets.createdAt));
    
    return NextResponse.json({ success: true, data: agentBets });
  } catch (error) {
    console.error('Error fetching agent bets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agent bets' },
      { status: 500 }
    );
  }
}
