import Link from 'next/link'
import { AppShell } from '@/components/layout/app-shell'
import { Header } from '@/components/layout/header'
import { getAgentReports, getUserById, formatDate, CURRENT_USER_ID } from '@/lib/data'
import { Button } from '@/components/ui/button'
import {
  Bot,
  CheckCircle2,
  Loader2,
  Clock,
  AlertCircle,
  Plus,
  ChevronRight,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  completed:   { icon: CheckCircle2, color: 'text-green-600',         bg: 'bg-green-500/10',  label: 'Completed' },
  in_progress: { icon: Loader2,      color: 'text-blue-600',           bg: 'bg-blue-500/10',   label: 'Running',   spin: true },
  pending:     { icon: Clock,        color: 'text-muted-foreground',   bg: 'bg-secondary',     label: 'Pending' },
  failed:      { icon: AlertCircle,  color: 'text-destructive',        bg: 'bg-destructive/10', label: 'Failed' },
}

export default function AgentHistoryPage() {
  const reports = getAgentReports().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const myReports     = reports.filter((r) => r.authorId === CURRENT_USER_ID)
  const othersReports = reports.filter((r) => r.authorId !== CURRENT_USER_ID)

  return (
    <AppShell>
      <Header
        title="Agent History"
        subtitle={`${reports.length} total reports`}
        actions={
          <Link href="/agent">
            <Button size="sm" className="h-8 text-xs gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              New Report
            </Button>
          </Link>
        }
      />
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-8">

          {/* My reports */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">My Reports</h2>
            <div className="space-y-3">
              {myReports.map((report) => (
                <ReportRow key={report.id} report={report} />
              ))}
              {myReports.length === 0 && (
                <p className="text-sm text-muted-foreground py-4">No reports yet.</p>
              )}
            </div>
          </div>

          {/* Others' reports visible to me */}
          {othersReports.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Team Reports</h2>
              <div className="space-y-3">
                {othersReports.map((report) => (
                  <ReportRow key={report.id} report={report} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </AppShell>
  )
}

function ReportRow({ report }: { report: ReturnType<typeof getAgentReports>[0] }) {
  const status = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.pending
  const StatusIcon = status.icon
  const author = getUserById(report.authorId)
  const isOwn = report.authorId === CURRENT_USER_ID
  const reviewCount = report.reviews.length

  return (
    <Link href={`/agent/${report.id}`}>
      <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group">
        {/* Status icon */}
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5', status.bg)}>
          <StatusIcon className={cn('w-4 h-4', status.color, (status as any).spin && 'animate-spin')} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Report title */}
          <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {report.report?.title ?? report.taskDescription}
          </p>
          {report.report && report.taskDescription !== report.report.title && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{report.taskDescription}</p>
          )}

          <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-muted-foreground">
            {/* Author */}
            <span className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center">
                <span className="text-[8px] font-bold text-primary">{author?.initials ?? '?'}</span>
              </div>
              {isOwn ? 'You' : author?.name}
            </span>

            {/* Ticker */}
            {report.ticker && (
              <span className="ticker text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                {report.ticker}
              </span>
            )}

            {/* Model */}
            <span className="text-muted-foreground/70 truncate">
              {report.model.split('/').pop()}
            </span>

            {/* Time */}
            <span>{formatDate(report.completedAt ?? report.createdAt)}</span>

            {/* Reviews */}
            {reviewCount > 0 && (
              <span className="flex items-center gap-1 text-primary">
                <CheckCircle2 className="w-3 h-3" />
                {reviewCount} review{reviewCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded', status.bg, status.color)}>
            {status.label}
          </span>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </Link>
  )
}
