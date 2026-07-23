import { getDefaultWorkspace, listRecentInsights } from "@/lib/repo";
import Link from "next/link";

function statusColor(s: string) {
  if (s === "APROVADO") return "bg-green-100 text-green-700";
  if (s === "REPROVADO") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}

export default async function InsightsPage() {
  const workspace = getDefaultWorkspace();
  const insights = listRecentInsights(workspace.id, 200);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Insights</h1>
      <p className="text-sm text-gray-500 mb-6">
        Todos os insights gerados pela IA a partir do monitoramento de concorrentes.
      </p>

      <div className="space-y-3">
        {insights.map((insight) => (
          <Link
            key={insight.id}
            href={`/insights/${insight.id}`}
            className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-brand-200 transition"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-brand-600">{insight.category}</span>
              <span className={`badge ${statusColor(insight.status)}`}>{insight.status}</span>
            </div>
            <div className="font-medium text-gray-900 text-sm">{insight.title}</div>
            <div className="text-xs text-gray-400 mt-1">
              {insight.competitor_name} - {insight.competitor_platform} - score {insight.relevance_score}%
            </div>
          </Link>
        ))}
        {insights.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-6">Nenhum insight gerado ainda.</div>
        )}
      </div>
    </div>
  );
}
