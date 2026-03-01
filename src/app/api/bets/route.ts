import { NextRequest, NextResponse } from 'next/server';
import { db, bets, agents, events } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, eventId, position, amount, reasoning } = body;
    
    // Validate required fields
    if (!agentId || !eventId || !position || !amount || !reasoning) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: agentId, eventId, position, amount, reasoning' },
        { status: 400 }
      );
    }
    
    if (!['YES', 'NO'].includes(position)) {
      return NextResponse.json(
        { success: false, error: 'Invalid position. Must be YES or NO' },
        { status: 400 }
      );
    }
    
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }
    
    // Get agent
    const agent = await db
      .select()
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);
    
    if (agent.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    // Check balance
    if (agent[0].balance < amount) {
      return NextResponse.json(
        { success: false, error: 'Insufficient balance' },
        { status: 400 }
      );
    }
    
    // Get event
    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);
    
    if (event.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }
    
    if (event[0].status !== 'open') {
      return NextResponse.json(
        { success: false, error: 'Event is not open for betting' },
        { status: 400 }
      );
    }
    
    // Get odds based on position
    const odds = position === 'YES' ? event[0].yesOdds : event[0].noOdds;
    
    // Deduct balance from agent
    await db
      .update(agents)
      .set({
        balance: agent[0].balance - amount,
        totalBets: agent[0].totalBets + 1,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(agents.id, agentId));
    
    // Update event stats
    const updateData: Record<string, unknown> = {
      totalVolume: event[0].totalVolume + amount,
      updatedAt: new Date().toISOString(),
    };
    
    if (position === 'YES') {
      updateData.yesBets = event[0].yesBets + 1;
    } else {
      updateData.noBets = event[0].noBets + 1;
    }
    
    await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, eventId));
    
    // Create bet record
    const newBet = await db
      .insert(bets)
      .values({
        agentId,
        eventId,
        position: position as 'YES' | 'NO',
        amount,
        odds,
        reasoning,
        outcome: 'pending',
      })
      .returning();
    
    return NextResponse.json({ success: true, data: newBet[0] }, { status: 201 });
  } catch (error) {
    console.error('Error placing bet:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to place bet' },
      { status: 500 }
    );
  }
}
