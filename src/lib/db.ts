import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const globalForDb = globalThis as unknown as { __sqlite?: DatabaseSync };

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "dev.db");

export const rawDb =
  globalForDb.__sqlite ?? new DatabaseSync(dbPath);

if (process.env.NODE_ENV !== "production") globalForDb.__sqlite = rawDb;

rawDb.exec(`
  CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS competitors (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    name TEXT NOT NULL,
    platform TEXT NOT NULL,
    handle TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
  );

  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    competitor_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    external_id TEXT NOT NULL,
    caption TEXT,
    url TEXT,
    likes INTEGER,
    comments INTEGER,
    views INTEGER,
    posted_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (competitor_id) REFERENCES competitors(id)
  );

  CREATE TABLE IF NOT EXISTS insights (
    id TEXT PRIMARY KEY,
    competitor_id TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDENTE',
    urgency TEXT NOT NULL DEFAULT 'MEDIUM',
    relevance_score INTEGER NOT NULL DEFAULT 80,
    summary TEXT NOT NULL,
    key_points TEXT NOT NULL,
    suggested_posts TEXT,
    source_post_url TEXT,
    llm_model TEXT NOT NULL DEFAULT 'regras-locais',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (competitor_id) REFERENCES competitors(id)
  );
`);
