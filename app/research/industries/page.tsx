import Link from 'next/link'
import { AppShell } from '@/components/layout/app-shell'
import { Header } from '@/components/layout/header'
import { getIndustries, getNotesByType, formatDate } from '@/lib/data'
import { NoteCard } from '@/components/notes/note-card'
import { Building2, FileText, Calendar, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const SECTOR_COLORS: Record<string, string> = {
  Technology: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900',
  'Communication Services': 'bg-violet-500/10 text-violet-600 border-violet-200 dark:border-violet-900',
  'Consumer Discretionary': 'bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-900',
  Utilities: 'bg-green-500/10 text-green-600 border-green-200 dark:border-green-900',
  Financials: 'bg-teal-500/10 text-teal-600 border-teal-200 dark:border-teal-900',
}

export default function IndustriesPage() {
  const industries = getIndustries()
  const industryNotes = getNotesByType('industry')

  const notesByIndustry: Record<string, typeof industryNotes> = {}
  for (const note of industryNotes) {
    if (note.industryId) {
      if (!notesByIndustry[note.industryId]) notesByIndustry[note.industryId] = []
      notesByIndustry[note.industryId].push(note)
    }
  }

  return (
    <AppShell>
      <Header title="Industries" subtitle={`${industries.length} sectors covered`} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">

          {industries.map((industry) => {
            const notes = notesByIndustry[industry.id] ?? []
            const sectorStyle = SECTOR_COLORS[industry.sector] ?? 'bg-secondary text-secondary-foreground border-border'

            return (
              <div key={industry.id} className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Industry header */}
                <div className="p-5 border-b border-border">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h2 className="text-sm font-semibold text-foreground">{industry.name}</h2>
                          <span className={cn('text-xs px-1.5 py-0.5 rounded border font-medium', sectorStyle)}>
                            {industry.sector}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{industry.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
                          <span>{industry.tickerIds.length} tickers covered</span>
                          {industry.lastUpdated && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(industry.lastUpdated)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link href={`/notes/new?type=industry&industry=${industry.id}`}>
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 shrink-0">
                        <Plus className="w-3 h-3" />
                        Add Note
                      </Button>
                    </Link>
                  </div>

                  {/* Ticker chips */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {industry.tickerIds.map((t) => (
                      <Link key={t} href={`/research/stocks/${t}`}>
                        <span className="ticker text-xs bg-secondary hover:bg-primary/10 hover:text-primary text-secondary-foreground px-2 py-0.5 rounded transition-colors cursor-pointer">
                          {t}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {notes.length > 0 ? (
                  <div className="p-4 space-y-2.5">
                    {notes.map((note) => (
                      <NoteCard key={note.id} note={note} compact />
                    ))}
                  </div>
                ) : (
                  <div className="px-5 py-4">
                    <p className="text-xs text-muted-foreground italic">No industry notes yet.</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </AppShell>
  )
}
