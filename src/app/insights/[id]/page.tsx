import { getInsightById } from "@/lib/repo";
import { updateInsightStatus } from "@/app/actions";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function InsightDetailPage({ params }: { params: { id: string } }) {
  const insight = getInsightById(params.id);

  if (!insight) return notFound();

  const keyPoints: string[] = JSON.parse(insight.key_points || "[]");
  const suggestedPosts: string[] = JSON.parse(insight.suggested_posts || "[]");

  return (
    <div className="max-w-3xl">
      <Link href="/insights" className="text-xs text-gray-400 hover:text-gray-600">
        &larr; Voltar
      </Link>

      <div className="bg-white rounded-xl border border-gray-100 p-6 mt-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge bg-brand-50 text-brand-700">{insight.category}</span>
          <span className="badge bg-amber-100 text-amber-700">{insight.status}</span>
          <span className="badge bg-gray-100 text-gray-600">Urgencia: {insight.urgency}</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-4">{insight.title}</h1>

        <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2">Resumo estrategico</h2>
        <p className="text-sm text-gray-700 mb-5 leading-relaxed">{insight.summary}</p>

        <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2">Pontos-chave</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 mb-5">
          {keyPoints.map((k, i) => (
            <li key={i}>{k}</li>
          ))}
        </ol>

        {suggestedPosts.length > 0 && (
          <>
            <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2">Sugestoes de conteudo</h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 mb-5">
              {suggestedPosts.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </>
        )}

        <div className="border-t border-gray-100 pt-4 mt-4 grid grid-cols-2 gap-4 text-xs text-gray-500">
          <div>
            <span className="font-medium text-gray-700">Concorrente:</span> {insight.competitor_name} (
            {insight.competitor_platform})
          </div>
          <div>
            <span className="font-medium text-gray-700">Score de relevancia:</span> {insight.relevance_score}%
          </div>
          <div>
            <span className="font-medium text-gray-700">Motor de IA:</span> {insight.llm_model}
          </div>
          {insight.source_post_url && (
            <div>
              <span className="font-medium text-gray-700">Origem:</span>{" "}
              <a href={insight.source_post_url} target="_blank" className="text-brand-600">
                ver post original
              </a>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <form action={updateInsightStatus.bind(null, insight.id, "APROVADO")}>
            <button className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-3 py-2 rounded-lg">
              Aprovar
            </button>
          </form>
          <form action={updateInsightStatus.bind(null, insight.id, "REPROVADO")}>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium px-3 py-2 rounded-lg">
              Reprovar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
