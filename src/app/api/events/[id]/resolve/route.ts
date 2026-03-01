import { NextRequest, NextResponse } from 'next/server';
import { db, events, bets, agents } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { outcome } = body;
    
    if (!outcome || !['YES', 'NO'].includes(outcome)) {
      return NextResponse.json(
        { success: false, error: 'Invalid outcome. Must be YES or NO' },
        { status: 400 }
      );
    }
    
    // Get event
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
    
    if (event[0].status === 'resolved') {
      return NextResponse.json(
        { success: false, error: 'Event already resolved' },
        { status: 400 }
      );
    }
    
    // Update event status
    await db
      .update(events)
      .set({
        status: 'resolved',
        outcome: outcome as 'YES' | 'NO',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(events.id, id));
    
    // Get all bets for this event
    const eventBets = await db
      .select()
      .from(bets)
      .where(eq(bets.eventId, id));
    
    // Process each bet
    for (const bet of eventBets) {
      const won = bet.position === outcome;
      
      if (won) {
        // Calculate payout: amount * (100 / odds)
        const payout = bet.amount * (100 / bet.odds);
        
        // Update bet
        await db
          .update(bets)
          .set({
            outcome: 'won',
            payout,
          })
          .where(eq(bets.id, bet.id));
        
        // Get current agent data
        const agent = await db
          .select()
          .from(agents)
          .where(eq(agents.id, bet.agentId))
          .limit(1);
        
        if (agent.length > 0) {
          const currentStreak = agent[0].streak;
          // If on a winning streak, increment; if losing/neutral, start new streak
          const newStreak = currentStreak >= 0 ? currentStreak + 1 : 1;
          
          await db
            .update(agents)
            .set({
              balance: agent[0].balance + payout,
              wins: agent[0].wins + 1,
              streak: newStreak,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(agents.id, bet.agentId));
        }
      } else {
        // Lost bet
        await db
          .update(bets)
          .set({
            outcome: 'lost',
            payout: 0,
          })
          .where(eq(bets.id, bet.id));
        
        // Get current agent data
        const agent = await db
          .select()
          .from(agents)
          .where(eq(agents.id, bet.agentId))
          .limit(1);
        
        if (agent.length > 0) {
          const currentStreak = agent[0].streak;
          // If on a losing streak, decrement; if winning/neutral, start new losing streak
          const newStreak = currentStreak <= 0 ? currentStreak - 1 : -1;
          
          await db
            .update(agents)
            .set({
              losses: agent[0].losses + 1,
              streak: newStreak,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(agents.id, bet.agentId));
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        eventId: id,
        outcome,
        betsProcessed: eventBets.length,
      },
    });
  } catch (error) {
    console.error('Error resolving event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resolve event' },
      { status: 500 }
    );
  }
}
