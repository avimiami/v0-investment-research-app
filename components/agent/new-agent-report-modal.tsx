'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Bot,
  Sparkles,
  TrendingUp,
  Globe,
  BarChart3,
  FileSearch,
  Zap,
  Lock,
  Users,
  Share2,
  EyeOff,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTickers, type NoteVisibility } from '@/lib/data'

const AGENT_TEMPLATES = [
  {
    id: 'competitive',
    label: 'Competitive Analysis',
    icon: BarChart3,
    description: 'Competitive positioning, market share dynamics, and threat landscape',
    prompt:
      'Analyze the competitive positioning of [TICKER] vs its key competitors. Include market share data, recent earnings signals, and identify key risks to the bull case.',
    accent: 'border-blue-200 bg-blue-50/50 hover:border-blue-300 dark:border-blue-900/40 dark:bg-blue-950/20',
    activeAccent: 'border-blue-400 bg-blue-50 ring-blue-300/40 dark:border-blue-600 dark:bg-blue-950/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'earnings',
    label: 'Earnings Preview',
    icon: TrendingUp,
    description: 'Consensus estimates, key debate points, and what to watch',
    prompt:
      "Generate an earnings preview for [TICKER]'s upcoming quarter. Include consensus revenue and EPS estimates, key debate points, and the most important metrics to watch.",
    accent: 'border-teal-200 bg-teal-50/50 hover:border-teal-300 dark:border-teal-900/40 dark:bg-teal-950/20',
    activeAccent: 'border-teal-400 bg-teal-50 ring-teal-300/40 dark:border-teal-600 dark:bg-teal-950/40',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
  {
    id: 'macro',
    label: 'Macro Risk Assessment',
    icon: Globe,
    description: 'Rates, credit, FX, and geopolitics for equity positioning',
    prompt:
      'Generate a macro risk assessment for equity markets. Evaluate: Fed policy trajectory, credit market conditions, dollar strength, and geopolitical risks. Include a probability-weighted risk matrix.',
    accent: 'border-amber-200 bg-amber-50/50 hover:border-amber-300 dark:border-amber-900/40 dark:bg-amber-950/20',
    activeAccent: 'border-amber-400 bg-amber-50 ring-amber-300/40 dark:border-amber-600 dark:bg-amber-950/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'screen',
    label: 'Valuation Screen',
    icon: FileSearch,
    description: 'Sector-wide relative value and positioning opportunities',
    prompt:
      'Screen [SECTOR] companies by EV/EBITDA, revenue growth, and FCF yield. Identify the most attractively valued names relative to growth and compare to historical ranges.',
    accent: 'border-violet-200 bg-violet-50/50 hover:border-violet-300 dark:border-violet-900/40 dark:bg-violet-950/20',
    activeAccent: 'border-violet-400 bg-violet-50 ring-violet-300/40 dark:border-violet-600 dark:bg-violet-950/40',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'custom',
    label: 'Custom Task',
    icon: Sparkles,
    description: 'Describe your own research task in natural language',
    prompt: '',
    accent: 'border-border bg-secondary/30 hover:border-primary/30',
    activeAccent: 'border-primary bg-primary/5 ring-primary/20',
    iconColor: 'text-primary',
  },
]

const VISIBILITY_OPTIONS: { value: NoteVisibility; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'private',    label: 'Private',    icon: <EyeOff className="w-3 h-3" />,  description: 'Only you' },
  { value: 'team',       label: 'Team',       icon: <Users className="w-3 h-3" />,   description: 'Your team' },
  { value: 'shared',     label: 'Shared',     icon: <Share2 className="w-3 h-3" />,  description: 'Select teams' },
  { value: 'restricted', label: 'Restricted', icon: <Lock className="w-3 h-3" />,    description: 'Points gate' },
]

const MODELS = [
  { value: 'openrouter/anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
  { value: 'openrouter/openai/gpt-4o',               label: 'GPT-4o' },
  { value: 'openrouter/google/gemini-pro-1.5',       label: 'Gemini Pro 1.5' },
]

const REPORT_SECTIONS = [
  { key: 'summary',         label: 'Summary' },
  { key: 'analysis',        label: 'Analysis' },
  { key: 'recommendations', label: 'Recommendations' },
]

interface NewAgentReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewAgentReportModal({ open, onOpenChange }: NewAgentReportModalProps) {
  const router = useRouter()
  const tickers = getTickers()

  const [selectedTemplate, setSelectedTemplate] = useState('competitive')
  const [prompt, setPrompt] = useState(AGENT_TEMPLATES[0].prompt)
  const [ticker, setTicker] = useState('')
  const [model, setModel] = useState(MODELS[0].value)
  const [launching, setLaunching] = useState(false)
  const [launched, setLaunched] = useState(false)

  const [visibility, setVisibility] = useState<Record<string, NoteVisibility>>({
    summary:         'team',
    analysis:        'team',
    recommendations: 'private',
  })

  const handleTemplateSelect = (t: typeof AGENT_TEMPLATES[0]) => {
    setSelectedTemplate(t.id)
    setPrompt(t.prompt)
  }

  const handleLaunch = () => {
    setLaunching(true)
    setTimeout(() => {
      setLaunching(false)
      setLaunched(true)
      setTimeout(() => {
        onOpenChange(false)
        router.push('/agent/history')
      }, 1400)
    }, 1200)
  }

  const finalPrompt = prompt
    .replace('[TICKER]', ticker || 'the company')
    .replace('[SECTOR]', 'the selected sector')

  const activeTemplate = AGENT_TEMPLATES.find((t) => t.id === selectedTemplate)!

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                New Agent Report
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure and launch an AI research agent
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {launched ? (
            /* Success state */
            <div className="flex flex-col items-center justify-center py-16 px-6 gap-4">
              <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-foreground">Agent launched</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your report is being generated. Redirecting to history...
                </p>
              </div>
            </div>
          ) : (
            <div className="px-6 py-5 space-y-6">

              {/* Template picker */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
                  Task Template
                </Label>
                <div className="grid grid-cols-5 gap-2">
                  {AGENT_TEMPLATES.map((t) => {
                    const Icon = t.icon
                    const isActive = selectedTemplate === t.id
                    return (
                      <button
                        key={t.id}
                        onClick={() => handleTemplateSelect(t)}
                        className={cn(
                          'p-3 rounded-xl border text-left transition-all ring-1 ring-transparent',
                          isActive ? cn(t.activeAccent, 'ring-1') : t.accent
                        )}
                      >
                        <Icon className={cn('w-4 h-4 mb-2', isActive ? t.iconColor : 'text-muted-foreground')} />
                        <p className={cn('text-xs font-semibold leading-snug', isActive ? 'text-foreground' : 'text-foreground/80')}>
                          {t.label}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Prompt */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Task Description
                </Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want the agent to research and generate..."
                  className="min-h-[88px] text-sm leading-relaxed resize-none bg-card"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Be specific. Include ticker symbols, timeframes, and the angle you want the agent to focus on.
                </p>
              </div>

              {/* Ticker + Model row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Ticker (optional)
                  </Label>
                  <Select value={ticker} onValueChange={setTicker}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select ticker..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="" className="text-sm text-muted-foreground">None</SelectItem>
                      {tickers.map((t) => (
                        <SelectItem key={t.id} value={t.id} className="text-sm font-mono">
                          {t.id} — {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Model
                  </Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MODELS.map((m) => (
                        <SelectItem key={m.value} value={m.value} className="text-sm">{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Per-section visibility */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
                  Output Visibility — per section
                </Label>
                <div className="space-y-2">
                  {REPORT_SECTIONS.map(({ key, label }) => {
                    const vis = visibility[key]
                    return (
                      <div
                        key={key}
                        className="flex items-center gap-3 px-3 py-2.5 bg-card border border-border rounded-lg"
                      >
                        <span className="text-sm font-medium text-foreground w-32 shrink-0">{label}</span>
                        <div className="flex items-center gap-1 ml-auto">
                          {VISIBILITY_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => setVisibility((prev) => ({ ...prev, [key]: opt.value }))}
                              title={opt.description}
                              className={cn(
                                'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                                vis === opt.value
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-muted-foreground hover:bg-secondary'
                              )}
                            >
                              {opt.icon}
                              <span>{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer actions */}
        {!launched && (
          <div className="shrink-0 border-t border-border px-6 py-4 flex items-center justify-between gap-4 bg-secondary/20">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Reports typically take 2–5 minutes. You will be notified when complete.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-sm"
                onClick={() => onOpenChange(false)}
                disabled={launching}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-8 text-sm gap-2 min-w-32"
                onClick={handleLaunch}
                disabled={launching || !prompt.trim()}
              >
                {launching ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Launching...
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    Launch Agent
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
