'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SectionEditor } from './section-editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Save,
  Eye,
  EyeOff,
  Users,
  Share2,
  Lock,
  X,
  TrendingUp,
  Globe,
  Building2,
  Sparkles,
  CheckCircle2,
  Phone,
  FileText,
  Zap,
  BarChart3,
  ArrowRight,
  Loader2,
  Wand2,
  Tag,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTickers, getTeams, type NoteVisibility } from '@/lib/data'

// ─── Template definitions ────────────────────────────────────────────────────

type SectionDef = {
  key: string
  title: string
  description: string
  placeholder: string
  defaultOpen: boolean
  accentColor?: string
  showRawNotes?: boolean
  rawNotesPlaceholder?: string
}

type NoteTemplate = {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
  noteType: string
  sections: SectionDef[]
  suggestedTags: string[]
}

const TEMPLATES: NoteTemplate[] = [
  {
    id: 'quarterly',
    label: 'Quarterly Update',
    description: 'Earnings results, business review & shareholder returns',
    icon: <BarChart3 className="w-5 h-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
    noteType: 'stock',
    suggestedTags: ['Earnings Beat', 'Earnings Miss', 'Guidance Raise', 'Guidance Cut', 'Margin Expansion', 'Revenue Acceleration'],
    sections: [
      {
        key: 'businessReview',
        title: 'Business Review',
        description: 'Revenue, margins, key KPIs vs. consensus. What beat or missed and why?',
        placeholder: 'Revenue of $X (+Y% YoY), beat by $Z. Gross margin of X%. Key segment breakdown...',
        defaultOpen: true,
      },
      {
        key: 'bullBear',
        title: 'Bull / Bear',
        description: 'Balanced assessment of upside and downside scenarios',
        placeholder: 'Bull case: ...\n\nBear case: ...',
        defaultOpen: true,
      },
      {
        key: 'cashflow',
        title: 'Cash Flow & Shareholder Returns',
        description: 'FCF generation, buybacks, dividends, balance sheet position',
        placeholder: 'FCF of $X, TTM FCF yield of Y%. Buyback: $Z remaining authorization. Dividend...',
        defaultOpen: false,
      },
      {
        key: 'keyInsights',
        title: 'Key Insights & Action Items',
        description: 'Numbered takeaways, PT changes, follow-up items',
        placeholder: '1. Raise PT to $X\n2. Maintain rating\n3. Follow-up: ...',
        defaultOpen: false,
      },
    ],
  },
  {
    id: 'management_call',
    label: 'Management Call',
    description: 'Meeting notes, tone assessment & follow-ups',
    icon: <Phone className="w-5 h-5" />,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:border-teal-800',
    noteType: 'stock',
    suggestedTags: ['Management Meeting', 'Management Change', 'Guidance', 'Strategy Update', 'CEO', 'CFO'],
    sections: [
      {
        key: 'managementReview',
        title: 'Management Review',
        description: 'Tone, credibility, key messages, guidance read-through. Paste raw notes below to auto-summarize.',
        placeholder: 'CEO tone was... Management guided to... Key signals: ...',
        defaultOpen: true,
        showRawNotes: true,
        rawNotesPlaceholder: 'Paste verbatim meeting notes or transcript excerpt here. AI will condense into structured insights...',
      },
      {
        key: 'keyInsights',
        title: 'Key Insights & Action Items',
        description: 'What changed? What to track? Follow-up questions.',
        placeholder: '1. Key takeaway\n2. Model impact\n3. Follow-up with IR on...',
        defaultOpen: true,
      },
    ],
  },
  {
    id: 'quick_note',
    label: 'Quick Note',
    description: 'Fast observation — analyst must populate manually',
    icon: <Zap className="w-5 h-5" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800',
    noteType: 'stock',
    suggestedTags: ['Channel Check', 'Quick Observation', 'Watch List', 'Catalyst'],
    sections: [
      {
        key: 'quickNote',
        title: 'Quick Note',
        description: 'Your observation, data point, or channel check insight. This section must be filled by the analyst.',
        placeholder: 'Key observation: ...\nSource: ...\nAction: ...',
        defaultOpen: true,
      },
    ],
  },
  {
    id: 'industry',
    label: 'Industry Note',
    description: 'Sector dynamics, competitive landscape & macro read-through',
    icon: <Building2 className="w-5 h-5" />,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:border-violet-800',
    noteType: 'industry',
    suggestedTags: ['Supply Chain', 'Competitive Threat', 'Regulatory Risk', 'M&A', 'Pricing Pressure'],
    sections: [
      {
        key: 'industryOverview',
        title: 'Industry Overview',
        description: 'Current state of the sector, key trends, and structural dynamics',
        placeholder: 'Sector overview: ...',
        defaultOpen: true,
      },
      {
        key: 'competitiveDynamics',
        title: 'Competitive Dynamics',
        description: 'Market share shifts, pricing environment, moat assessment',
        placeholder: 'Key players: ...\nPricing: ...\nMoat: ...',
        defaultOpen: true,
      },
      {
        key: 'keyInsights',
        title: 'Key Insights & Action Items',
        description: 'Investment implications and follow-up items',
        placeholder: '1. Key takeaway\n2. Preferred names\n3. Avoid list',
        defaultOpen: false,
      },
    ],
  },
  {
    id: 'macro',
    label: 'Macro Note',
    description: 'Economic data, rates, policy & cross-asset implications',
    icon: <Globe className="w-5 h-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800',
    noteType: 'macro',
    suggestedTags: ['Macro Headwind', 'China Risk', 'Fed Policy', 'Rates', 'USD', 'Inflation'],
    sections: [
      {
        key: 'macroContext',
        title: 'Macro Context',
        description: 'Economic indicators, central bank policy, credit conditions',
        placeholder: 'Fed stance: ...\nGrowth outlook: ...\nCredit: ...',
        defaultOpen: true,
      },
      {
        key: 'investmentImplications',
        title: 'Investment Implications',
        description: 'Portfolio positioning, sector tilts, risk factors',
        placeholder: 'Overweight: ...\nUnderweight: ...\nKey risks: ...',
        defaultOpen: true,
      },
    ],
  },
  {
    id: 'theme',
    label: 'Theme Note',
    description: 'Structural investment theme with beneficiaries & timeline',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800',
    noteType: 'theme',
    suggestedTags: ['AI', 'Infrastructure', 'Multiple Expansion', 'Secular Growth', 'Structural Change'],
    sections: [
      {
        key: 'themeThesis',
        title: 'Theme Thesis',
        description: 'The core investment thesis — what is happening and why it matters',
        placeholder: 'The thesis: ...\nWhy now: ...\nDuration: ...',
        defaultOpen: true,
      },
      {
        key: 'beneficiaries',
        title: 'Key Beneficiaries',
        description: 'Direct and indirect beneficiaries, preferred names, sizing',
        placeholder: 'Direct: ...\nIndirect: ...\nAvoid: ...',
        defaultOpen: true,
      },
      {
        key: 'risks',
        title: 'Risks & Invalidation',
        description: 'What would invalidate the thesis? Key watch items.',
        placeholder: 'Bull invalidation: ...\nKey risks: ...\nTimeline risk: ...',
        defaultOpen: false,
      },
    ],
  },
]

// ─── Visibility config ────────────────────────────────────────────────────────

const VISIBILITY_CONFIG: Record<NoteVisibility, { label: string; description: string; icon: React.ReactNode; color: string }> = {
  private: {
    label: 'Private (Draft)',
    description: 'Only you can see this',
    icon: <EyeOff className="w-3.5 h-3.5" />,
    color: 'text-muted-foreground',
  },
  team: {
    label: 'Team',
    description: 'Your entire team',
    icon: <Users className="w-3.5 h-3.5" />,
    color: 'text-teal-600',
  },
  shared: {
    label: 'Selective Share',
    description: 'Choose specific teams',
    icon: <Share2 className="w-3.5 h-3.5" />,
    color: 'text-green-600',
  },
  restricted: {
    label: 'Restricted (Points)',
    description: 'Unlock with points',
    icon: <Lock className="w-3.5 h-3.5" />,
    color: 'text-amber-600',
  },
}

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']
const YEARS = [2024, 2025, 2026, 2027]

// ─── Auto-generate title stubs ────────────────────────────────────────────────

function generateTitle(template: NoteTemplate | null, ticker: string, quarter: string, year: number): string {
  if (!template) return ''
  const t = ticker ? `${ticker} — ` : ''
  switch (template.id) {
    case 'quarterly': return `${t}Q${quarter.replace('Q','')} ${year} Earnings Update`
    case 'management_call': return `${t}Management Meeting — ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
    case 'quick_note': return `${t}Quick Observation — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    case 'industry': return `${t}Industry Dynamics Update — ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
    case 'macro': return `Macro Update — ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
    case 'theme': return `${t}Theme Thesis — ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
    default: return `${t}Research Note — ${new Date().toLocaleDateString()}`
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface NoteEditorProps {
  initialData?: {
    title?: string
    type?: string
    ticker?: string
    templateId?: string
    quarter?: string
    year?: number
    visibility?: NoteVisibility
    tags?: string[]
    sections?: Record<string, string>
  }
  mode?: 'create' | 'edit'
}

export function NoteEditor({ initialData, mode = 'create' }: NoteEditorProps) {
  const router = useRouter()
  const tickers = getTickers()
  const teams = getTeams()

  // Step 1: template selection (only on create, skip if initialData has templateId)
  const [selectedTemplate, setSelectedTemplate] = useState<NoteTemplate | null>(
    initialData?.templateId ? (TEMPLATES.find(t => t.id === initialData.templateId) ?? null) : null
  )
  const [templateChosen, setTemplateChosen] = useState(mode === 'edit' || !!initialData?.templateId)

  // Note metadata
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [ticker, setTicker] = useState(initialData?.ticker ?? '')
  const [quarter, setQuarter] = useState(initialData?.quarter ?? 'Q1')
  const [year, setYear] = useState(initialData?.year ?? 2026)
  const [visibility, setVisibility] = useState<NoteVisibility>(initialData?.visibility ?? 'private')
  const [sharedTeams, setSharedTeams] = useState<string[]>([])
  const [accessCost, setAccessCost] = useState(25)
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [saved, setSaved] = useState(false)
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false)

  // Section state: keyed by section key
  const [sections, setSections] = useState<Record<string, string>>(initialData?.sections ?? {})

  const updateSection = (key: string) => (value: string) => {
    setSections((prev) => ({ ...prev, [key]: value }))
  }

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (trimmed && !tags.includes(trimmed)) setTags((prev) => [...prev, trimmed])
    setTagInput('')
  }
  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag))
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput) }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) removeTag(tags[tags.length - 1])
  }

  const autoPopulateTags = () => {
    if (!selectedTemplate) return
    const suggested = selectedTemplate.suggestedTags.filter(t => !tags.includes(t)).slice(0, 5)
    setTags(prev => [...prev, ...suggested])
  }

  const autoGenerateTitle = () => {
    if (!selectedTemplate) return
    setIsGeneratingTitle(true)
    setTimeout(() => {
      setTitle(generateTitle(selectedTemplate, ticker, quarter, year))
      setIsGeneratingTitle(false)
    }, 600)
  }

  const handleChooseTemplate = (template: NoteTemplate) => {
    setSelectedTemplate(template)
    setTemplateChosen(true)
    // Reset sections for the new template
    setSections({})
    // Auto-set note type
  }

  const handleSave = (status: 'draft' | 'published') => {
    setSaved(true)
    setTimeout(() => router.push('/'), 800)
  }

  const totalWords = Object.values(sections).join(' ').split(' ').filter(Boolean).length
  const filledSections = selectedTemplate ? selectedTemplate.sections.filter(s => sections[s.key]?.trim()).length : 0

  // ── Step 1: Template picker ──────────────────────────────────────────────
  if (!templateChosen) {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-8">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-semibold text-foreground">Choose a note type</h2>
          <p className="text-sm text-muted-foreground">The template will pre-populate the correct sections for your research</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleChooseTemplate(t)}
              className={cn(
                'flex flex-col items-start gap-2.5 p-4 rounded-xl border-2 text-left transition-all hover:shadow-sm hover:-translate-y-0.5',
                t.bgColor
              )}
            >
              <span className={cn('p-2 rounded-lg bg-white/70 dark:bg-black/20', t.color)}>
                {t.icon}
              </span>
              <div>
                <p className={cn('text-sm font-semibold', t.color)}>{t.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{t.description}</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-auto">
                <span>{t.sections.length} sections</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Step 2: Editor ───────────────────────────────────────────────────────
  return (
    <div className="flex gap-6 h-full">
      {/* Main editor */}
      <div className="flex-1 min-w-0 space-y-4">

        {/* Template badge + change */}
        {selectedTemplate && (
          <div className="flex items-center gap-2">
            <span className={cn('flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border', selectedTemplate.bgColor, selectedTemplate.color)}>
              {selectedTemplate.icon && <span className="w-3.5 h-3.5">{selectedTemplate.icon}</span>}
              {selectedTemplate.label}
            </span>
            <button
              onClick={() => { setTemplateChosen(false); setSelectedTemplate(null) }}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              Change type
            </button>
          </div>
        )}

        {/* Title row with auto-generate */}
        <div className="flex items-center gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="flex-1 text-lg font-semibold h-12 bg-card border-border placeholder:text-muted-foreground/50"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-12 px-3 gap-1.5 text-xs shrink-0 border-violet-200 text-violet-700 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-400 dark:hover:bg-violet-950"
            onClick={autoGenerateTitle}
            disabled={isGeneratingTitle}
            title="Auto-generate title"
          >
            {isGeneratingTitle ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Generate</span>
          </Button>
        </div>

        {/* Meta row: ticker, quarter/year (contextual) */}
        {(selectedTemplate?.noteType === 'stock') && (
          <div className="flex flex-wrap items-center gap-2">
            <Select value={ticker} onValueChange={setTicker}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue placeholder="Select ticker" />
              </SelectTrigger>
              <SelectContent>
                {tickers.map((t) => (
                  <SelectItem key={t.id} value={t.id} className="text-xs font-mono">
                    {t.id} — {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(selectedTemplate?.id === 'quarterly') && (
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
          </div>
        )}

        {/* Sections — auto-populated per template */}
        {selectedTemplate && (
          <div className="space-y-3">
            {selectedTemplate.sections.map((section) => (
              <SectionEditor
                key={section.key}
                title={section.title}
                description={section.description}
                value={sections[section.key] ?? ''}
                onChange={updateSection(section.key)}
                defaultOpen={section.defaultOpen}
                placeholder={section.placeholder}
                showRawNotes={section.showRawNotes}
                rawNotesPlaceholder={section.rawNotesPlaceholder}
              />
            ))}
          </div>
        )}

        {/* Tags */}
        <div className="border border-border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tags
            </Label>
            {selectedTemplate && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                onClick={autoPopulateTags}
              >
                <Tag className="w-3 h-3" />
                Auto-populate
              </Button>
            )}
          </div>
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
              placeholder={tags.length === 0 ? 'Add tags (Enter or comma)...' : 'Add more...'}
              className="flex-1 min-w-32 text-xs bg-transparent outline-none placeholder:text-muted-foreground/50 py-1"
            />
          </div>
          {selectedTemplate && (
            <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-border/60">
              <span className="text-xs text-muted-foreground mr-1">Suggested:</span>
              {selectedTemplate.suggestedTags.filter(t => !tags.includes(t)).map((tag) => (
                <button
                  key={tag}
                  onClick={() => addTag(tag)}
                  className="text-xs text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary px-1.5 py-0.5 rounded transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar */}
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
                {visibility === key && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />}
              </button>
            ))}
          </div>

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
                        if (e.target.checked) setSharedTeams(prev => [...prev, team.id])
                        else setSharedTeams(prev => prev.filter(t => t !== team.id))
                      }}
                      className="rounded"
                    />
                    <span className="text-xs text-foreground">{team.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {visibility === 'restricted' && (
            <div className="mt-3 pt-3 border-t border-border">
              <Label className="text-xs text-muted-foreground mb-1.5 block">Point cost to unlock:</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={accessCost}
                  onChange={(e) => setAccessCost(Number(e.target.value))}
                  min={5} max={200} step={5}
                  className="h-8 text-xs w-20"
                />
                <span className="text-xs text-muted-foreground">pts</span>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="border border-border rounded-lg p-4 bg-card space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Stats</Label>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total words</span>
              <span className="font-mono">{totalWords}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Est. read time</span>
              <span className="font-mono">{Math.max(1, Math.ceil(totalWords / 200))}m</span>
            </div>
            {selectedTemplate && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Sections filled</span>
                <span className="font-mono">{filledSections}/{selectedTemplate.sections.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Save */}
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
