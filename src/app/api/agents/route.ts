import { NextResponse } from 'next/server';
import { db, agents } from '@/lib/db';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const allAgents = await db
      .select()
      .from(agents)
      .orderBy(desc(agents.balance));
    
    return NextResponse.json({ success: true, data: allAgents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}
