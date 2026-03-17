'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  TrendingUp,
  Building2,
  Globe,
  Sparkles,
  Bot,
  History,
  Zap,
  Search,
  Settings,
  ChevronDown,
  ChevronRight,
  Lock,
  FileText,
  Users,
  Share2,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCurrentUser, getTeamById } from '@/lib/data'

const TICKERS = ['AAPL', 'NVDA', 'MSFT', 'AMZN', 'META']

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: string | number
}

interface NavSection {
  label: string
  items: NavItem[]
  collapsible?: boolean
  defaultOpen?: boolean
}

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname()
  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors relative group',
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
          : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
      )}
    >
      <span className="shrink-0 w-4 h-4">{item.icon}</span>
      {!collapsed && <span className="truncate flex-1">{item.label}</span>}
      {!collapsed && item.badge !== undefined && (
        <span className="ml-auto text-xs bg-sidebar-accent text-sidebar-accent-foreground rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center leading-tight">
          {item.badge}
        </span>
      )}
    </Link>
  )
}

function CollapsibleSection({
  section,
  collapsed: sidebarCollapsed,
}: {
  section: NavSection
  collapsed: boolean
}) {
  const [open, setOpen] = useState(section.defaultOpen ?? true)
  const pathname = usePathname()

  const isAnyActive = section.items.some(
    (item) => pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
  )

  return (
    <div>
      {!sidebarCollapsed && section.collapsible && (
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40 hover:text-sidebar-foreground/60 transition-colors"
        >
          {open ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
          {section.label}
        </button>
      )}
      {!sidebarCollapsed && !section.collapsible && (
        <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          {section.label}
        </p>
      )}

      {(open || !section.collapsible || sidebarCollapsed) && (
        <div className="space-y-0.5">
          {section.items.map((item) => (
            <NavLink key={item.href} item={item} collapsed={sidebarCollapsed} />
          ))}
        </div>
      )}
    </div>
  )
}

function TickerTree({ collapsed }: { collapsed: boolean }) {
  const [open, setOpen] = useState(true)
  const pathname = usePathname()

  if (collapsed) {
    return (
      <div className="space-y-0.5">
        <Link
          href="/research/stocks"
          title="Stocks"
          className={cn(
            'flex items-center justify-center px-3 py-2 rounded-md text-sm transition-colors',
            pathname.startsWith('/research/stocks')
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
          )}
        >
          <TrendingUp className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
      >
        <TrendingUp className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left">Stocks</span>
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>

      {open && (
        <div className="ml-7 mt-0.5 space-y-0.5">
          {TICKERS.map((ticker) => {
            const isActive = pathname === `/research/stocks/${ticker}`
            return (
              <Link
                key={ticker}
                href={`/research/stocks/${ticker}`}
                className={cn(
                  'block px-3 py-1.5 rounded-md text-xs font-mono tracking-wider transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                    : 'text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                {ticker}
              </Link>
            )
          })}
          <Link
            href="/research/stocks"
            className="block px-3 py-1.5 rounded-md text-xs text-sidebar-foreground/40 hover:text-sidebar-foreground/60 hover:bg-sidebar-accent/30 transition-colors"
          >
            View all →
          </Link>
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const currentUser = getCurrentUser()
  const team = getTeamById(currentUser.teamId)

  const mainNav: NavItem[] = [
    { label: 'Home', href: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Search', href: '/search', icon: <Search className="w-4 h-4" /> },
    { label: 'Quick Note', href: '/quick-note', icon: <Zap className="w-4 h-4" /> },
  ]

  const researchNav: NavSection = {
    label: 'Research',
    collapsible: true,
    defaultOpen: true,
    items: [
      { label: 'Industries', href: '/research/industries', icon: <Building2 className="w-4 h-4" /> },
      { label: 'Macro', href: '/research/macro', icon: <Globe className="w-4 h-4" /> },
      { label: 'Themes', href: '/research/themes', icon: <Sparkles className="w-4 h-4" /> },
    ],
  }

  const agentNav: NavSection = {
    label: 'Agent',
    collapsible: false,
    items: [
      { label: 'New Report', href: '/agent', icon: <Bot className="w-4 h-4" /> },
      { label: 'Report History', href: '/agent/history', icon: <History className="w-4 h-4" /> },
    ],
  }

  const workspaceNav: NavSection = {
    label: 'Workspace',
    collapsible: false,
    items: [
      { label: 'Access Requests', href: '/access-requests', icon: <Lock className="w-4 h-4" />, badge: 2 },
      { label: 'Settings', href: '/settings', icon: <Settings className="w-4 h-4" /> },
    ],
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-200',
        collapsed ? 'w-14' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center border-b border-sidebar-border shrink-0', collapsed ? 'justify-center p-4' : 'px-4 py-4 gap-3')}>
        <div className="w-7 h-7 rounded bg-sidebar-primary flex items-center justify-center shrink-0">
          <BarChart3 className="w-4 h-4 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-sidebar-foreground font-semibold text-base tracking-tight">
            Vestry
          </span>
        )}
      </div>

      {/* Main scroll area */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4 px-2">
        {/* Main nav */}
        <div className="space-y-0.5">
          {mainNav.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} />
          ))}
        </div>

        {/* Stocks / Ticker tree */}
        <div>
          {!collapsed && (
            <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
              Research
            </p>
          )}
          <div className="space-y-0.5">
            <TickerTree collapsed={collapsed} />
            {researchNav.items.map((item) => (
              <NavLink key={item.href} item={item} collapsed={collapsed} />
            ))}
          </div>
        </div>

        {/* Agent */}
        <CollapsibleSection section={agentNav} collapsed={collapsed} />

        {/* Workspace */}
        <CollapsibleSection section={workspaceNav} collapsed={collapsed} />
      </div>

      {/* User / team footer */}
      <div className={cn('shrink-0 border-t border-sidebar-border p-3', collapsed ? 'flex justify-center' : '')}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-xs font-semibold text-sidebar-accent-foreground">
              {currentUser.initials}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-sidebar-accent-foreground">
                {currentUser.initials}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{currentUser.name}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">{team?.name}</p>
            </div>
            <div className="flex items-center gap-1 bg-sidebar-accent/50 rounded px-1.5 py-0.5">
              <span className="text-xs font-mono font-semibold text-yellow-400">
                {currentUser.points}
              </span>
              <span className="text-xs text-sidebar-foreground/40">pts</span>
            </div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="shrink-0 w-full py-2 text-sidebar-foreground/30 hover:text-sidebar-foreground/60 hover:bg-sidebar-accent/30 transition-colors text-xs flex items-center justify-center border-t border-sidebar-border/50"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 rotate-90" />}
      </button>
    </aside>
  )
}
