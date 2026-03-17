'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useMemo, Suspense } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Header } from '@/components/layout/header'
import { NoteCard, RestrictedNoteCard } from '@/components/notes/note-card'
import {
  searchNotes,
  getTickers,
  getIndustries,
  getThemes,
  getNotesByTicker,
  getNotesByType,
  getNoteAccessTier,
  CURRENT_USER_ID,
  type Note,
  type NoteType,
} from '@/lib/data'
import { Search, FileText, TrendingUp, Building2, Sparkles, Globe, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

const TYPE_FILTERS: { value: NoteType | 'all'; label: string; icon: React.ReactNode }[] = [
  { value: 'all',      label: 'All',        icon: <FileText className="w-3.5 h-3.5" /> },
  { value: 'stock',    label: 'Stocks',     icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { value: 'industry', label: 'Industry',   icon: <Building2 className="w-3.5 h-3.5" /> },
  { value: 'macro',    label: 'Macro',      icon: <Globe className="w-3.5 h-3.5" /> },
  { value: 'theme',    label: 'Themes',     icon: <Sparkles className="w-3.5 h-3.5" /> },
  { value: 'quick',    label: 'Quick',      icon: <FileText className="w-3.5 h-3.5" /> },
]

function SearchContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''

  const [query, setQuery] = useState(initialQuery)
  const [typeFilter, setTypeFilter] = useState<NoteType | 'all'>('all')

  const results: Note[] = useMemo(() => {
    if (!query.trim()) return []
    const raw = searchNotes(query, CURRENT_USER_ID)
    if (typeFilter === 'all') return raw
    return raw.filter((n) => n.type === typeFilter)
  }, [query, typeFilter])

  const hasQuery = query.trim().length > 0

  return (
    <AppShell>
      <Header title="Search" subtitle="Find notes across your research library" />
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-6">

          {/* Search bar */}
          <div className="relative mb-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes, tickers, themes, tags..."
              className="pl-10 h-11 text-sm bg-card"
              autoFocus
            />
          </div>

          {/* Type filter chips */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                  typeFilter === f.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
                )}
              >
                {f.icon}
                {f.label}
              </button>
            ))}
          </div>

          {/* Results */}
          {!hasQuery ? (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">Search your research notes</p>
              <p className="text-xs text-muted-foreground mt-1">
                Search by title, ticker, theme, tag, or note content.
              </p>

              {/* Quick links */}
              <div className="mt-8 grid grid-cols-3 gap-3 max-w-sm mx-auto">
                {[
                  { label: 'NVDA', href: '/research/stocks/NVDA', desc: 'AI chips' },
                  { label: 'AI Infra', href: '/research/themes', desc: 'Theme' },
                  { label: 'Macro', href: '/research/macro', desc: 'Risk notes' },
                ].map((q) => (
                  <a key={q.label} href={q.href} className="p-3 border border-border rounded-lg hover:border-primary/30 text-center transition-colors">
                    <p className="text-sm font-semibold text-foreground">{q.label}</p>
                    <p className="text-xs text-muted-foreground">{q.desc}</p>
                  </a>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">No results for "{query}"</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try different keywords, a ticker symbol, or a tag name.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-semibold text-foreground">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-muted-foreground">for "{query}"</span>
              </div>
              <div className="space-y-2.5">
                {results.map((note) => {
                  const tier = getNoteAccessTier(note, CURRENT_USER_ID)
                  if (tier === 'restricted') {
                    return <RestrictedNoteCard key={note.id} note={note} />
                  }
                  return <NoteCard key={note.id} note={note} showTier />
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </AppShell>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <AppShell>
        <Header title="Search" subtitle="Find notes across your research library" />
        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="relative mb-5">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input placeholder="Search notes, tickers, themes, tags..." className="pl-10 h-11 text-sm bg-card" disabled />
            </div>
          </div>
        </main>
      </AppShell>
    }>
      <SearchContent />
    </Suspense>
  )
}
