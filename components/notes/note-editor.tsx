'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SectionEditor } from './section-editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import {
  Save,
  Eye,
  EyeOff,
  Users,
  Share2,
  Lock,
  X,
  Plus,
  TrendingUp,
  Globe,
  Building2,
  Sparkles,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTickers, getTeams, type NoteVisibility } from '@/lib/data'

const NOTE_TYPES = [
  { value: 'stock', label: 'Stock Note', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { value: 'industry', label: 'Industry Note', icon: <Building2 className="w-3.5 h-3.5" /> },
  { value: 'macro', label: 'Macro Note', icon: <Globe className="w-3.5 h-3.5" /> },
  { value: 'theme', label: 'Theme Note', icon: <Sparkles className="w-3.5 h-3.5" /> },
]

const CATEGORIES = [
  { value: 'quarterly', label: 'Quarterly Update' },
  { value: 'conference', label: 'Conference Note' },
  { value: 'management_meeting', label: 'Management Meeting' },
  { value: 'earnings', label: 'Earnings Call' },
  { value: 'custom', label: 'Custom' },
]

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']
const YEARS = [2024, 2025, 2026, 2027]

const VISIBILITY_CONFIG: Record<NoteVisibility, { label: string; description: string; icon: React.ReactNode; color: string }> = {
  private: {
    label: 'Private (Draft)',
    description: 'Only you can see this note',
    icon: <EyeOff className="w-3.5 h-3.5" />,
    color: 'text-muted-foreground',
  },
  team: {
    label: 'Team',
    description: 'Your entire team can see this',
    icon: <Users className="w-3.5 h-3.5" />,
    color: 'text-teal-600',
  },
  shared: {
    label: 'Selective Share',
    description: 'Choose specific teams to share with',
    icon: <Share2 className="w-3.5 h-3.5" />,
    color: 'text-green-600',
  },
  restricted: {
    label: 'Restricted (Points)',
    description: 'Visible by title only; unlock with points',
    icon: <Lock className="w-3.5 h-3.5" />,
    color: 'text-amber-600',
  },
}

const SUGGESTED_TAGS = [
  'AI', 'Earnings Beat', 'Earnings Miss', 'Guidance Raise', 'Guidance Cut',
  'Management Change', 'M&A', 'Buyback', 'China Risk', 'Macro Headwind',
  'Margin Expansion', 'Revenue Acceleration', 'Multiple Expansion',
  'Supply Chain', 'Competitive Threat', 'Regulatory Risk',
]

interface NoteEditorProps {
  initialData?: {
    title?: string
    type?: string
    ticker?: string
    category?: string
    quarter?: string
    year?: number
    visibility?: NoteVisibility
    tags?: string[]
    sections?: {
      managementReview?: string
      businessDescription?: string
      competitiveDynamics?: string
      keyInsights?: string
    }
  }
  mode?: 'create' | 'edit'
}

export function NoteEditor({ initialData, mode = 'create' }: NoteEditorProps) {
  const router = useRouter()
  const tickers = getTickers()
  const teams = getTeams()

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [noteType, setNoteType] = useState(initialData?.type ?? 'stock')
  const [ticker, setTicker] = useState(initialData?.ticker ?? '')
  const [category, setCategory] = useState(initialData?.category ?? 'quarterly')
  const [quarter, setQuarter] = useState(initialData?.quarter ?? 'Q1')
  const [year, setYear] = useState(initialData?.year ?? 2026)
  const [visibility, setVisibility] = useState<NoteVisibility>(initialData?.visibility ?? 'private')
  const [sharedTeams, setSharedTeams] = useState<string[]>([])
  const [accessCost, setAccessCost] = useState(25)
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [saved, setSaved] = useState(false)

  const [sections, setSections] = useState({
    managementReview: initialData?.sections?.managementReview ?? '',
    businessDescription: initialData?.sections?.businessDescription ?? '',
    competitiveDynamics: initialData?.sections?.competitiveDynamics ?? '',
    keyInsights: initialData?.sections?.keyInsights ?? '',
  })

  const updateSection = (key: keyof typeof sections) => (value: string) => {
    setSections((prev) => ({ ...prev, [key]: value }))
  }

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag))

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  const handleSave = (status: 'draft' | 'published') => {
    // Mock save
    setSaved(true)
    setTimeout(() => {
      router.push('/')
    }, 800)
  }

  const visibilityConfig = VISIBILITY_CONFIG[visibility]
  const totalWords = Object.values(sections).join(' ').split(' ').filter(Boolean).length

  return (
    <div className="flex gap-6 h-full">
      {/* Main editor */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Title */}
        <div>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="text-lg font-semibold h-12 bg-card border-border placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Meta row: type, ticker, category, quarter/year */}
        <div className="flex flex-wrap items-center gap-2">
          <Select value={noteType} onValueChange={setNoteType}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NOTE_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value} className="text-xs">
                  <span className="flex items-center gap-2">
                    {t.icon} {t.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {noteType === 'stock' && (
            <>
              <Select value={ticker} onValueChange={setTicker}>
                <SelectTrigger className="w-28 h-8 text-xs">
                  <SelectValue placeholder="Ticker" />
                </SelectTrigger>
                <SelectContent>
                  {tickers.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="text-xs font-mono">
                      {t.id} - {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-44 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-xs">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(category === 'quarterly' || category === 'earnings') && (
                <>
                  <Select value={quarter} onValueChange={setQuarter}>
                    <SelectTrigger className="w-20 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUARTERS.map((q) => (
                        <SelectItem key={q} value={q} className="text-xs">{q}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                    <SelectTrigger className="w-24 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map((y) => (
                        <SelectItem key={y} value={String(y)} className="text-xs">{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </>
          )}
        </div>

        {/* Sections */}
        <div className="space-y-3">
          <SectionEditor
            title="Management Review"
            description="Assessment of management quality, commentary tone, guidance credibility, and key messages from calls or meetings"
            value={sections.managementReview}
            onChange={updateSection('managementReview')}
            defaultOpen
            placeholder="How did management communicate? What were the key signals? Any tone shifts or credibility concerns?"
          />
          <SectionEditor
            title="Business Description"
            description="Financial results, key metrics, and business performance summary"
            value={sections.businessDescription}
            onChange={updateSection('businessDescription')}
            defaultOpen
            placeholder="Revenue, margins, key KPIs, guidance. What beat or missed and why?"
          />
          <SectionEditor
            title="Competitive Dynamics"
            description="Competitive positioning, market share, threats, and moat assessment"
            value={sections.competitiveDynamics}
            onChange={updateSection('competitiveDynamics')}
            defaultOpen={false}
            placeholder="Who are the key competitors? What's changing in the competitive landscape?"
          />
          <SectionEditor
            title="Key Insights & Action Items"
            description="Numbered takeaways, price target changes, and follow-up items"
            value={sections.keyInsights}
            onChange={updateSection('keyInsights')}
            defaultOpen={false}
            placeholder="1. Key insight\n2. PT change\n3. Follow-up required"
          />
        </div>

        {/* Tags */}
        <div className="border border-border rounded-lg p-4 bg-card">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            Tags
          </Label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md"
              >
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder={tags.length === 0 ? 'Add tags (press Enter or comma)...' : 'Add more...'}
              className="flex-1 min-w-32 text-xs bg-transparent outline-none placeholder:text-muted-foreground/50 py-1"
            />
          </div>
          <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-border/60">
            <span className="text-xs text-muted-foreground mr-1">Suggested:</span>
            {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).slice(0, 8).map((tag) => (
              <button
                key={tag}
                onClick={() => addTag(tag)}
                className="text-xs text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary px-1.5 py-0.5 rounded transition-colors"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right sidebar: visibility + save */}
      <div className="w-60 shrink-0 space-y-4">
        {/* Visibility */}
        <div className="border border-border rounded-lg p-4 bg-card">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
            Visibility
          </Label>
          <div className="space-y-1.5">
            {(Object.entries(VISIBILITY_CONFIG) as [NoteVisibility, typeof VISIBILITY_CONFIG[NoteVisibility]][]).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setVisibility(key)}
                className={cn(
                  'w-full flex items-center gap-2.5 p-2.5 rounded-md border text-left transition-colors text-xs',
                  visibility === key
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-transparent hover:bg-secondary'
                )}
              >
                <span className={cn('shrink-0', config.color)}>{config.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{config.label}</p>
                  <p className="text-muted-foreground text-[11px] leading-tight mt-0.5">{config.description}</p>
                </div>
                {visibility === key && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Selective share - team picker */}
          {visibility === 'shared' && (
            <div className="mt-3 pt-3 border-t border-border">
              <Label className="text-xs text-muted-foreground mb-2 block">Share with teams:</Label>
              <div className="space-y-1.5">
                {teams.map((team) => (
                  <label key={team.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sharedTeams.includes(team.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSharedTeams((prev) => [...prev, team.id])
                        } else {
                          setSharedTeams((prev) => prev.filter((t) => t !== team.id))
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-xs text-foreground">{team.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Restricted - access cost */}
          {visibility === 'restricted' && (
            <div className="mt-3 pt-3 border-t border-border">
              <Label className="text-xs text-muted-foreground mb-1.5 block">Point cost to unlock:</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={accessCost}
                  onChange={(e) => setAccessCost(Number(e.target.value))}
                  min={5}
                  max={200}
                  step={5}
                  className="h-8 text-xs w-20"
                />
                <span className="text-xs text-muted-foreground">pts</span>
              </div>
            </div>
          )}
        </div>

        {/* Note stats */}
        <div className="border border-border rounded-lg p-4 bg-card space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Stats
          </Label>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total words</span>
              <span className="font-mono">{totalWords}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Est. read time</span>
              <span className="font-mono">{Math.max(1, Math.ceil(totalWords / 200))}m</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Sections filled</span>
              <span className="font-mono">
                {Object.values(sections).filter(Boolean).length}/4
              </span>
            </div>
          </div>
        </div>

        {/* Save actions */}
        <div className="space-y-2">
          {saved ? (
            <Button className="w-full gap-2" disabled>
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Saved!
            </Button>
          ) : (
            <>
              <Button
                className="w-full gap-2"
                onClick={() => handleSave('published')}
                disabled={!title.trim()}
              >
                <Eye className="w-3.5 h-3.5" />
                Publish Note
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => handleSave('draft')}
                disabled={!title.trim()}
              >
                <Save className="w-3.5 h-3.5" />
                Save as Draft
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
