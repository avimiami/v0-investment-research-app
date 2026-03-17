'use client'

import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle2,
  Clock,
  Lock,
  Zap,
  Users,
  Building2,
  XCircle,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getRestrictedNotes,
  getTeams,
  getUserById,
  getCurrentUser,
  formatDate,
  CURRENT_USER_ID,
  type Note,
} from '@/lib/data'

type RequestStatus = 'pending' | 'approved' | 'denied'

interface AccessRequest {
  id: string
  noteId: string
  noteTitle: string
  noteTicker?: string
  requesterUserId: string
  status: RequestStatus
  requestedAt: string
  type: 'request' | 'points'
  pointsOffered?: number
}

// Mock pending requests — in a real app this would come from a database
const MOCK_INCOMING: AccessRequest[] = [
  {
    id: 'req-1',
    noteId: 'note-3',
    noteTitle: 'NVDA Deep Dive: AI Infrastructure Supercycle',
    noteTicker: 'NVDA',
    requesterUserId: 'user-4',
    status: 'pending',
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    type: 'request',
  },
  {
    id: 'req-2',
    noteId: 'note-5',
    noteTitle: 'AI Infrastructure Theme: Portfolio Positioning',
    requesterUserId: 'user-5',
    status: 'pending',
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 27).toISOString(),
    type: 'points',
    pointsOffered: 50,
  },
]

const MOCK_OUTGOING: AccessRequest[] = [
  {
    id: 'req-3',
    noteId: 'note-9',
    noteTitle: 'Credit Cycle Positioning: HY vs IG Relative Value',
    requesterUserId: CURRENT_USER_ID,
    status: 'pending',
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    type: 'request',
  },
  {
    id: 'req-4',
    noteId: 'note-10',
    noteTitle: 'Quant Factor Rotation: Momentum vs Value Regime',
    requesterUserId: CURRENT_USER_ID,
    status: 'approved',
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    type: 'points',
    pointsOffered: 25,
  },
  {
    id: 'req-5',
    noteId: 'note-11',
    noteTitle: 'FX Volatility Regime Change: EM Currency Risks',
    requesterUserId: CURRENT_USER_ID,
    status: 'denied',
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    type: 'request',
  },
]

const STATUS_CONFIG: Record<RequestStatus, { label: string; icon: React.ReactNode; color: string }> = {
  pending:  { label: 'Pending',  icon: <Clock className="w-3.5 h-3.5" />,       color: 'text-amber-600 bg-amber-500/10 border-amber-200 dark:border-amber-900/40' },
  approved: { label: 'Approved', icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'text-green-600 bg-green-500/10 border-green-200 dark:border-green-900/40' },
  denied:   { label: 'Denied',   icon: <XCircle className="w-3.5 h-3.5" />,      color: 'text-destructive bg-destructive/10 border-destructive/20' },
}

function RequestRow({
  req,
  incoming,
  onApprove,
  onDeny,
}: {
  req: AccessRequest
  incoming: boolean
  onApprove?: (id: string) => void
  onDeny?: (id: string) => void
}) {
  const requester = getUserById(req.requesterUserId)
  const status = STATUS_CONFIG[req.status]

  return (
    <div className="p-4 bg-card border border-border rounded-xl space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {req.noteTicker && (
              <span className="font-mono text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                {req.noteTicker}
              </span>
            )}
            {req.type === 'points' && req.pointsOffered && (
              <span className="flex items-center gap-1 text-[10px] font-semibold bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded">
                <Zap className="w-2.5 h-2.5" />
                {req.pointsOffered} pts
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-foreground leading-snug">{req.noteTitle}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {incoming ? (
              <>
                <span className="font-medium text-foreground">{requester?.name ?? 'Unknown'}</span>
                {' '}{req.type === 'points' ? 'wants to pay' : 'requested access'} &middot; {formatDate(req.requestedAt)}
              </>
            ) : (
              <>Requested {formatDate(req.requestedAt)}</>
            )}
          </p>
        </div>
        <span className={cn('flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md border shrink-0', status.color)}>
          {status.icon}
          {status.label}
        </span>
      </div>

      {incoming && req.status === 'pending' && (
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            className="h-7 text-xs gap-1.5 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => onApprove?.(req.id)}
          >
            <CheckCircle2 className="w-3 h-3" />
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => onDeny?.(req.id)}
          >
            <XCircle className="w-3 h-3" />
            Deny
          </Button>
          {requester && (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center">
                <span className="text-[9px] font-bold text-primary">{requester.initials}</span>
              </div>
              {requester.name} &middot; {requester.role}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default function AccessRequestsPage() {
  const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming')
  const [incoming, setIncoming] = useState<AccessRequest[]>(MOCK_INCOMING)
  const [outgoing] = useState<AccessRequest[]>(MOCK_OUTGOING)

  const pendingCount = incoming.filter((r) => r.status === 'pending').length

  const handleApprove = (id: string) =>
    setIncoming((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r)))

  const handleDeny = (id: string) =>
    setIncoming((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'denied' } : r)))

  const displayed = tab === 'incoming' ? incoming : outgoing

  return (
    <AppShell>
      <Header
        title="Access Requests"
        subtitle="Manage who can access your restricted research"
      />
      <main className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-6 py-6">

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-secondary/60 p-1 rounded-lg mb-6 w-fit">
            <button
              onClick={() => setTab('incoming')}
              className={cn(
                'flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                tab === 'incoming'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Users className="w-3.5 h-3.5" />
              Incoming
              {pendingCount > 0 && (
                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('outgoing')}
              className={cn(
                'flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                tab === 'outgoing'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <ChevronRight className="w-3.5 h-3.5" />
              My Requests
            </button>
          </div>

          {/* Summary strip */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {(['pending', 'approved', 'denied'] as RequestStatus[]).map((s) => {
              const count = displayed.filter((r) => r.status === s).length
              const cfg = STATUS_CONFIG[s]
              return (
                <div key={s} className={cn('flex items-center gap-2 p-3 rounded-lg border', cfg.color)}>
                  {cfg.icon}
                  <div>
                    <p className="text-xs font-semibold">{count}</p>
                    <p className="text-[11px] opacity-80">{cfg.label}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Request list */}
          {displayed.length === 0 ? (
            <div className="text-center py-16">
              <Lock className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">No requests</p>
              <p className="text-xs text-muted-foreground mt-1">
                {tab === 'incoming'
                  ? 'When others request access to your restricted notes, they will appear here.'
                  : 'Notes you have requested access to will appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayed.map((req) => (
                <RequestRow
                  key={req.id}
                  req={req}
                  incoming={tab === 'incoming'}
                  onApprove={handleApprove}
                  onDeny={handleDeny}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </AppShell>
  )
}
