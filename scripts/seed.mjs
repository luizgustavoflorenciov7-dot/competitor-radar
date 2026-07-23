import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import path from "node:path";

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "dev.db");
const db = new DatabaseSync(dbPath);

db.exec(`
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
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    competitor_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    external_id TEXT NOT NULL,
    caption TEXT, url TEXT, likes INTEGER, comments INTEGER, views INTEGER,
    posted_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS insights (
    id TEXT PRIMARY KEY,
    competitor_id TEXT NOT NULL,
    category TEXT NOT NULL, title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDENTE',
    urgency TEXT NOT NULL DEFAULT 'MEDIUM',
    relevance_score INTEGER NOT NULL DEFAULT 80,
    summary TEXT NOT NULL, key_points TEXT NOT NULL, suggested_posts TEXT,
    source_post_url TEXT, llm_model TEXT NOT NULL DEFAULT 'regras-locais',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

let workspace = db.prepare("SELECT * FROM workspaces LIMIT 1").get();
if (!workspace) {
  const id = "default-workspace";
  db.prepare("INSERT INTO workspaces (id, name) VALUES (?, ?)").run(
    id,
    process.env.MY_BUSINESS_NAME || "Meu Workspace"
  );
  workspace = { id };
}

const competitorsData = [
  { name: "Eventos For You", platform: "instagram", handle: "eventosforyou_" },
  { name: "Espaco Premium Eventos", platform: "youtube", handle: "espacopremiumeventos" },
];

for (const c of competitorsData) {
  const existing = db
    .prepare("SELECT id FROM competitors WHERE workspace_id = ? AND handle = ?")
    .get(workspace.id, c.handle);
  if (!existing) {
    db.prepare(
      "INSERT INTO competitors (id, workspace_id, name, platform, handle) VALUES (?, ?, ?, ?, ?)"
    ).run(randomUUID(), workspace.id, c.name, c.platform, c.handle);
  }
}

console.log("Seed concluido. Rode `npm run dev` e clique em 'Gerar insights de hoje'.");
