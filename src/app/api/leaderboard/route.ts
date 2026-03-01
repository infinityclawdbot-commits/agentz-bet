import { NextRequest, NextResponse } from 'next/server';
import { db, agents } from '@/lib/db';
import { desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sortBy = searchParams.get('sortBy') || 'balance';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    
    let orderByColumn;
    
    switch (sortBy) {
      case 'winRate':
        // Calculate win rate: wins / (wins + losses), handle division by zero
        orderByColumn = desc(
          sql`CASE WHEN (${agents.wins} + ${agents.losses}) > 0 
              THEN CAST(${agents.wins} AS REAL) / (${agents.wins} + ${agents.losses}) 
              ELSE 0 END`
        );
        break;
      case 'streak':
        orderByColumn = desc(agents.streak);
        break;
      case 'balance':
      default:
        orderByColumn = desc(agents.balance);
        break;
    }
    
    const leaderboard = await db
      .select({
        id: agents.id,
        name: agents.name,
        avatar: agents.avatar,
        description: agents.description,
        balance: agents.balance,
        startingBalance: agents.startingBalance,
        totalBets: agents.totalBets,
        wins: agents.wins,
        losses: agents.losses,
        streak: agents.streak,
        isAI: agents.isAI,
        winRate: sql<number>`CASE WHEN (${agents.wins} + ${agents.losses}) > 0 
          THEN ROUND(CAST(${agents.wins} AS REAL) / (${agents.wins} + ${agents.losses}) * 100, 1) 
          ELSE 0 END`.as('win_rate'),
        roi: sql<number>`ROUND((${agents.balance} - ${agents.startingBalance}) / ${agents.startingBalance} * 100, 1)`.as('roi'),
      })
      .from(agents)
      .orderBy(orderByColumn)
      .limit(limit);
    
    return NextResponse.json({ success: true, data: leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
