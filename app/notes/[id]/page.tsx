import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit3, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppShell } from '@/components/layout/app-shell'
import { NoteViewer } from '@/components/notes/note-viewer'
import { NoteEditor } from '@/components/notes/note-editor'
import { getNoteById, getNoteAccessTier, CURRENT_USER_ID } from '@/lib/data'

interface NotePageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mode?: string }>
}

export default async function NotePage({ params, searchParams }: NotePageProps) {
  const { id } = await params
  const { mode } = await searchParams
  const note = getNoteById(id)

  if (!note) notFound()

  const tier = getNoteAccessTier(note, CURRENT_USER_ID)
  const isOwn = note.authorId === CURRENT_USER_ID
  const isEditMode = mode === 'edit' && isOwn

  return (
    <AppShell>
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Sticky top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {note.ticker && (
                <span className="ticker text-xs font-bold text-primary bg-primary/8 px-2 py-0.5 rounded">
                  {note.ticker}
                </span>
              )}
              <span className="capitalize">{note.type} note</span>
              {note.status === 'draft' && (
                <span className="bg-blue-500/10 text-blue-500 text-xs font-medium px-1.5 py-0.5 rounded">
                  Draft
                </span>
              )}
            </div>
          </div>

          {isOwn && (
            <div className="flex items-center gap-2">
              {isEditMode ? (
                <Link href={`/notes/${id}`}>
                  <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </Button>
                </Link>
              ) : (
                <Link href={`/notes/${id}?mode=edit`}>
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-6 py-6">
            {isEditMode ? (
              <NoteEditor
                mode="edit"
                initialData={{
                  title: note.title,
                  type: note.type,
                  ticker: note.ticker,
                  category: note.category,
                  quarter: note.quarter,
                  year: note.year,
                  visibility: note.visibility,
                  tags: note.tags,
                  sections: {
                    managementReview: note.sections.managementReview,
                    businessDescription: note.sections.businessDescription,
                    competitiveDynamics: note.sections.competitiveDynamics,
                    keyInsights: note.sections.keyInsights,
                  },
                }}
              />
            ) : (
              <NoteViewer note={note} />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
