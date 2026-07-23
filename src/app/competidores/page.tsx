import { getDefaultWorkspace, listCompetitors } from "@/lib/repo";
import { addCompetitor, deleteCompetitor } from "@/app/actions";

export default async function CompetidoresPage() {
  const workspace = getDefaultWorkspace();
  const competitors = listCompetitors(workspace.id);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Concorrentes</h1>
      <p className="text-sm text-gray-500 mb-6">
        Cadastre os perfis que voce quer monitorar no Instagram e no YouTube.
      </p>

      <form
        action={addCompetitor}
        className="bg-white rounded-xl border border-gray-100 p-5 mb-8 grid grid-cols-4 gap-3 items-end"
      >
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Nome do concorrente</label>
          <input
            name="name"
            required
            placeholder="Ex: Eventos For You"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Plataforma</label>
          <select name="platform" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">@handle / canal</label>
          <input
            name="handle"
            required
            placeholder="Ex: eventosforyou_"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="col-span-4">
          <button className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg">
            Adicionar concorrente
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {competitors.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between"
          >
            <div>
              <div className="font-medium text-gray-900 text-sm">{c.name}</div>
              <div className="text-xs text-gray-400">
                {c.platform} - @{c.handle} - {c.posts_count} posts coletados - {c.insights_count} insights
              </div>
            </div>
            <form action={deleteCompetitor.bind(null, c.id)}>
              <button className="text-xs text-red-500 hover:text-red-700 font-medium">Remover</button>
            </form>
          </div>
        ))}
        {competitors.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-6">Nenhum concorrente cadastrado ainda.</div>
        )}
      </div>
    </div>
  );
}
