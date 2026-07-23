import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { getDefaultWorkspace } from "@/lib/workspace";

export const metadata: Metadata = {
  title: "Competitor Radar - Inteligencia de Concorrencia",
  description: "Monitoramento de concorrentes com insights gerados por IA",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const workspace = await getDefaultWorkspace();

  return (
    <html lang="pt-BR">
      <body>
        <div className="flex min-h-screen">
          <aside className="w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col">
            <div className="px-5 py-5 border-b border-gray-100 flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold text-sm">
                CR
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-900">Competitor Radar</div>
                <div className="text-xs text-gray-400">{workspace.name}</div>
              </div>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
              <Link href="/" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-brand-50 hover:text-brand-700 font-medium">
                Dashboard
              </Link>
              <Link href="/competidores" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-brand-50 hover:text-brand-700 font-medium">
                Concorrentes
              </Link>
              <Link href="/insights" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-brand-50 hover:text-brand-700 font-medium">
                Insights
              </Link>
            </nav>
            <div className="px-5 py-4 border-t border-gray-100 text-xs text-gray-400">
              Fase 1 - uso interno. White-label (logo por cliente) na fase 2.
            </div>
          </aside>
          <main className="flex-1 px-8 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
