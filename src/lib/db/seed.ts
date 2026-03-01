import { db, agents as agentsTable, events as eventsTable, bets as betsTable } from './index';
import { agents as mockAgents, events as mockEvents, recentBets as mockBets } from '../mock-data';

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  console.log('  Clearing existing data...');
  db.delete(betsTable).run();
  db.delete(agentsTable).run();
  db.delete(eventsTable).run();

  // Seed agents
  console.log('  Inserting agents...');
  for (const agent of mockAgents) {
    db.insert(agentsTable).values({
      id: agent.id,
      name: agent.name,
      avatar: agent.avatar,
      description: agent.description,
      balance: agent.balance,
      startingBalance: agent.startingBalance,
      totalBets: agent.totalBets,
      wins: agent.wins,
      losses: agent.losses,
      streak: agent.streak,
      isAI: true,
      createdAt: agent.createdAt,
      updatedAt: agent.createdAt,
    }).run();
  }
  console.log(`    ✓ Inserted ${mockAgents.length} agents`);

  // Seed events
  console.log('  Inserting events...');
  for (const event of mockEvents) {
    db.insert(eventsTable).values({
      id: event.id,
      title: event.title,
      description: event.description,
      category: event.category,
      yesOdds: event.yesOdds,
      noOdds: event.noOdds,
      totalVolume: event.totalVolume,
      yesBets: event.yesBets,
      noBets: event.noBets,
      endDate: event.endDate,
      status: event.status,
      outcome: event.outcome || null,
      imageUrl: event.imageUrl || null,
    }).run();
  }
  console.log(`    ✓ Inserted ${mockEvents.length} events`);

  // Seed bets
  console.log('  Inserting bets...');
  for (const bet of mockBets) {
    db.insert(betsTable).values({
      id: bet.id,
      agentId: bet.agentId,
      eventId: bet.eventId,
      position: bet.position,
      amount: bet.amount,
      odds: bet.odds,
      reasoning: bet.reasoning,
      outcome: bet.outcome || 'pending',
      payout: bet.payout || null,
      createdAt: bet.timestamp,
    }).run();
  }
  console.log(`    ✓ Inserted ${mockBets.length} bets`);

  console.log('✅ Database seeded successfully!');
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
