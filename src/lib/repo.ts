import { randomUUID } from "node:crypto";
import { rawDb } from "./db";

export interface Workspace {
  id: string;
  name: string;
  logo_url: string | null;
  created_at: string;
}

export interface Competitor {
  id: string;
  workspace_id: string;
  name: string;
  platform: string;
  handle: string;
  created_at: string;
}

export interface CompetitorWithCounts extends Competitor {
  posts_count: number;
  insights_count: number;
}

export interface Insight {
  id: string;
  competitor_id: string;
  category: string;
  title: string;
  status: string;
  urgency: string;
  relevance_score: number;
  summary: string;
  key_points: string;
  suggested_posts: string | null;
  source_post_url: string | null;
  llm_model: string;
  created_at: string;
}

export interface InsightWithCompetitor extends Insight {
  competitor_name: string;
  competitor_platform: string;
  competitor_handle: string;
}

// ---------- Workspace ----------

export function getDefaultWorkspace(): Workspace {
  const existing = rawDb
    .prepare("SELECT * FROM workspaces ORDER BY created_at ASC LIMIT 1")
    .get() as Workspace | undefined;
  if (existing) return existing;

  const id = randomUUID();
  const name = process.env.MY_BUSINESS_NAME || "Meu Workspace";
  rawDb.prepare("INSERT INTO workspaces (id, name) VALUES (?, ?)").run(id, name);
  return rawDb.prepare("SELECT * FROM workspaces WHERE id = ?").get(id) as Workspace;
}

// ---------- Competitors ----------

export function addCompetitor(input: { workspaceId: string; name: string; platform: string; handle: string }) {
  const id = randomUUID();
  rawDb
    .prepare(
      "INSERT INTO competitors (id, workspace_id, name, platform, handle) VALUES (?, ?, ?, ?, ?)"
    )
    .run(id, input.workspaceId, input.name, input.platform, input.handle);
  return id;
}

export function deleteCompetitor(competitorId: string) {
  rawDb.prepare("DELETE FROM insights WHERE competitor_id = ?").run(competitorId);
  rawDb.prepare("DELETE FROM posts WHERE competitor_id = ?").run(competitorId);
  rawDb.prepare("DELETE FROM competitors WHERE id = ?").run(competitorId);
}

export function listCompetitors(workspaceId: string): CompetitorWithCounts[] {
  return rawDb
    .prepare(
      `SELECT c.*,
        (SELECT COUNT(*) FROM posts p WHERE p.competitor_id = c.id) as posts_count,
        (SELECT COUNT(*) FROM insights i WHERE i.competitor_id = c.id) as insights_count
       FROM competitors c
       WHERE c.workspace_id = ?
       ORDER BY c.created_at DESC`
    )
    .all(workspaceId) as CompetitorWithCounts[];
}

export function countCompetitors(workspaceId: string): number {
  const row = rawDb
    .prepare("SELECT COUNT(*) as n FROM competitors WHERE workspace_id = ?")
    .get(workspaceId) as { n: number };
  return row.n;
}

// ---------- Posts ----------

export function upsertPost(input: {
  competitorId: string;
  platform: string;
  externalId: string;
  caption: string;
  url: string;
  likes?: number;
  comments?: number;
  views?: number;
  postedAt?: string | null;
}) {
  const id = `${input.competitorId}-${input.externalId}`;
  rawDb
    .prepare(
      `INSERT INTO posts (id, competitor_id, platform, external_id, caption, url, likes, comments, views, posted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         caption = excluded.caption,
         likes = excluded.likes,
         comments = excluded.comments,
         views = excluded.views`
    )
    .run(
      id,
      input.competitorId,
      input.platform,
      input.externalId,
      input.caption,
      input.url,
      input.likes ?? null,
      input.comments ?? null,
      input.views ?? null,
      input.postedAt ?? null
    );
}

// ---------- Insights ----------

export function createInsight(input: {
  competitorId: string;
  category: string;
  title: string;
  summary: string;
  keyPoints: string[];
  suggestedPosts: string[];
  urgency: string;
  relevanceScore: number;
  llmModel: string;
  sourcePostUrl?: string;
}) {
  const id = randomUUID();
  rawDb
    .prepare(
      `INSERT INTO insights
        (id, competitor_id, category, title, summary, key_points, suggested_posts, urgency, relevance_score, llm_model, source_post_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      input.competitorId,
      input.category,
      input.title,
      input.summary,
      JSON.stringify(input.keyPoints),
      JSON.stringify(input.suggestedPosts),
      input.urgency,
      input.relevanceScore,
      input.llmModel,
      input.sourcePostUrl ?? null
    );
  return id;
}

const INSIGHT_JOIN = `
  SELECT i.*, c.name as competitor_name, c.platform as competitor_platform, c.handle as competitor_handle
  FROM insights i
  JOIN competitors c ON c.id = i.competitor_id
`;

export function listRecentInsights(workspaceId: string, limit = 50): InsightWithCompetitor[] {
  return rawDb
    .prepare(
      `${INSIGHT_JOIN} WHERE c.workspace_id = ? ORDER BY i.created_at DESC LIMIT ?`
    )
    .all(workspaceId, limit) as InsightWithCompetitor[];
}

export function countInsights(workspaceId: string, status?: string): number {
  if (status) {
    const row = rawDb
      .prepare(
        `SELECT COUNT(*) as n FROM insights i JOIN competitors c ON c.id = i.competitor_id
         WHERE c.workspace_id = ? AND i.status = ?`
      )
      .get(workspaceId, status) as { n: number };
    return row.n;
  }
  const row = rawDb
    .prepare(
      `SELECT COUNT(*) as n FROM insights i JOIN competitors c ON c.id = i.competitor_id WHERE c.workspace_id = ?`
    )
    .get(workspaceId) as { n: number };
  return row.n;
}

export function getInsightById(id: string): InsightWithCompetitor | undefined {
  return rawDb.prepare(`${INSIGHT_JOIN} WHERE i.id = ?`).get(id) as
    | InsightWithCompetitor
    | undefined;
}

export function updateInsightStatus(id: string, status: string) {
  rawDb.prepare("UPDATE insights SET status = ? WHERE id = ?").run(status, id);
}
