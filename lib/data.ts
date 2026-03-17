import usersData from './data/users.json'
import teamsData from './data/teams.json'
import notesData from './data/notes.json'
import agentReportsData from './data/agent-reports.json'
import tickersData from './data/tickers.json'
import industriesData from './data/industries.json'
import themesData from './data/themes.json'

// --- Types ---

export type UserRole = 'analyst' | 'Senior Analyst' | 'Portfolio Manager' | 'Macro Strategist' | 'Quant Analyst'

export interface User {
  id: string
  name: string
  email: string
  initials: string
  teamId: string
  role: string
  points: number
  avatar: string | null
}

export interface Team {
  id: string
  name: string
  description: string
  color: string
  memberIds: string[]
  noteCount: number
}

export type NoteType = 'stock' | 'industry' | 'macro' | 'theme' | 'quick'
export type NoteStatus = 'draft' | 'published'
export type NoteVisibility = 'private' | 'team' | 'shared' | 'restricted'
export type NoteCategory = 'quarterly' | 'conference' | 'management_meeting' | 'earnings' | 'custom'

export interface NoteSections {
  managementReview?: string
  businessDescription?: string
  competitiveDynamics?: string
  keyInsights?: string
}

export interface Note {
  id: string
  type: NoteType
  ticker?: string
  year?: number
  quarter?: string
  category?: NoteCategory
  industryId?: string
  themeId?: string
  title: string
  authorId: string
  status: NoteStatus
  visibility: NoteVisibility
  accessCost?: number
  sharedWith: string[]
  sections: NoteSections
  tags: string[]
  relatedTickers?: string[]
  relatedThemes?: string[]
  updatedAt: string
  createdAt: string
  wordCount?: number
  readTime?: number
}

export type ReviewAction = 'approved' | 'approved_with_comments' | 'needs_revision' | 'follow_up'

export interface Review {
  id: string
  userId: string
  action: ReviewAction
  comment: string
  followUpItems: string[]
  createdAt: string
}

export interface ResearchNote {
  id: string
  userId: string
  note: string
  createdAt: string
}

export interface ReportSection {
  heading: string
  content: string
  visibility: NoteVisibility
}

export interface AgentReport {
  id: string
  taskDescription: string
  authorId: string
  ticker: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  createdAt: string
  completedAt: string | null
  model: string
  visibility: Record<string, NoteVisibility>
  report: {
    title: string
    summary: string
    sections: ReportSection[]
    sources: string[]
  } | null
  reviews: Review[]
  researchNotes: ResearchNote[]
}

export interface Ticker {
  id: string
  name: string
  sector: string
  industryId: string
  description: string
  noteCount: number
  lastUpdated: string | null
}

export interface Industry {
  id: string
  name: string
  sector: string
  noteCount: number
  tickerIds: string[]
  description: string
  lastUpdated: string | null
}

export type ThemeConviction = 'high' | 'medium' | 'low'
export type ThemeStatus = 'active' | 'developing' | 'closed'

export interface Theme {
  id: string
  name: string
  shortName: string
  description: string
  status: ThemeStatus
  conviction: ThemeConviction
  noteCount: number
  relatedTickers: string[]
  relatedThemes: string[]
  tags: string[]
  lastUpdated: string | null
}

// --- Current user (mock auth) ---
export const CURRENT_USER_ID = 'user-1'

// --- Data accessors ---

export const getUsers = (): User[] => usersData as User[]
export const getTeams = (): Team[] => teamsData as Team[]
export const getNotes = (): Note[] => notesData as Note[]
export const getAgentReports = (): AgentReport[] => agentReportsData as AgentReport[]
export const getTickers = (): Ticker[] => tickersData as Ticker[]
export const getIndustries = (): Industry[] => industriesData as Industry[]
export const getThemes = (): Theme[] => themesData as Theme[]

export const getCurrentUser = (): User => {
  const user = usersData.find((u) => u.id === CURRENT_USER_ID)
  if (!user) throw new Error('Current user not found')
  return user as User
}

export const getUserById = (id: string): User | undefined =>
  usersData.find((u) => u.id === id) as User | undefined

export const getTeamById = (id: string): Team | undefined =>
  teamsData.find((t) => t.id === id) as Team | undefined

export const getNoteById = (id: string): Note | undefined =>
  notesData.find((n) => n.id === id) as Note | undefined

export const getAgentReportById = (id: string): AgentReport | undefined =>
  agentReportsData.find((r) => r.id === id) as AgentReport | undefined

export const getTickerById = (id: string): Ticker | undefined =>
  tickersData.find((t) => t.id === id) as Ticker | undefined

export const getIndustryById = (id: string): Industry | undefined =>
  industriesData.find((i) => i.id === id) as Industry | undefined

export const getThemeById = (id: string): Theme | undefined =>
  themesData.find((t) => t.id === id) as Theme | undefined

// --- Note filtering helpers ---

export const getMyDraftNotes = (userId: string = CURRENT_USER_ID): Note[] =>
  notesData.filter((n) => n.authorId === userId && n.status === 'draft') as Note[]

export const getMyPublishedNotes = (userId: string = CURRENT_USER_ID): Note[] =>
  notesData.filter((n) => n.authorId === userId && n.status === 'published') as Note[]

export const getTeamNotes = (userId: string = CURRENT_USER_ID): Note[] => {
  const user = getUserById(userId)
  if (!user) return []
  return notesData.filter(
    (n) => n.authorId !== userId && n.visibility === 'team' &&
      (getTeamById(n.authorId)?.id === user.teamId ||
       getUserById(n.authorId)?.teamId === user.teamId)
  ) as Note[]
}

export const getSharedWithMeNotes = (userId: string = CURRENT_USER_ID): Note[] => {
  const user = getUserById(userId)
  if (!user) return []
  return notesData.filter(
    (n) => n.authorId !== userId &&
      n.visibility === 'shared' &&
      n.sharedWith.includes(user.teamId)
  ) as Note[]
}

export const getRestrictedNotes = (): Note[] =>
  notesData.filter((n) => n.visibility === 'restricted') as Note[]

export const getNotesByTicker = (ticker: string): Note[] =>
  notesData.filter((n) => n.ticker === ticker) as Note[]

export const getNotesByType = (type: NoteType): Note[] =>
  notesData.filter((n) => n.type === type) as Note[]

// --- Search ---
export const searchNotes = (query: string, userId: string = CURRENT_USER_ID): Note[] => {
  const q = query.toLowerCase()
  const user = getUserById(userId)
  if (!user) return []

  return notesData.filter((n) => {
    // Check access
    const canAccess =
      n.authorId === userId ||
      (n.visibility === 'team' && getUserById(n.authorId)?.teamId === user.teamId) ||
      (n.visibility === 'shared' && n.sharedWith.includes(user.teamId)) ||
      n.visibility === 'restricted' // show title only

    if (!canAccess) return false

    return (
      n.title.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q)) ||
      n.ticker?.toLowerCase().includes(q) ||
      Object.values(n.sections).some((s) => s?.toLowerCase().includes(q))
    )
  }) as Note[]
}

// --- Date formatting ---
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const formatFullDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

// --- Access tier helpers ---
export type AccessTier = 'draft' | 'mine' | 'team' | 'shared' | 'restricted'

export const getNoteAccessTier = (note: Note, userId: string = CURRENT_USER_ID): AccessTier => {
  if (note.authorId === userId && note.status === 'draft') return 'draft'
  if (note.authorId === userId) return 'mine'
  const user = getUserById(userId)
  if (note.visibility === 'team' && getUserById(note.authorId)?.teamId === user?.teamId) return 'team'
  if (note.visibility === 'shared') return 'shared'
  return 'restricted'
}

export const ACCESS_TIER_LABELS: Record<AccessTier, string> = {
  draft: 'Draft',
  mine: 'Mine',
  team: 'Team',
  shared: 'Shared',
  restricted: 'Restricted',
}

export const REVIEW_ACTION_LABELS: Record<ReviewAction, string> = {
  approved: 'Approved',
  approved_with_comments: 'Approved with Comments',
  needs_revision: 'Needs Revision',
  follow_up: 'Follow Up',
}
