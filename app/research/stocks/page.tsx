import Link from 'next/link'
import { AppShell } from '@/components/layout/app-shell'
import { Header } from '@/components/layout/header'
import { getTickers, getNotesByTicker, formatDate } from '@/lib/data'
import { TrendingUp, FileText, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function StocksIndexPage() {
  const tickers = getTickers()

  // Group by sector
  const bySector: Record<string, typeof tickers> = {}
  for (const t of tickers) {
    if (!bySector[t.sector]) bySector[t.sector] = []
    bySector[t.sector].push(t)
  }
  const sectors = Object.keys(bySector).sort()

  return (
    <AppShell>
      <Header title="Stocks" subtitle={`${tickers.length} covered tickers`} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="space-y-8">
            {sectors.map((sector) => (
              <div key={sector}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{sector}</h2>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {bySector[sector].map((ticker) => (
                    <Link key={ticker.id} href={`/research/stocks/${ticker.id}`}>
                      <div className={cn(
                        'p-4 bg-card border border-border rounded-lg hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group'
                      )}>
                        <div className="flex items-start justify-between mb-2">
                          <span className="ticker text-sm font-bold text-primary">{ticker.id}</span>
                          {ticker.noteCount > 0 && (
                            <span className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded font-mono">
                              {ticker.noteCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-foreground leading-snug">{ticker.name}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{ticker.description}</p>
                        {ticker.lastUpdated && (
                          <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {formatDate(ticker.lastUpdated)}
                          </div>
                        )}
                        {!ticker.lastUpdated && (
                          <p className="mt-3 text-xs text-muted-foreground/50 italic">No notes yet</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </AppShell>
  )
}
