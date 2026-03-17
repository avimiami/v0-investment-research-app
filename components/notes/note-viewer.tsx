'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Edit3,
  Clock,
  Tag,
  Users,
  Share2,
  Lock,
  Eye,
  EyeOff,
  TrendingUp,
  Building2,
  Globe,
  Sparkles,
  Zap,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Plus,
  Calendar,
  FileText,
  ArrowUpRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  type Note,
  type AccessTier,
  getUserById,
  formatDate,
  formatFullDate,
  getNoteAccessTier,
  CURRENT_USER_ID,
  getTeamById,
} from '@/lib/data'

// ---- Section display ----

const SECTION_META: Record<
  string,
  { label: string; description: string; color: string }
> = {
  managementReview: {
    label: 'Management Review',
    description: 'Assessment of management quality, tone, and key messages',
    color: 'border-l-blue-400',
  },
  businessDescription: {
    label: 'Business Description',
    description: 'Financial results, key metrics, and performance summary',
    color: 'border-l-teal-400',
  },
  competitiveDynamics: {
    label: 'Competitive Dynamics',
    description: 'Competitive positioning, market share, and moat assessment',
    color: 'border-l-violet-400',
  },
  keyInsights: {
    label: 'Key Insights & Action Items',
    description: 'Takeaways, price target changes, and follow-up items',
    color: 'border-l-amber-400',
  },
}

interface SectionDisplayProps {
  sectionKey: string
  content: string
  defaultOpen?: boolean
}

function SectionDisplay({ sectionKey, content, defaultOpen = true }: SectionDisplayProps) {
  const [open, setOpen] = useState(defaultOpen)
  const meta = SECTION_META[sectionKey]
  if (!meta) return null

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden')}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-secondary/40 hover:bg-secondary/70 transition-colors text-left"
      >
        <div className={cn('w-0.5 h-4 rounded-full shrink-0', meta.color.replace('border-l-', 'bg-'))} />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-foreground">{meta.label}</span>
          {!open && content && (
            <span className="ml-2 text-xs text-muted-foreground truncate">
              {content.slice(0, 80)}...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {content && (
            <span className="text-xs text-muted-foreground font-mono">
              {content.split(' ').filter(Boolean).length}w
            </span>
          )}
          {open ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {open && (
        <div className={cn('px-5 py-4 border-l-2', meta.color)}>
          {content ? (
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No content in this section.</p>
          )}
        </div>
      )}
    </div>
  )
}

// ---- Research note (comment) entry ----

interface ResearchNoteEntryProps {
  note: { id: string; userId: string; note: string; createdAt: string }
  isOwn?: boolean
}

function ResearchNoteEntry({ note, isOwn }: ResearchNoteEntryProps) {
  const author = getUserById(note.userId)
  return (
    <div className="flex gap-3 group">
      <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-[9px] font-bold text-primary">{author?.initials ?? '?'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-foreground">
            {isOwn ? 'You' : author?.name ?? 'Unknown'}
          </span>
          <span className="text-[11px] text-muted-foreground">{formatDate(note.createdAt)}</span>
        </div>
        <p className="text-xs text-foreground leading-relaxed">{note.note}</p>
      </div>
    </div>
  )
}

// ---- Visibility badge ----

const VISIBILITY_DISPLAY = {
  private: { label: 'Draft (Private)', icon: <EyeOff className="w-3 h-3" />, className: 'text-blue-500 bg-blue-500/10' },
  team: { label: 'Team', icon: <Users className="w-3 h-3" />, className: 'text-teal-600 bg-teal-600/10' },
  shared: { label: 'Selective Share', icon: <Share2 className="w-3 h-3" />, className: 'text-green-600 bg-green-600/10' },
  restricted: { label: 'Restricted', icon: <Lock className="w-3 h-3" />, className: 'text-amber-600 bg-amber-600/10' },
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  stock: <TrendingUp className="w-4 h-4" />,
  industry: <Building2 className="w-4 h-4" />,
  macro: <Globe className="w-4 h-4" />,
  theme: <Sparkles className="w-4 h-4" />,
  quick: <Zap className="w-4 h-4" />,
}

const CATEGORY_LABELS: Record<string, string> = {
  quarterly: 'Quarterly Update',
  conference: 'Conference Note',
  management_meeting: 'Management Meeting',
  earnings: 'Earnings Call',
  custom: 'Custom',
}

// ---- Main component ----

interface NoteViewerProps {
  note: Note
}

export function NoteViewer({ note }: NoteViewerProps) {
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<Array<{ id: string; userId: string; note: string; createdAt: string }>>([])

  const author = getUserById(note.authorId)
  const isOwn = note.authorId === CURRENT_USER_ID
  const tier = getNoteAccessTier(note, CURRENT_USER_ID)
  const visConfig = VISIBILITY_DISPLAY[note.visibility]
  const typeIcon = TYPE_ICONS[note.type] ?? <FileText className="w-4 h-4" />

  const sectionOrder = ['managementReview', 'businessDescription', 'competitiveDynamics', 'keyInsights'] as const
  const filledSections = sectionOrder.filter((k) => note.sections[k])

  const handleAddComment = () => {
    if (!newComment.trim()) return
    setComments((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        userId: CURRENT_USER_ID,
        note: newComment.trim(),
        createdAt: new Date().toISOString(),
      },
    ])
    setNewComment('')
  }

  return (
    <div className="flex gap-6 h-full">
      {/* ---- Left: main content ---- */}
      <div className="flex-1 min-w-0 space-y-5">

        {/* Title block */}
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1 text-muted-foreground/70">
              {typeIcon}
              <span className="capitalize">{note.type}</span>
            </span>
            {note.ticker && (
              <>
                <span>/</span>
                <Link href={`/research/stocks/${note.ticker}`} className="hover:text-foreground transition-colors">
                  <span className="ticker text-xs">{note.ticker}</span>
                </Link>
              </>
            )}
            {note.year && (
              <>
                <span>/</span>
                <span>{note.year}</span>
              </>
            )}
            {note.quarter && (
              <>
                <span>/</span>
                <span>{note.quarter}</span>
              </>
            )}
            {note.category && (
              <>
                <span>/</span>
                <span>{CATEGORY_LABELS[note.category] ?? note.category}</span>
              </>
            )}
          </div>

          <h1 className="text-xl font-bold text-foreground leading-snug text-pretty">
            {note.title}
          </h1>

          {/* Author + meta row */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
                <span className="text-[9px] font-bold text-primary">{author?.initials ?? '?'}</span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {isOwn ? 'You' : author?.name ?? 'Unknown'}
              </span>
              <span className="text-xs text-muted-foreground">&middot; {author?.role}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              {formatFullDate(note.updatedAt)}
            </div>

            {note.readTime && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                {note.readTime} min read
              </div>
            )}

            <span className={cn('flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded', visConfig.className)}>
              {visConfig.icon}
              {visConfig.label}
            </span>
          </div>
        </div>

        <Separator />

        {/* Sections */}
        <div className="space-y-3">
          {sectionOrder.map((key, idx) => (
            <SectionDisplay
              key={key}
              sectionKey={key}
              content={note.sections[key] ?? ''}
              defaultOpen={idx < 2}
            />
          ))}
        </div>

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1 shrink-0">
              <Tag className="w-3.5 h-3.5" />
              Tags
            </div>
            <div className="flex flex-wrap gap-1.5">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related tickers */}
        {note.relatedTickers && note.relatedTickers.length > 0 && (
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1 shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
              Related
            </div>
            <div className="flex flex-wrap gap-1.5">
              {note.relatedTickers.map((t) => (
                <Link key={t} href={`/research/stocks/${t}`}>
                  <span className="ticker text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md hover:bg-primary/20 transition-colors cursor-pointer">
                    {t}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Research Notes / Comments panel */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Research Notes</h2>
            <span className="text-xs text-muted-foreground">
              Private annotations &amp; follow-up questions
            </span>
          </div>

          {/* Existing comments */}
          <div className="space-y-4 mb-4">
            {comments.length === 0 && (
              <p className="text-xs text-muted-foreground italic">
                No research notes yet. Add a private annotation below.
              </p>
            )}
            {comments.map((c) => (
              <ResearchNoteEntry key={c.id} note={c} isOwn={c.userId === CURRENT_USER_ID} />
            ))}
          </div>

          {/* Add new comment */}
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a research note, follow-up question, or future reminder..."
              className="min-h-20 text-sm resize-none border-0 focus-visible:ring-0 rounded-none bg-transparent leading-relaxed"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  handleAddComment()
                }
              }}
            />
            <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-secondary/30">
              <span className="text-[11px] text-muted-foreground">Cmd+Enter to save</span>
              <Button
                size="sm"
                className="h-7 text-xs gap-1.5 px-3"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                <Plus className="w-3 h-3" />
                Add Note
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Right sidebar ---- */}
      <div className="w-56 shrink-0 space-y-4">

        {/* Note metadata */}
        <div className="border border-border rounded-lg p-4 bg-card space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Details</h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-start gap-2">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium text-foreground capitalize">{note.type}</span>
            </div>
            {note.ticker && (
              <div className="flex justify-between items-start gap-2">
                <span className="text-muted-foreground">Ticker</span>
                <span className="ticker text-xs font-bold text-primary">{note.ticker}</span>
              </div>
            )}
            {note.category && (
              <div className="flex justify-between items-start gap-2">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium text-foreground text-right">{CATEGORY_LABELS[note.category] ?? note.category}</span>
              </div>
            )}
            {(note.quarter || note.year) && (
              <div className="flex justify-between items-start gap-2">
                <span className="text-muted-foreground">Period</span>
                <span className="font-medium font-mono text-foreground">
                  {[note.quarter, note.year].filter(Boolean).join(' ')}
                </span>
              </div>
            )}
            <div className="flex justify-between items-start gap-2">
              <span className="text-muted-foreground">Words</span>
              <span className="font-mono">{note.wordCount ?? note.sections ? Object.values(note.sections).join(' ').split(' ').filter(Boolean).length : 0}</span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="text-muted-foreground">Sections</span>
              <span className="font-mono">{filledSections.length}/4</span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="text-muted-foreground">Updated</span>
              <span className="text-foreground">{formatDate(note.updatedAt)}</span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="text-muted-foreground">Created</span>
              <span className="text-foreground">{formatDate(note.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Access info */}
        <div className="border border-border rounded-lg p-4 bg-card space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Access</h3>
          <div className={cn('flex items-center gap-2 text-xs font-medium px-2 py-1.5 rounded-md', visConfig.className)}>
            {visConfig.icon}
            {visConfig.label}
          </div>
          {note.visibility === 'restricted' && note.accessCost && (
            <p className="text-xs text-muted-foreground">
              Unlocked for <span className="font-semibold text-amber-600">{note.accessCost} pts</span>
            </p>
          )}
          {note.sharedWith.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Shared with {note.sharedWith.length} team{note.sharedWith.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Actions */}
        {isOwn && (
          <div className="space-y-2">
            <Link href={`/notes/${note.id}/edit`} className="block">
              <Button variant="outline" size="sm" className="w-full gap-2 h-8 text-xs justify-start">
                <Edit3 className="w-3.5 h-3.5" />
                Edit Note
              </Button>
            </Link>
          </div>
        )}

        {/* Tags condensed */}
        {note.tags.length > 0 && (
          <div className="border border-border rounded-lg p-4 bg-card">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tags</h3>
            <div className="flex flex-wrap gap-1">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
