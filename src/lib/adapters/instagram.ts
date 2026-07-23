import { RawPost } from "./types";

/**
 * Coleta os posts recentes de um perfil do Instagram.
 *
 * Modo real: se APIFY_TOKEN estiver configurado, usa o ator
 * "apify/instagram-scraper" via Apify API (https://apify.com/apify/instagram-scraper).
 * Custo aproximado: ~$1.50 por 1.000 posts coletados (ver docs da Apify).
 *
 * Modo demonstracao: sem token, devolve dados de exemplo realistas para que
 * o pipeline inteiro (coleta -> IA -> insight) funcione sem custo nenhum.
 */
export async function fetchInstagramPosts(handle: string): Promise<RawPost[]> {
  const token = process.env.APIFY_TOKEN;

  if (!token) {
    return mockInstagramPosts(handle);
  }

  const res = await fetch(
    `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        directUrls: [`https://www.instagram.com/${handle.replace("@", "")}/`],
        resultsType: "posts",
        resultsLimit: 12,
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Apify Instagram Scraper falhou: ${res.status} ${res.statusText}`);
  }

  const data: any[] = await res.json();
  return data.map((item) => ({
    externalId: String(item.id ?? item.shortCode ?? item.url),
    caption: item.caption ?? "",
    url: item.url ?? `https://www.instagram.com/${handle}/`,
    likes: item.likesCount,
    comments: item.commentsCount,
    postedAt: item.timestamp,
  }));
}

function mockInstagramPosts(handle: string): RawPost[] {
  const clean = handle.replace("@", "");
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  return [
    {
      externalId: `${clean}-1`,
      caption:
        "Encontre o espaco ideal para o seu evento em poucos cliques. Capacidade de 50 a 2.000 pessoas. Clique e agende sua visita!",
      url: `https://www.instagram.com/${clean}/`,
      likes: 842,
      comments: 37,
      postedAt: new Date(now - 2 * day).toISOString(),
    },
    {
      externalId: `${clean}-2`,
      caption:
        "Bastidores do nosso ultimo evento corporativo: mais de 800 pessoas, 3 salas simultaneas, tudo dentro do prazo.",
      url: `https://www.instagram.com/${clean}/`,
      likes: 611,
      comments: 22,
      postedAt: new Date(now - 6 * day).toISOString(),
    },
    {
      externalId: `${clean}-3`,
      caption:
        "Voce ja sabe qual espaco combina com o seu proximo evento? Fale com a gente e receba uma proposta em 24h.",
      url: `https://www.instagram.com/${clean}/`,
      likes: 455,
      comments: 15,
      postedAt: new Date(now - 10 * day).toISOString(),
    },
  ];
}
