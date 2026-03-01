import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';

// Database file path
const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'data', 'agentz.db');

// Ensure data directory exists
import { mkdirSync } from 'fs';
mkdirSync(path.dirname(dbPath), { recursive: true });

// Create SQLite connection
const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');

// Create Drizzle instance with schema
export const db = drizzle(sqlite, { schema });

// Export schema for convenience
export * from './schema';
