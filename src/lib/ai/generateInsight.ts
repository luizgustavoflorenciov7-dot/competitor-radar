import { RawPost } from "../adapters/types";

export interface InsightResult {
  category: string;
  title: string;
  summary: string;
  keyPoints: string[];
  suggestedPosts: string[];
  urgency: "LOW" | "MEDIUM" | "HIGH";
  relevanceScore: number;
  llmModel: string;
}

interface GenerateInsightInput {
  competitorName: string;
  platform: string;
  posts: RawPost[];
  myBusinessName: string;
  myBusinessContext: string;
}

/**
 * Gera um insight estrategico a partir dos posts coletados de um concorrente.
 *
 * Modo real: usa a API do Gemini (gemini-2.5-flash) se GEMINI_API_KEY estiver
 * definida. Custo aproximado: $0.30 / milhao de tokens de entrada e $2.50 /
 * milhao de saida - para o volume deste app, poucos centavos por dia.
 *
 * Modo demonstracao: sem chave, usa um gerador local baseado em regras que
 * olha para o post de maior engajamento e monta um insight no mesmo formato.
 * Isso deixa o pipeline inteiro funcional e gratis, so trocando por uma
 * chamada de LLM de verdade quando voce tiver a chave.
 */
export async function generateInsight(input: GenerateInsightInput): Promise<InsightResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    return generateWithGemini(input, apiKey);
  }
  return generateWithRules(input);
}

async function generateWithGemini(
  input: GenerateInsightInput,
  apiKey: string
): Promise<InsightResult> {
  const prompt = buildPrompt(input);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Gemini API falhou: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  const parsed = JSON.parse(text);

  return {
    category: parsed.category ?? "GAP DE CONCORRENCIA",
    title: parsed.title ?? `Movimento de ${input.competitorName}`,
    summary: parsed.summary ?? "",
    keyPoints: parsed.keyPoints ?? [],
    suggestedPosts: parsed.suggestedPosts ?? [],
    urgency: parsed.urgency ?? "MEDIUM",
    relevanceScore: parsed.relevanceScore ?? 80,
    llmModel: "gemini-2.5-flash",
  };
}

function buildPrompt(input: GenerateInsightInput): string {
  const postsText = input.posts
    .map((p, i) => `${i + 1}. "${p.caption}" (likes: ${p.likes ?? "-"}, views: ${p.views ?? "-"})`)
    .join("\n");

  return `Voce e um analista de inteligencia competitiva de marketing.
Negocio monitorado: ${input.myBusinessName}. Contexto: ${input.myBusinessContext}.
Concorrente: ${input.competitorName} (${input.platform}).
Posts recentes do concorrente:
${postsText}

Gere um insight estrategico em JSON com este formato exato:
{
  "category": "string curta em maiusculas, ex: GAP DE CONCORRENCIA",
  "title": "string curta descrevendo o insight",
  "summary": "1 paragrafo de resumo estrategico",
  "keyPoints": ["ponto 1", "ponto 2", "ponto 3"],
  "suggestedPosts": ["sugestao de post 1", "sugestao de post 2"],
  "urgency": "LOW" | "MEDIUM" | "HIGH",
  "relevanceScore": numero de 0 a 100
}
Responda apenas com o JSON.`;
}

function generateWithRules(input: GenerateInsightInput): InsightResult {
  const sorted = [...input.posts].sort(
    (a, b) => (b.likes ?? b.views ?? 0) - (a.likes ?? a.views ?? 0)
  );
  const top = sorted[0];

  if (!top) {
    return {
      category: "SEM DADOS",
      title: `Nenhum post encontrado para ${input.competitorName}`,
      summary: "Nao foi possivel coletar posts recentes deste concorrente.",
      keyPoints: [],
      suggestedPosts: [],
      urgency: "LOW",
      relevanceScore: 10,
      llmModel: "regras-locais",
    };
  }

  const engagement = top.likes ?? top.views ?? 0;
  const urgency: InsightResult["urgency"] =
    engagement > 5000 ? "HIGH" : engagement > 500 ? "MEDIUM" : "LOW";

  return {
    category: "GAP DE CONCORRENCIA",
    title: `${input.competitorName}: abordagem direta de conversao em ${input.platform}`,
    summary: `O post de maior engajamento de ${input.competitorName} ("${top.caption.slice(0, 120)}${
      top.caption.length > 120 ? "..." : ""
    }") mostra foco em conveniencia e call-to-action direto. Para ${input.myBusinessName}, isso reforca a importancia de comunicar facilidade de acesso e agendamento, alem do valor da experiencia oferecida.`,
    keyPoints: [
      `Comunicacao concisa e orientada a acao, com dados objetivos de capacidade/oferta.`,
      `Call-to-action explicito e de baixa friccao (ex: "agende em poucos cliques").`,
      `${input.myBusinessName} pode elevar o discurso indo alem do "espaco/produto" e vendendo a experiencia completa.`,
    ],
    suggestedPosts: [
      `Como transformamos [categoria do servico] em uma experiencia inesquecivel: do planejamento a execucao.`,
      `A versatilidade do que oferecemos: o ambiente/solucao perfeita para cada objetivo do seu cliente.`,
    ],
    urgency,
    relevanceScore: Math.min(95, 50 + Math.round(engagement / 100)),
    llmModel: "regras-locais",
  };
}
