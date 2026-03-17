import Link from 'next/link'
import { AppShell } from '@/components/layout/app-shell'
import { Header } from '@/components/layout/header'
import { getNotesByTicker, getTickerById, getTickers, formatDate, getNotesByType } from '@/lib/data'
import { NoteCard } from '@/components/notes/note-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, FileText, Plus, ChevronRight, Calendar } from 'lucide-react'

// Group notes by year, then category within each year
function groupNotesByHierarchy(notes: ReturnType<typeof getNotesByTicker>) {
  const byYear: Record<number, typeof notes> = {}
  const other: typeof notes = []

  for (const note of notes) {
    if (note.year) {
      if (!byYear[note.year]) byYear[note.year] = []
      byYear[note.year].push(note)
    } else {
      other.push(note)
    }
  }

  // Sort years descending
  const sortedYears = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a)

  return { byYear, sortedYears, other }
}

const CATEGORY_LABELS: Record<string, string> = {
  quarterly: 'Quarterly',
  conference: 'Conference',
  management_meeting: 'Mgmt Meeting',
  earnings: 'Earnings',
  custom: 'Custom',
}

interface TickerPageProps {
  params: Promise<{ ticker: string }>
}

export default async function TickerPage({ params }: TickerPageProps) {
  const { ticker } = await params
  const tickerUpper = ticker.toUpperCase()
  const tickerData = getTickerById(tickerUpper)
  const notes = getNotesByTicker(tickerUpper)
  const { byYear, sortedYears, other } = groupNotesByHierarchy(notes)

  return (
    <AppShell>
      <Header
        title={`${tickerUpper} — ${tickerData?.name ?? 'Unknown'}`}
        subtitle={tickerData ? `${tickerData.sector} · ${tickerData.description}` : undefined}
        actions={
          <Link href={`/notes/new?ticker=${tickerUpper}`}>
            <Button size="sm" className="h-8 text-xs gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              New Note
            </Button>
          </Link>
        }
      />
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-6">

          {/* Ticker hero */}
          <div className="flex items-start gap-5 mb-8 p-5 bg-card border border-border rounded-xl">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="ticker text-lg text-primary">{tickerUpper}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-lg font-bold text-foreground">{tickerData?.name ?? tickerUpper}</h1>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                  {tickerData?.sector}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{tickerData?.description}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  {notes.length} note{notes.length !== 1 ? 's' : ''}
                </span>
                {tickerData?.lastUpdated && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Last updated {formatDate(tickerData.lastUpdated)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {notes.length === 0 ? (
            <div className="text-center py-16">
              <TrendingUp className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">No notes yet for {tickerUpper}</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Start by adding the first research note.</p>
              <Link href={`/notes/new?ticker=${tickerUpper}`}>
                <Button size="sm" className="gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  New Note
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Notes grouped by year */}
              {sortedYears.map((year) => {
                const yearNotes = byYear[year]
                // Group by quarter within year
                const byQ: Record<string, typeof yearNotes> = {}
                const noQ: typeof yearNotes = []
                for (const n of yearNotes) {
                  if (n.quarter) {
                    if (!byQ[n.quarter]) byQ[n.quarter] = []
                    byQ[n.quarter].push(n)
                  } else {
                    noQ.push(n)
                  }
                }
                const quarters = ['Q4', 'Q3', 'Q2', 'Q1'].filter((q) => byQ[q])

                return (
                  <div key={year}>
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-base font-semibold text-foreground">{year}</h2>
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground">{yearNotes.length} notes</span>
                    </div>

                    <div className="space-y-6">
                      {/* Quarterly grouped */}
                      {quarters.map((q) => (
                        <div key={q}>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{q}</span>
                            <span className="text-xs text-muted-foreground">{byQ[q].length} note{byQ[q].length !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="space-y-2.5 pl-4 border-l-2 border-primary/20">
                            {byQ[q].map((note) => (
                              <NoteCard key={note.id} note={note} showTier />
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Other notes (conference, mgmt meeting, etc.) */}
                      {noQ.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Other</span>
                          </div>
                          <div className="space-y-2.5 pl-4 border-l-2 border-border">
                            {noQ.map((note) => (
                              <NoteCard key={note.id} note={note} showTier />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Notes without a year */}
              {other.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-base font-semibold text-foreground">Undated</h2>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="space-y-2.5">
                    {other.map((note) => (
                      <NoteCard key={note.id} note={note} showTier />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </AppShell>
  )
}
