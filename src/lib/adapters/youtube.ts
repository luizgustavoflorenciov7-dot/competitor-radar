import { RawPost } from "./types";

/**
 * Coleta os videos recentes de um canal do YouTube.
 *
 * Modo real: usa a YouTube Data API v3 (oficial, gratuita ate 10.000
 * unidades/dia). Requer YOUTUBE_API_KEY e o handle ou ID do canal.
 * Docs: https://developers.google.com/youtube/v3
 *
 * Modo demonstracao: sem chave, devolve dados de exemplo.
 */
export async function fetchYoutubeVideos(handle: string): Promise<RawPost[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return mockYoutubeVideos(handle);
  }

  const channelHandle = handle.startsWith("@") ? handle : `@${handle}`;
  const channelRes = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=id,contentDetails&forHandle=${encodeURIComponent(
      channelHandle
    )}&key=${apiKey}`
  );
  if (!channelRes.ok) {
    throw new Error(`YouTube API (channels) falhou: ${channelRes.status}`);
  }
  const channelData = await channelRes.json();
  const uploadsPlaylistId =
    channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) return [];

  const videosRes = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=10&playlistId=${uploadsPlaylistId}&key=${apiKey}`
  );
  if (!videosRes.ok) {
    throw new Error(`YouTube API (playlistItems) falhou: ${videosRes.status}`);
  }
  const videosData = await videosRes.json();

  return (videosData.items ?? []).map((item: any) => ({
    externalId: item.snippet.resourceId.videoId,
    caption: item.snippet.title,
    url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
    postedAt: item.snippet.publishedAt,
  }));
}

function mockYoutubeVideos(handle: string): RawPost[] {
  const clean = handle.replace("@", "");
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  return [
    {
      externalId: `${clean}-yt-1`,
      caption: "Como transformamos um evento corporativo em uma experiencia inesquecivel | Bastidores",
      url: `https://www.youtube.com/@${clean}`,
      views: 15400,
      postedAt: new Date(now - 3 * day).toISOString(),
    },
    {
      externalId: `${clean}-yt-2`,
      caption: "Tour completo pelo espaco: conheca cada detalhe antes de fechar seu evento",
      url: `https://www.youtube.com/@${clean}`,
      views: 8200,
      postedAt: new Date(now - 9 * day).toISOString(),
    },
  ];
}
