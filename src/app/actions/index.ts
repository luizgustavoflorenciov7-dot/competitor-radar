"use server";

import { revalidatePath } from "next/cache";
import {
  getDefaultWorkspace,
  addCompetitor as addCompetitorRepo,
  deleteCompetitor as deleteCompetitorRepo,
  listCompetitors,
  upsertPost,
  createInsight,
  updateInsightStatus as updateInsightStatusRepo,
} from "@/lib/repo";
import { fetchInstagramPosts } from "@/lib/adapters/instagram";
import { fetchYoutubeVideos } from "@/lib/adapters/youtube";
import { generateInsight } from "@/lib/ai/generateInsight";

export async function addCompetitor(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const platform = String(formData.get("platform") || "instagram");
  const handle = String(formData.get("handle") || "").trim().replace("@", "");

  if (!name || !handle) return;

  const workspace = getDefaultWorkspace();
  addCompetitorRepo({ workspaceId: workspace.id, name, platform, handle });

  revalidatePath("/competidores");
  revalidatePath("/");
}

export async function deleteCompetitor(competitorId: string) {
  deleteCompetitorRepo(competitorId);
  revalidatePath("/competidores");
  revalidatePath("/");
}

export async function updateInsightStatus(insightId: string, status: string) {
  updateInsightStatusRepo(insightId, status);
  revalidatePath("/insights");
  revalidatePath(`/insights/${insightId}`);
}

export async function runDailyCollection() {
  const workspace = getDefaultWorkspace();
  const competitors = listCompetitors(workspace.id);

  const myBusinessName = process.env.MY_BUSINESS_NAME || workspace.name;
  const myBusinessContext =
    process.env.MY_BUSINESS_CONTEXT || "Sem contexto adicional configurado.";

  for (const competitor of competitors) {
    const posts =
      competitor.platform === "youtube"
        ? await fetchYoutubeVideos(competitor.handle)
        : await fetchInstagramPosts(competitor.handle);

    for (const post of posts) {
      upsertPost({
        competitorId: competitor.id,
        platform: competitor.platform,
        externalId: post.externalId,
        caption: post.caption,
        url: post.url,
        likes: post.likes,
        comments: post.comments,
        views: post.views,
        postedAt: post.postedAt ?? null,
      });
    }

    const insight = await generateInsight({
      competitorName: competitor.name,
      platform: competitor.platform,
      posts,
      myBusinessName,
      myBusinessContext,
    });

    createInsight({
      competitorId: competitor.id,
      category: insight.category,
      title: insight.title,
      summary: insight.summary,
      keyPoints: insight.keyPoints,
      suggestedPosts: insight.suggestedPosts,
      urgency: insight.urgency,
      relevanceScore: insight.relevanceScore,
      llmModel: insight.llmModel,
      sourcePostUrl: posts[0]?.url,
    });
  }

  revalidatePath("/");
  revalidatePath("/insights");
}
