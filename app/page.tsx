import Link from 'next/link'
import { AppShell } from '@/components/layout/app-shell'
import { Header } from '@/components/layout/header'
import { NoteFeed } from '@/components/notes/note-feed'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  getCurrentUser,
  getTeamById,
  getAgentReports,
  getMyDraftNotes,
  getTeamNotes,
  getNotes,
  formatDate,
  CURRENT_USER_ID,
} from '@/lib/data'
import {
  Bot,
  TrendingUp,
  FileText,
  Users,
  Zap,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'

const STATUS_CONFIG = {
  completed: { icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />, label: 'Completed' },
  in_progress: { icon: <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />, label: 'Running' },
  pending: { icon: <Clock className="w-3.5 h-3.5 text-muted-foreground" />, label: 'Pending' },
  failed: { icon: <AlertCircle className="w-3.5 h-3.5 text-destructive" />, label: 'Failed' },
}

export default function HomePage() {
  const user = getCurrentUser()
  const team = getTeamById(user.teamId)
  const allReports = getAgentReports()
  const recentReports = allReports.filter((r) => r.authorId === CURRENT_USER_ID).slice(0, 3)
  const drafts = getMyDraftNotes(CURRENT_USER_ID)
  const teamNotes = getTeamNotes(CURRENT_USER_ID)
  const allNotes = getNotes()
  const recentActivity = allNotes
    .filter((n) => n.authorId !== CURRENT_USER_ID)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4)

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <AppShell>
      <Header />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-6">
          {/* Welcome header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-foreground">
              {greeting}, {user.name.split(' ')[0]}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {team?.name} &middot; {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">My Drafts</span>
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <p className="text-2xl font-semibold">{drafts.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">in progress</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Team Notes</span>
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <p className="text-2xl font-semibold">{teamNotes.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">from teammates</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Agent Reports</span>
                  <Bot className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <p className="text-2xl font-semibold">{allReports.filter((r) => r.authorId === CURRENT_USER_ID).length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">generated</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-accent">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-accent-foreground/70">Points Balance</span>
                  <Zap className="w-3.5 h-3.5 text-accent-foreground/70" />
                </div>
                <p className="text-2xl font-semibold text-accent-foreground font-mono">{user.points}</p>
                <p className="text-xs text-accent-foreground/60 mt-0.5">available to spend</p>
              </CardContent>
            </Card>
          </div>

          {/* Main 2-col layout */}
          <div className="grid grid-cols-3 gap-6">
            {/* Left: Note feed (2/3) */}
            <div className="col-span-2">
              <NoteFeed />
            </div>

            {/* Right: sidebar panels (1/3) */}
            <div className="space-y-4">
              {/* Recent agent reports */}
              <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Bot className="w-4 h-4 text-primary" />
                      Recent Reports
                    </CardTitle>
                    <Link href="/agent/history">
                      <Button variant="ghost" size="sm" className="h-6 text-xs px-2 gap-1">
                        All <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  {recentReports.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No reports yet.</p>
                  ) : (
                    recentReports.map((report) => {
                      const status = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.pending
                      return (
                        <Link
                          key={report.id}
                          href={`/agent/${report.id}`}
                          className="flex items-start gap-2 p-2 rounded-md hover:bg-secondary transition-colors"
                        >
                          <span className="mt-0.5 shrink-0">{status.icon}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug">
                              {report.taskDescription}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {report.completedAt ? formatDate(report.completedAt) : status.label}
                            </p>
                          </div>
                        </Link>
                      )
                    })
                  )}
                  <div className="pt-1">
                    <Link href="/agent">
                      <Button variant="outline" size="sm" className="w-full h-7 text-xs gap-1.5">
                        <Bot className="w-3 h-3" />
                        New Agent Report
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Recent team activity */}
              <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Team Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  {recentActivity.map((note) => (
                    <Link
                      key={note.id}
                      href={`/notes/${note.id}`}
                      className="flex items-start gap-2 p-2 rounded-md hover:bg-secondary transition-colors"
                    >
                      {note.ticker && (
                        <span className="ticker text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                          {note.ticker}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug">
                          {note.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(note.updatedAt)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              {/* Quick actions */}
              <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  <Link href="/notes/new">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-8 text-xs">
                      <FileText className="w-3.5 h-3.5" />
                      New Research Note
                    </Button>
                  </Link>
                  <Link href="/quick-note">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-8 text-xs">
                      <Zap className="w-3.5 h-3.5" />
                      Quick Insight
                    </Button>
                  </Link>
                  <Link href="/agent">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-8 text-xs">
                      <Bot className="w-3.5 h-3.5" />
                      Run Agent
                    </Button>
                  </Link>
                  <Link href="/access-requests">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-8 text-xs">
                      <Users className="w-3.5 h-3.5" />
                      Access Requests
                      <Badge variant="destructive" className="ml-auto text-[10px] h-4 px-1">2</Badge>
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  )
}
