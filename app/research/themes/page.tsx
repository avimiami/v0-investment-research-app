import Link from 'next/link'
import { AppShell } from '@/components/layout/app-shell'
import { Header } from '@/components/layout/header'
import { getThemes, getNotesByType, formatDate } from '@/lib/data'
import { NoteCard } from '@/components/notes/note-card'
import { Sparkles, Plus, ArrowRight, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const CONVICTION_CONFIG = {
  high:   { label: 'High Conviction', color: 'text-green-600 bg-green-600/10 border-green-200 dark:border-green-900/40' },
  medium: { label: 'Medium',          color: 'text-amber-600 bg-amber-600/10 border-amber-200 dark:border-amber-900/40' },
  low:    { label: 'Low',             color: 'text-muted-foreground bg-secondary border-border' },
}

const STATUS_CONFIG = {
  active:     { label: 'Active',      dot: 'bg-green-500' },
  developing: { label: 'Developing',  dot: 'bg-amber-500' },
  closed:     { label: 'Closed',      dot: 'bg-muted-foreground' },
}

export default function ThemesPage() {
  const themes = getThemes()
  const themeNotes = getNotesByType('theme')

  const notesByTheme: Record<string, typeof themeNotes> = {}
  for (const note of themeNotes) {
    if (note.themeId) {
      if (!notesByTheme[note.themeId]) notesByTheme[note.themeId] = []
      notesByTheme[note.themeId].push(note)
    }
  }

  // Sort: active high conviction first
  const sortedThemes = [...themes].sort((a, b) => {
    const statusOrder = { active: 0, developing: 1, closed: 2 }
    const convOrder   = { high: 0, medium: 1, low: 2 }
    const statusDiff  = statusOrder[a.status] - statusOrder[b.status]
    if (statusDiff !== 0) return statusDiff
    return convOrder[a.conviction] - convOrder[b.conviction]
  })

  return (
    <AppShell>
      <Header title="Investment Themes" subtitle={`${themes.filter(t => t.status === 'active').length} active themes`} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">

          {sortedThemes.map((theme) => {
            const notes = notesByTheme[theme.id] ?? []
            const conviction = CONVICTION_CONFIG[theme.conviction]
            const status = STATUS_CONFIG[theme.status]

            return (
              <div key={theme.id} className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Theme header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <h2 className="text-base font-semibold text-foreground">{theme.name}</h2>
                        {/* Status dot + label */}
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                          {status.label}
                        </span>
                        {/* Conviction badge */}
                        <span className={cn('text-xs px-1.5 py-0.5 rounded border font-medium', conviction.color)}>
                          {conviction.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{theme.description}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {theme.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Related tickers */}
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className="text-xs text-muted-foreground">Tickers:</span>
                        {theme.relatedTickers.map((t) => (
                          <Link key={t} href={`/research/stocks/${t}`}>
                            <span className="ticker text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded hover:bg-primary/20 transition-colors cursor-pointer">
                              {t}
                            </span>
                          </Link>
                        ))}
                      </div>

                      {/* Related themes */}
                      {theme.relatedThemes.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-xs text-muted-foreground">Linked themes:</span>
                          {theme.relatedThemes.map((tid) => {
                            const linked = themes.find(t => t.id === tid)
                            return linked ? (
                              <span key={tid} className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Zap className="w-2.5 h-2.5" />
                                {linked.shortName}
                              </span>
                            ) : null
                          })}
                        </div>
                      )}
                    </div>

                    <Link href={`/notes/new?type=theme&theme=${theme.id}`}>
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 shrink-0">
                        <Plus className="w-3 h-3" />
                        Add Note
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Notes */}
                {notes.length > 0 ? (
                  <div className="border-t border-border p-4 space-y-2.5">
                    {notes.map((note) => (
                      <NoteCard key={note.id} note={note} compact />
                    ))}
                  </div>
                ) : (
                  <div className="border-t border-border px-5 py-3">
                    <p className="text-xs text-muted-foreground italic">No notes linked to this theme yet.</p>
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
