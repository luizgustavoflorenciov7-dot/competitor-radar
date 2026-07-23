import { getDefaultWorkspace, listRecentInsights, countCompetitors, countInsights } from "@/lib/repo";
import { runDailyCollection } from "@/app/actions";
import Link from "next/link";

function urgencyColor(u: string) {
  if (u === "HIGH") return "bg-red-100 text-red-700";
  if (u === "MEDIUM") return "bg-amber-100 text-amber-700";
  return "bg-gray-100 text-gray-600";
}

export default async function DashboardPage() {
  const workspace = getDefaultWorkspace();
  const competitorsCount = countCompetitors(workspace.id);
  const insights = listRecentInsights(workspace.id, 6);
  const pendingCount = countInsights(workspace.id, "PENDENTE");
  const totalInsights = countInsights(workspace.id);

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Visao geral do monitoramento de concorrentes.
          </p>
        </div>
        <form action={runDailyCollection}>
          <button className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm">
            Gerar insights de hoje
          </button>
        </form>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="text-xs text-gray-400 mb-1">Concorrentes monitorados</div>
          <div className="text-2xl font-semibold text-gray-900">{competitorsCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="text-xs text-gray-400 mb-1">Insights pendentes</div>
          <div className="text-2xl font-semibold text-gray-900">{pendingCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="text-xs text-gray-400 mb-1">Total de insights gerados</div>
          <div className="text-2xl font-semibold text-gray-900">{totalInsights}</div>
        </div>
      </div>

      <h2 className="text-sm font-semibold text-gray-700 mb-3">Insights recentes</h2>
      {insights.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-500">
          Nenhum insight ainda. Cadastre concorrentes em{" "}
          <Link href="/competidores" className="text-brand-600 font-medium">
            Concorrentes
          </Link>{" "}
          e clique em "Gerar insights de hoje".
        </div>
      )}
      <div className="space-y-3">
        {insights.map((insight) => (
          <Link
            key={insight.id}
            href={`/insights/${insight.id}`}
            className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-brand-200 transition"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-brand-600">{insight.category}</span>
              <span className={`badge ${urgencyColor(insight.urgency)}`}>{insight.urgency}</span>
            </div>
            <div className="font-medium text-gray-900 text-sm">{insight.title}</div>
            <div className="text-xs text-gray-400 mt-1">
              {insight.competitor_name} - {insight.competitor_platform}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
