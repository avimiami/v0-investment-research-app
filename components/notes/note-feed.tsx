'use client'

import { useState } from 'react'
import { NoteCard, RestrictedNoteCard } from './note-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getMyDraftNotes,
  getMyPublishedNotes,
  getTeamNotes,
  getSharedWithMeNotes,
  getRestrictedNotes,
  type Note,
  CURRENT_USER_ID,
} from '@/lib/data'
import { FileText, Edit3, Users, Share2, Lock } from 'lucide-react'
import { Empty } from '@/components/ui/empty'

type SortOption = 'recent' | 'oldest' | 'ticker'

function sortNotes(notes: Note[], sort: SortOption): Note[] {
  return [...notes].sort((a, b) => {
    if (sort === 'recent') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    if (sort === 'oldest') return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    if (sort === 'ticker') return (a.ticker ?? '').localeCompare(b.ticker ?? '')
    return 0
  })
}

function NoteList({ notes, showRestricted = false }: { notes: Note[]; showRestricted?: boolean }) {
  if (notes.length === 0) {
    return (
      <Empty>
        <Empty.Icon>
          <FileText className="w-8 h-8 text-muted-foreground/50" />
        </Empty.Icon>
        <Empty.Title>No notes here yet</Empty.Title>
        <Empty.Description>Notes will appear here when available.</Empty.Description>
      </Empty>
    )
  }

  return (
    <div className="space-y-3">
      {notes.map((note) =>
        showRestricted && note.visibility === 'restricted' ? (
          <RestrictedNoteCard key={note.id} note={note} />
        ) : (
          <NoteCard key={note.id} note={note} />
        )
      )}
    </div>
  )
}

export function NoteFeed() {
  const [sort, setSort] = useState<SortOption>('recent')

  const drafts = sortNotes(getMyDraftNotes(CURRENT_USER_ID), sort)
  const mine = sortNotes(getMyPublishedNotes(CURRENT_USER_ID), sort)
  const team = sortNotes(getTeamNotes(CURRENT_USER_ID), sort)
  const shared = sortNotes(getSharedWithMeNotes(CURRENT_USER_ID), sort)
  const restricted = sortNotes(getRestrictedNotes(), sort)

  const tabConfig = [
    {
      value: 'my-work',
      label: 'My Research',
      icon: <FileText className="w-3.5 h-3.5" />,
      count: drafts.length + mine.length,
    },
    {
      value: 'team',
      label: 'Team',
      icon: <Users className="w-3.5 h-3.5" />,
      count: team.length,
    },
    {
      value: 'shared',
      label: 'Shared',
      icon: <Share2 className="w-3.5 h-3.5" />,
      count: shared.length,
    },
    {
      value: 'discover',
      label: 'Discover',
      icon: <Lock className="w-3.5 h-3.5" />,
      count: restricted.length,
    },
  ]

  return (
    <div>
      <Tabs defaultValue="my-work">
        {/* Tab header row */}
        <div className="flex items-center justify-between mb-4 gap-4">
          <TabsList className="h-9 bg-secondary">
            {tabConfig.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-1.5 text-xs px-3 data-[state=active]:bg-background"
              >
                {tab.icon}
                {tab.label}
                <span className="ml-0.5 text-muted-foreground">({tab.count})</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="w-32 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent" className="text-xs">Most Recent</SelectItem>
              <SelectItem value="oldest" className="text-xs">Oldest First</SelectItem>
              <SelectItem value="ticker" className="text-xs">By Ticker</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* My Research tab */}
        <TabsContent value="my-work" className="mt-0">
          {drafts.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Drafts
                </h3>
                <span className="text-xs text-muted-foreground">({drafts.length})</span>
              </div>
              <NoteList notes={drafts} />
            </div>
          )}
          {mine.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Published
                </h3>
                <span className="text-xs text-muted-foreground">({mine.length})</span>
              </div>
              <NoteList notes={mine} />
            </div>
          )}
          {drafts.length === 0 && mine.length === 0 && <NoteList notes={[]} />}
        </TabsContent>

        {/* Team tab */}
        <TabsContent value="team" className="mt-0">
          <NoteList notes={team} />
        </TabsContent>

        {/* Shared tab */}
        <TabsContent value="shared" className="mt-0">
          {shared.length === 0 ? (
            <Empty>
              <Empty.Icon>
                <Share2 className="w-8 h-8 text-muted-foreground/50" />
              </Empty.Icon>
              <Empty.Title>No shared notes yet</Empty.Title>
              <Empty.Description>
                Notes shared with your team from other groups will appear here.
              </Empty.Description>
            </Empty>
          ) : (
            <NoteList notes={shared} />
          )}
        </TabsContent>

        {/* Discover tab - restricted notes */}
        <TabsContent value="discover" className="mt-0">
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/20 dark:border-amber-900/40">
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              These notes are from other teams. You can request access or spend points to unlock them instantly.
              Your current balance: <strong>{150} pts</strong>
            </p>
          </div>
          <NoteList notes={restricted} showRestricted />
        </TabsContent>
      </Tabs>
    </div>
  )
}
