'use client'

import Link from 'next/link'
import {
  FileText,
  Lock,
  Users,
  Share2,
  Clock,
  Tag,
  TrendingUp,
  Globe,
  Sparkles,
  Zap,
  Edit3,
  Eye,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  type Note,
  type AccessTier,
  getUserById,
  formatDate,
  getNoteAccessTier,
  CURRENT_USER_ID,
} from '@/lib/data'

const NOTE_TYPE_ICONS: Record<string, React.ReactNode> = {
  stock: <TrendingUp className="w-3.5 h-3.5" />,
  industry: <Building2 className="w-3.5 h-3.5" />,
  macro: <Globe className="w-3.5 h-3.5" />,
  theme: <Sparkles className="w-3.5 h-3.5" />,
  quick: <Zap className="w-3.5 h-3.5" />,
}

import { Building2 } from 'lucide-react'

const TIER_CONFIG: Record<
  AccessTier,
  { label: string; color: string; dotColor: string; icon: React.ReactNode }
> = {
  draft: {
    label: 'Draft',
    color: 'text-blue-500 bg-blue-500/10',
    dotColor: 'bg-blue-500',
    icon: <Edit3 className="w-3 h-3" />,
  },
  mine: {
    label: 'Mine',
    color: 'text-blue-500 bg-blue-500/10',
    dotColor: 'bg-blue-500',
    icon: <FileText className="w-3 h-3" />,
  },
  team: {
    label: 'Team',
    color: 'text-teal-600 bg-teal-600/10',
    dotColor: 'bg-teal-500',
    icon: <Users className="w-3 h-3" />,
  },
  shared: {
    label: 'Shared',
    color: 'text-green-600 bg-green-600/10',
    dotColor: 'bg-green-500',
    icon: <Share2 className="w-3 h-3" />,
  },
  restricted: {
    label: 'Restricted',
    color: 'text-amber-600 bg-amber-600/10',
    dotColor: 'bg-amber-500',
    icon: <Lock className="w-3 h-3" />,
  },
}

const CATEGORY_LABELS: Record<string, string> = {
  quarterly: 'Quarterly',
  conference: 'Conference',
  management_meeting: 'Mgmt Meeting',
  earnings: 'Earnings',
  custom: 'Custom',
}

interface NoteCardProps {
  note: Note
  showTier?: boolean
  compact?: boolean
}

export function NoteCard({ note, showTier = true, compact = false }: NoteCardProps) {
  const tier = getNoteAccessTier(note, CURRENT_USER_ID)
  const tierConfig = TIER_CONFIG[tier]
  const author = getUserById(note.authorId)
  const isOwn = note.authorId === CURRENT_USER_ID
  const typeIcon = NOTE_TYPE_ICONS[note.type] ?? <FileText className="w-3.5 h-3.5" />

  // Get a snippet from sections
  const snippet = Object.values(note.sections).find((s) => s && s.length > 0) ?? ''
  const truncatedSnippet = snippet.slice(0, 160) + (snippet.length > 160 ? '...' : '')

  return (
    <Link href={`/notes/${note.id}`} className="block group">
      <article
        className={cn(
          'bg-card border border-border rounded-lg transition-all duration-150 hover:border-primary/30 hover:shadow-sm',
          compact ? 'p-3' : 'p-4'
        )}
      >
        {/* Top row: type, ticker, tier badge */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            {/* Note type + ticker */}
            <div className="flex items-center gap-1.5 text-muted-foreground">
              {typeIcon}
              {note.ticker && (
                <span className="ticker text-xs font-semibold text-foreground bg-secondary px-1.5 py-0.5 rounded">
                  {note.ticker}
                </span>
              )}
              {note.category && (
                <span className="text-xs text-muted-foreground">
                  {CATEGORY_LABELS[note.category] ?? note.category}
                </span>
              )}
              {note.quarter && (
                <span className="text-xs text-muted-foreground font-mono">{note.quarter}</span>
              )}
              {note.year && (
                <span className="text-xs text-muted-foreground">{note.year}</span>
              )}
            </div>
          </div>

          {/* Tier badge */}
          {showTier && (
            <span
              className={cn(
                'flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded shrink-0',
                tierConfig.color
              )}
            >
              {tierConfig.icon}
              {tierConfig.label}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className={cn('font-semibold text-foreground leading-snug text-pretty', compact ? 'text-sm' : 'text-sm')}>
          {note.title}
        </h3>

        {/* Snippet */}
        {!compact && snippet && (
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {truncatedSnippet}
          </p>
        )}

        {/* Tags */}
        {!compact && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {note.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-sm"
              >
                {tag}
              </span>
            ))}
            {note.tags.length > 4 && (
              <span className="text-xs text-muted-foreground">+{note.tags.length - 4}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/60">
          <div className="flex items-center gap-2">
            {/* Author avatar */}
            <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center">
              <span className="text-[9px] font-semibold text-primary">
                {author?.initials ?? '?'}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {isOwn ? 'You' : author?.name ?? 'Unknown'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {note.readTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {note.readTime}m
              </span>
            )}
            <span>{formatDate(note.updatedAt)}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

// Restricted note card - shows title only with points CTA
interface RestrictedNoteCardProps {
  note: Note
}

export function RestrictedNoteCard({ note }: RestrictedNoteCardProps) {
  return (
    <article className="bg-card border border-border border-dashed rounded-lg p-4 opacity-80">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {note.ticker && (
            <span className="ticker text-xs font-semibold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
              {note.ticker}
            </span>
          )}
          {note.category && (
            <span className="text-xs text-muted-foreground">
              {CATEGORY_LABELS[note.category] ?? note.category}
            </span>
          )}
        </div>
        <span className="flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded text-amber-600 bg-amber-600/10 shrink-0">
          <Lock className="w-3 h-3" />
          Restricted
        </span>
      </div>

      {/* Blurred title */}
      <h3 className="text-sm font-semibold text-foreground leading-snug">{note.title}</h3>

      {/* Blurred snippet placeholder */}
      <div className="mt-2 space-y-1.5">
        <div className="h-2.5 bg-muted rounded blur-[2px] w-full" />
        <div className="h-2.5 bg-muted rounded blur-[2px] w-4/5" />
        <div className="h-2.5 bg-muted rounded blur-[2px] w-3/5" />
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/60">
        <span className="text-xs text-muted-foreground">
          {formatDate(note.updatedAt)} &middot; {note.readTime}m read
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-7 text-xs px-2">
            Request Access
          </Button>
          {note.accessCost && (
            <Button size="sm" className="h-7 text-xs px-2 bg-amber-500 hover:bg-amber-600 text-white">
              {note.accessCost} pts
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
