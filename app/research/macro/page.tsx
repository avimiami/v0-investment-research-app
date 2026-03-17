import Link from 'next/link'
import { AppShell } from '@/components/layout/app-shell'
import { Header } from '@/components/layout/header'
import { getNotesByType, formatDate } from '@/lib/data'
import { NoteCard } from '@/components/notes/note-card'
import { Globe, Plus, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const MACRO_CATEGORIES = [
  { key: 'rates', label: 'Rates & Fed Policy', description: 'Monetary policy, yield curve, and central bank commentary' },
  { key: 'credit', label: 'Credit Markets', description: 'Spreads, issuance, high yield, and private credit' },
  { key: 'fx', label: 'FX & Global Macro', description: 'Currency dynamics, trade flows, and geopolitical macro' },
  { key: 'earnings', label: 'Macro Earnings Context', description: 'Aggregate earnings trends and economic forecasts' },
]

export default function MacroPage() {
  const macroNotes = getNotesByType('macro')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  return (
    <AppShell>
      <Header title="Macro" subtitle="Global macro research and Fed policy notes" />
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-6">

          {/* Macro overview cards */}
          <div className="grid grid-cols-2 gap-3 mb-8 md:grid-cols-4">
            {[
              { label: 'Fed Funds Rate', value: '5.25%', change: 'Hold', up: null },
              { label: '10Y Treasury', value: '4.71%', change: '+12bps MTD', up: true },
              { label: 'IG Spreads', value: '80bps', change: '-5bps MTD', up: false },
              { label: 'HY Spreads', value: '285bps', change: '+8bps MTD', up: true },
            ].map((item) => (
              <div key={item.label} className="bg-card border border-border rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                <p className="text-xl font-semibold font-mono text-foreground">{item.value}</p>
                <p className={cn(
                  'text-xs mt-1 flex items-center gap-1',
                  item.up === null ? 'text-muted-foreground' :
                  item.up ? 'text-destructive' : 'text-green-600'
                )}>
                  {item.up === null ? <Minus className="w-3 h-3" /> : item.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {item.change}
                </p>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-foreground">Macro Research Notes</h2>
            <Link href="/notes/new?type=macro">
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                New Macro Note
              </Button>
            </Link>
          </div>

          {macroNotes.length === 0 ? (
            <div className="text-center py-16">
              <Globe className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">No macro notes yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add macro research and Fed policy notes here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {macroNotes.map((note) => (
                <NoteCard key={note.id} note={note} showTier />
              ))}
            </div>
          )}
        </div>
      </main>
    </AppShell>
  )
}
