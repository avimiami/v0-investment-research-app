'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search, Bell, Plus, Command } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getCurrentUser, getTeamById } from '@/lib/data'

interface HeaderProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const currentUser = getCurrentUser()
  const team = getTeamById(currentUser.teamId)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="h-14 border-b border-border bg-card shrink-0 flex items-center px-4 gap-4">
      {/* Title area */}
      <div className="flex-1 min-w-0">
        {title ? (
          <div>
            <h1 className="text-sm font-semibold text-foreground truncate">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
          </div>
        ) : (
          <form onSubmit={handleSearch} className="max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, tickers, tags..."
                className="pl-8 pr-16 h-8 text-sm bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-ring"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 text-xs text-muted-foreground">
                <Command className="w-3 h-3" />K
              </kbd>
            </div>
          </form>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {actions}

        {/* New note shortcut */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="h-8 gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />
              New
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-xs">Create</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/notes/new">Research Note</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/quick-note">Quick Insight</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/agent">Agent Report</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-8 w-8 relative" aria-label="Notifications">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-destructive rounded-full" />
        </Button>

        {/* Points display */}
        <div className="flex items-center gap-1.5 bg-accent rounded-md px-2 py-1">
          <span className="text-xs font-mono font-semibold text-accent-foreground">
            {currentUser.points}
          </span>
          <span className="text-xs text-muted-foreground">pts</span>
        </div>
      </div>
    </header>
  )
}
