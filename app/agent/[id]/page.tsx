'use client'

import { useState } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { use } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Loader2,
  Clock,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Users,
  Share2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  RotateCcw,
  Plus,
  ChevronDown,
  ChevronRight,
  Calendar,
  ExternalLink,
  Zap,
  User,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getAgentReportById,
  getUserById,
  formatDate,
  formatFullDate,
  CURRENT_USER_ID,
  type ReviewAction,
  type AgentReport,
  type Review,
  REVIEW_ACTION_LABELS,
} from '@/lib/data'

// ---- Status config ----
const STATUS_CONFIG = {
  completed:   { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-500/10', label: 'Completed' },
  in_progress: { icon: Loader2,      color: 'text-blue-500',  bg: 'bg-blue-500/10',  label: 'Running',   spin: true },
  pending:     { icon: Clock,        color: 'text-muted-foreground', bg: 'bg-secondary', label: 'Pending' },
  failed:      { icon: AlertCircle,  color: 'text-destructive', bg: 'bg-destructive/10', label: 'Failed' },
}

// ---- Visibility badge ----
const VIS_CONFIG = {
  private:    { icon: <EyeOff className="w-3 h-3" />, label: 'Private',    color: 'text-muted-foreground bg-secondary' },
  team:       { icon: <Users className="w-3 h-3" />,  label: 'Team',       color: 'text-teal-600 bg-teal-600/10' },
  shared:     { icon: <Share2 className="w-3 h-3" />, label: 'Shared',     color: 'text-green-600 bg-green-600/10' },
  restricted: { icon: <Lock className="w-3 h-3" />,   label: 'Restricted', color: 'text-amber-600 bg-amber-600/10' },
}

// ---- Review action config ----
const REVIEW_ACTION_CONFIG: Record<ReviewAction, { label: string; icon: React.ReactNode; color: string }> = {
  approved:              { label: 'Approved',              icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-green-600 bg-green-600/10 border-green-200 dark:border-green-900/40' },
  approved_with_comments:{ label: 'Approved with Comments',icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-teal-600 bg-teal-600/10 border-teal-200 dark:border-teal-900/40' },
  needs_revision:        { label: 'Needs Revision',        icon: <RotateCcw className="w-4 h-4" />,    color: 'text-amber-600 bg-amber-600/10 border-amber-200 dark:border-amber-900/40' },
  follow_up:             { label: 'Follow Up',             icon: <MessageSquare className="w-4 h-4" />, color: 'text-blue-600 bg-blue-600/10 border-blue-200 dark:border-blue-900/40' },
}

// ---- Section component ----
function ReportSection({
  heading,
  content,
  visibility,
}: {
  heading: string
  content: string
  visibility: string
}) {
  const [open, setOpen] = useState(true)
  const vis = VIS_CONFIG[visibility as keyof typeof VIS_CONFIG] ?? VIS_CONFIG.private

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-secondary/40 hover:bg-secondary/70 transition-colors text-left"
      >
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{heading}</span>
        </div>
        <span className={cn('flex items-center gap-1 text-xs px-1.5 py-0.5 rounded shrink-0', vis.color)}>
          {vis.icon}
          {vis.label}
        </span>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {open && (
        <div className="px-5 py-4">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      )}
    </div>
  )
}

// ---- Review entry ----
function ReviewEntry({ review }: { review: Review }) {
  const author = getUserById(review.userId)
  const isOwn = review.userId === CURRENT_USER_ID
  const actionConfig = REVIEW_ACTION_CONFIG[review.action]

  return (
    <div className="p-4 bg-card border border-border rounded-lg space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-primary">{author?.initials ?? '?'}</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">{isOwn ? 'You' : author?.name ?? 'Unknown'}</p>
            <p className="text-[11px] text-muted-foreground">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <span className={cn('flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md border', actionConfig.color)}>
          {actionConfig.icon}
          {actionConfig.label}
        </span>
      </div>

      {review.comment && (
        <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>
      )}

      {review.followUpItems.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Follow-up items</p>
          <ul className="space-y-1">
            {review.followUpItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ---- Main page (client) ----
export default function AgentReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const report = getAgentReportById(id)
  if (!report) notFound()

  const isOwn = report.authorId === CURRENT_USER_ID
  const author = getUserById(report.authorId)
  const status = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.pending
  const StatusIcon = status.icon

  // Approval form state
  const [reviewAction, setReviewAction] = useState<ReviewAction>('approved')
  const [reviewComment, setReviewComment] = useState('')
  const [followUpInput, setFollowUpInput] = useState('')
  const [followUpItems, setFollowUpItems] = useState<string[]>([])
  const [reviews, setReviews] = useState<Review[]>(report.reviews)
  const [researchNotes, setResearchNotes] = useState(report.researchNotes)
  const [newNote, setNewNote] = useState('')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  const addFollowUp = () => {
    if (followUpInput.trim()) {
      setFollowUpItems((prev) => [...prev, followUpInput.trim()])
      setFollowUpInput('')
    }
  }

  const submitReview = () => {
    const newReview: Review = {
      id: `review-${Date.now()}`,
      userId: CURRENT_USER_ID,
      action: reviewAction,
      comment: reviewComment,
      followUpItems,
      createdAt: new Date().toISOString(),
    }
    setReviews((prev) => [...prev, newReview])
    setReviewComment('')
    setFollowUpItems([])
    setReviewSubmitted(true)
  }

  const addResearchNote = () => {
    if (!newNote.trim()) return
    setResearchNotes((prev) => [
      ...prev,
      { id: `rn-${Date.now()}`, userId: CURRENT_USER_ID, note: newNote.trim(), createdAt: new Date().toISOString() },
    ])
    setNewNote('')
  }

  return (
    <AppShell>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/agent/history">
              <Button variant="ghost" size="sm" className="h-8 px-2 gap-1.5 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Agent Report</span>
              {report.ticker && (
                <span className="ticker text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {report.ticker}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded', status.bg, status.color)}>
              <StatusIcon className={cn('w-3.5 h-3.5', (status as any).spin && 'animate-spin')} />
              {status.label}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-6 py-6">
            <div className="flex gap-6">

              {/* Main content */}
              <div className="flex-1 min-w-0 space-y-6">

                {/* Report header */}
                {report.report ? (
                  <>
                    <div>
                      <h1 className="text-xl font-bold text-foreground leading-snug">{report.report.title}</h1>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-primary">{author?.initials ?? '?'}</span>
                          </div>
                          {isOwn ? 'You' : author?.name}
                        </span>
                        <span>{report.model.split('/').pop()}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {report.completedAt ? formatFullDate(report.completedAt) : 'In progress'}
                        </span>
                      </div>
                    </div>

                    {/* Summary box */}
                    <div className="p-4 bg-secondary/40 border border-border rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Summary</span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{report.report.summary}</p>
                    </div>

                    {/* Report sections */}
                    <div className="space-y-3">
                      {report.report.sections.map((section, i) => (
                        <ReportSection
                          key={i}
                          heading={section.heading}
                          content={section.content}
                          visibility={section.visibility}
                        />
                      ))}
                    </div>

                    {/* Sources */}
                    {report.report.sources.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sources</h3>
                        </div>
                        <ul className="space-y-1.5">
                          {report.report.sources.map((src, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <span className="text-[9px] font-mono mt-0.5">[{i + 1}]</span>
                              {src}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Separator />

                    {/* ---- Review history ---- */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                        <h2 className="text-sm font-semibold text-foreground">Reviews</h2>
                        <span className="text-xs text-muted-foreground">({reviews.length})</span>
                      </div>

                      <div className="space-y-3 mb-5">
                        {reviews.length === 0 && (
                          <p className="text-xs text-muted-foreground italic">No reviews yet.</p>
                        )}
                        {reviews.map((review) => (
                          <ReviewEntry key={review.id} review={review} />
                        ))}
                      </div>

                      {/* Add review form */}
                      {!reviewSubmitted ? (
                        <div className="border border-border rounded-xl overflow-hidden bg-card">
                          <div className="px-4 py-3 border-b border-border bg-secondary/30">
                            <h3 className="text-sm font-semibold text-foreground">Add Your Review</h3>
                          </div>
                          <div className="p-4 space-y-4">
                            {/* Action selector */}
                            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                              {(Object.entries(REVIEW_ACTION_CONFIG) as [ReviewAction, typeof REVIEW_ACTION_CONFIG[ReviewAction]][]).map(([key, cfg]) => (
                                <button
                                  key={key}
                                  onClick={() => setReviewAction(key)}
                                  className={cn(
                                    'flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all text-left',
                                    reviewAction === key
                                      ? cn(cfg.color, 'ring-1 ring-offset-0')
                                      : 'border-border text-muted-foreground hover:bg-secondary'
                                  )}
                                >
                                  {cfg.icon}
                                  {cfg.label}
                                </button>
                              ))}
                            </div>

                            {/* Comment */}
                            <Textarea
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              placeholder="Add your review comments, caveats, or context..."
                              className="min-h-24 text-sm resize-none bg-background leading-relaxed"
                            />

                            {/* Follow-up items */}
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-2">Follow-up items (optional)</p>
                              <div className="flex gap-2 mb-2">
                                <input
                                  value={followUpInput}
                                  onChange={(e) => setFollowUpInput(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFollowUp() } }}
                                  placeholder="Add follow-up item and press Enter..."
                                  className="flex-1 text-xs h-8 px-3 bg-secondary rounded-md border border-border outline-none focus:ring-1 focus:ring-ring"
                                />
                                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={addFollowUp}>
                                  Add
                                </Button>
                              </div>
                              {followUpItems.length > 0 && (
                                <ul className="space-y-1">
                                  {followUpItems.map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-xs">
                                      <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                                      {item}
                                      <button
                                        onClick={() => setFollowUpItems((prev) => prev.filter((_, j) => j !== i))}
                                        className="ml-auto text-muted-foreground hover:text-destructive text-xs"
                                      >
                                        Remove
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            <Button
                              className="gap-2 text-sm"
                              onClick={submitReview}
                              disabled={!reviewComment.trim()}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Submit Review
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-green-500/10 border border-green-200 dark:border-green-900/40 rounded-xl text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          Review submitted. You can add another review at any time.
                          <button onClick={() => setReviewSubmitted(false)} className="ml-auto text-xs underline">Add another</button>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* ---- Research notes ---- */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <h2 className="text-sm font-semibold text-foreground">Research Notes</h2>
                        <span className="text-xs text-muted-foreground">Private annotations for future reference</span>
                      </div>

                      <div className="space-y-3 mb-4">
                        {researchNotes.length === 0 && (
                          <p className="text-xs text-muted-foreground italic">No notes yet.</p>
                        )}
                        {researchNotes.map((rn) => {
                          const noteAuthor = getUserById(rn.userId)
                          return (
                            <div key={rn.id} className="flex gap-3">
                              <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-[9px] font-bold text-primary">{noteAuthor?.initials ?? '?'}</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-xs font-semibold text-foreground">
                                    {rn.userId === CURRENT_USER_ID ? 'You' : noteAuthor?.name}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground">{formatDate(rn.createdAt)}</span>
                                </div>
                                <p className="text-xs text-foreground leading-relaxed">{rn.note}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Add note */}
                      <div className="border border-border rounded-lg overflow-hidden bg-card">
                        <Textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Add a private research note, follow-up reminder, or future reference..."
                          className="min-h-20 text-sm resize-none border-0 focus-visible:ring-0 rounded-none bg-transparent leading-relaxed"
                          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); addResearchNote() } }}
                        />
                        <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-secondary/30">
                          <span className="text-[11px] text-muted-foreground">Cmd+Enter to save</span>
                          <Button size="sm" className="h-7 text-xs gap-1.5 px-3" onClick={addResearchNote} disabled={!newNote.trim()}>
                            <Plus className="w-3 h-3" />
                            Add Note
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* In-progress / no report yet */
                  <div className="text-center py-20">
                    <div className={cn('w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4', status.bg)}>
                      <StatusIcon className={cn('w-7 h-7', status.color, (status as any).spin && 'animate-spin')} />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {report.status === 'in_progress' ? 'Report generating...' : 'Report pending'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{report.taskDescription}</p>
                    {report.status === 'in_progress' && (
                      <p className="text-xs text-muted-foreground mt-3">This page will update when the report is ready.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Right sidebar */}
              <div className="w-52 shrink-0 space-y-4">
                <div className="border border-border rounded-lg p-4 bg-card space-y-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Report Info</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className={cn('font-medium', status.color)}>{status.label}</span>
                    </div>
                    {report.ticker && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ticker</span>
                        <span className="ticker font-bold text-primary">{report.ticker}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model</span>
                      <span className="text-foreground font-medium text-right max-w-28 truncate">{report.model.split('/').pop()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Author</span>
                      <span className="text-foreground font-medium">{isOwn ? 'You' : author?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span className="text-foreground">{formatDate(report.createdAt)}</span>
                    </div>
                    {report.completedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Completed</span>
                        <span className="text-foreground">{formatDate(report.completedAt)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reviews</span>
                      <span className="font-mono">{reviews.length}</span>
                    </div>
                  </div>
                </div>

                {/* Visibility per section */}
                {report.report && (
                  <div className="border border-border rounded-lg p-4 bg-card space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Visibility</h3>
                    {Object.entries(report.visibility).map(([section, vis]) => {
                      const v = VIS_CONFIG[vis as keyof typeof VIS_CONFIG] ?? VIS_CONFIG.private
                      return (
                        <div key={section} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground capitalize">{section}</span>
                          <span className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded', v.color)}>
                            {v.icon}
                            {v.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                <Link href="/agent">
                  <Button variant="outline" size="sm" className="w-full gap-2 text-xs h-8 justify-start">
                    <Bot className="w-3.5 h-3.5" />
                    New Report
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
