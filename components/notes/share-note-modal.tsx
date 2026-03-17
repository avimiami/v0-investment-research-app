'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getTeams, getNoteById, CURRENT_USER_ID, type Note } from '@/lib/data'
import {
  Share2,
  Users,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const VISIBILITY_OPTS = [
  {
    value: 'private' as const,
    label: 'Private',
    icon: EyeOff,
    desc: 'Only you can see this note',
    color: 'border-border hover:border-muted-foreground/40',
    activeColor: 'border-foreground bg-secondary ring-1 ring-foreground/20',
  },
  {
    value: 'team' as const,
    label: 'My Team',
    icon: Users,
    desc: 'Everyone on your team can access',
    color: 'border-border hover:border-teal-300',
    activeColor: 'border-teal-500 bg-teal-50/60 ring-1 ring-teal-300/40 dark:bg-teal-950/30 dark:border-teal-600',
  },
  {
    value: 'shared' as const,
    label: 'Shared Teams',
    icon: Share2,
    desc: 'Select specific teams to share with',
    color: 'border-border hover:border-green-300',
    activeColor: 'border-green-500 bg-green-50/60 ring-1 ring-green-300/40 dark:bg-green-950/30 dark:border-green-600',
  },
  {
    value: 'restricted' as const,
    label: 'Restricted',
    icon: Lock,
    desc: 'Visible as title-only; others can request or pay points',
    color: 'border-border hover:border-amber-300',
    activeColor: 'border-amber-500 bg-amber-50/60 ring-1 ring-amber-300/40 dark:bg-amber-950/30 dark:border-amber-600',
  },
]

interface ShareNoteModalProps {
  note: Note
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareNoteModal({ note, open, onOpenChange }: ShareNoteModalProps) {
  const teams = getTeams().filter((t) => t.id !== 'team-alpha') // exclude own team
  const [visibility, setVisibility] = useState(note.visibility)
  const [selectedTeams, setSelectedTeams] = useState<string[]>(note.sharedWith ?? [])
  const [accessCost, setAccessCost] = useState<number>(note.accessCost ?? 25)
  const [saved, setSaved] = useState(false)

  const toggleTeam = (teamId: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    )
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onOpenChange(false)
    }, 1200)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Share2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold text-foreground">Share Note</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{note.title}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-5 py-5 space-y-5">
          {saved ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-semibold text-foreground">Settings saved</p>
            </div>
          ) : (
            <>
              {/* Visibility picker */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Visibility
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {VISIBILITY_OPTS.map((opt) => {
                    const Icon = opt.icon
                    const isActive = visibility === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setVisibility(opt.value)}
                        className={cn(
                          'p-3 rounded-xl border text-left transition-all',
                          isActive ? opt.activeColor : opt.color
                        )}
                      >
                        <Icon className={cn('w-4 h-4 mb-1.5', isActive ? 'text-foreground' : 'text-muted-foreground')} />
                        <p className="text-xs font-semibold text-foreground">{opt.label}</p>
                        <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{opt.desc}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Team selector — only when 'shared' */}
              {visibility === 'shared' && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Select Teams
                  </p>
                  <div className="space-y-2">
                    {teams.map((team) => {
                      const isSelected = selectedTeams.includes(team.id)
                      return (
                        <button
                          key={team.id}
                          onClick={() => toggleTeam(team.id)}
                          className={cn(
                            'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                            isSelected
                              ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                              : 'border-border hover:border-primary/30'
                          )}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${team.color}20` }}
                          >
                            <Building2 className="w-4 h-4" style={{ color: team.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground">{team.name}</p>
                            <p className="text-[11px] text-muted-foreground">{team.description}</p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Access cost — only when 'restricted' */}
              {visibility === 'restricted' && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Points Cost to Unlock
                  </p>
                  <div className="flex items-center gap-3 p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">
                        Other users spend this many points to unlock full access
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={5}
                          max={500}
                          step={5}
                          value={accessCost}
                          onChange={(e) => setAccessCost(Number(e.target.value))}
                          className="w-20 h-8 px-2 text-sm font-mono font-semibold bg-background border border-border rounded-md outline-none focus:ring-1 focus:ring-ring"
                        />
                        <span className="text-xs text-muted-foreground">points</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-center gap-2 justify-end">
                <Button variant="outline" size="sm" className="h-8 text-sm" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button size="sm" className="h-8 text-sm gap-1.5" onClick={handleSave}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Save Settings
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
