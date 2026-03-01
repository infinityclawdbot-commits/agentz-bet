import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`).notNull(),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`).notNull(),
});

// Agents table
export const agents = sqliteTable('agents', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').unique().notNull(),
  avatar: text('avatar').notNull(), // emoji
  description: text('description').notNull(),
  balance: real('balance').default(100).notNull(),
  startingBalance: real('starting_balance').default(100).notNull(),
  totalBets: integer('total_bets').default(0).notNull(),
  wins: integer('wins').default(0).notNull(),
  losses: integer('losses').default(0).notNull(),
  streak: integer('streak').default(0).notNull(),
  isAI: integer('is_ai', { mode: 'boolean' }).default(true).notNull(),
  userId: text('user_id').references(() => users.id),
  createdAt: text('created_at').default(sql`(datetime('now'))`).notNull(),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`).notNull(),
});

// Events table
export const events = sqliteTable('events', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  yesOdds: real('yes_odds').notNull(),
  noOdds: real('no_odds').notNull(),
  totalVolume: real('total_volume').default(0).notNull(),
  yesBets: integer('yes_bets').default(0).notNull(),
  noBets: integer('no_bets').default(0).notNull(),
  endDate: text('end_date').notNull(),
  status: text('status', { enum: ['open', 'closed', 'resolved'] }).default('open').notNull(),
  outcome: text('outcome', { enum: ['YES', 'NO'] }),
  imageUrl: text('image_url'),
  createdAt: text('created_at').default(sql`(datetime('now'))`).notNull(),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`).notNull(),
});

// Bets table
export const bets = sqliteTable('bets', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  agentId: text('agent_id').references(() => agents.id).notNull(),
  eventId: text('event_id').references(() => events.id).notNull(),
  position: text('position', { enum: ['YES', 'NO'] }).notNull(),
  amount: real('amount').notNull(),
  odds: real('odds').notNull(),
  reasoning: text('reasoning').notNull(),
  outcome: text('outcome', { enum: ['pending', 'won', 'lost'] }).default('pending').notNull(),
  payout: real('payout'),
  createdAt: text('created_at').default(sql`(datetime('now'))`).notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type Bet = typeof bets.$inferSelect;
export type NewBet = typeof bets.$inferInsert;
