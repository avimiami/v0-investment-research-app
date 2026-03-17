'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
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
  Eye,
  EyeOff,
  ChevronRight,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTickers, type NoteVisibility } from '@/lib/data'

const AGENT_TEMPLATES = [
  {
    id: 'competitive',
    label: 'Competitive Analysis',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'Analyze competitive positioning, market share dynamics, and threat landscape for a ticker',
    prompt: 'Analyze the competitive positioning of [TICKER] vs its key competitors. Include market share data, recent earnings signals, and identify key risks to the bull case.',
    color: 'border-blue-200 bg-blue-50/50 hover:border-blue-300 dark:border-blue-900/40 dark:bg-blue-950/20',
  },
  {
    id: 'earnings',
    label: 'Earnings Preview',
    icon: <TrendingUp className="w-5 h-5" />,
    description: 'Summarize consensus estimates, key debate points, and what to watch for upcoming earnings',
    prompt: 'Generate an earnings preview for [TICKER]\'s upcoming quarter. Include consensus revenue and EPS estimates, key debate points, and the most important metrics to watch.',
    color: 'border-teal-200 bg-teal-50/50 hover:border-teal-300 dark:border-teal-900/40 dark:bg-teal-950/20',
  },
  {
    id: 'macro',
    label: 'Macro Risk Assessment',
    icon: <Globe className="w-5 h-5" />,
    description: 'Evaluate current macro risks across rates, credit, FX, and geopolitics for equity positioning',
    prompt: 'Generate a macro risk assessment for equity markets. Evaluate: Fed policy trajectory, credit market conditions, dollar strength, and geopolitical risks. Include a probability-weighted risk matrix.',
    color: 'border-amber-200 bg-amber-50/50 hover:border-amber-300 dark:border-amber-900/40 dark:bg-amber-950/20',
  },
  {
    id: 'screen',
    label: 'Valuation Screen',
    icon: <FileSearch className="w-5 h-5" />,
    description: 'Screen a sector for valuation anomalies, relative value, and positioning opportunities',
    prompt: 'Screen [SECTOR] companies by EV/EBITDA, revenue growth, and FCF yield. Identify the most attractively valued names relative to growth and compare to historical ranges.',
    color: 'border-violet-200 bg-violet-50/50 hover:border-violet-300 dark:border-violet-900/40 dark:bg-violet-950/20',
  },
  {
    id: 'custom',
    label: 'Custom Task',
    icon: <Sparkles className="w-5 h-5" />,
    description: 'Describe your own research task in natural language',
    prompt: '',
    color: 'border-border bg-secondary/30 hover:border-primary/30',
  },
]

const VISIBILITY_OPTIONS: { value: NoteVisibility; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'private',    label: 'Private',    icon: <EyeOff className="w-3.5 h-3.5" />, description: 'Only you' },
  { value: 'team',       label: 'Team',       icon: <Users className="w-3.5 h-3.5" />,  description: 'Your team' },
  { value: 'shared',     label: 'Share',      icon: <Share2 className="w-3.5 h-3.5" />, description: 'Select teams' },
  { value: 'restricted', label: 'Restricted', icon: <Lock className="w-3.5 h-3.5" />,  description: 'Points gate' },
]

const MODELS = [
  { value: 'openrouter/anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
  { value: 'openrouter/openai/gpt-4o',               label: 'GPT-4o' },
  { value: 'openrouter/google/gemini-pro-1.5',       label: 'Gemini Pro 1.5' },
]

export default function AgentLauncherPage() {
  const router = useRouter()
  const tickers = getTickers()

  const [selectedTemplate, setSelectedTemplate] = useState('competitive')
  const [prompt, setPrompt] = useState(AGENT_TEMPLATES[0].prompt)
  const [ticker, setTicker] = useState('')
  const [model, setModel] = useState(MODELS[0].value)
  const [launching, setLaunching] = useState(false)

  // Per-section visibility
  const [visibility, setVisibility] = useState<Record<string, NoteVisibility>>({
    summary:         'team',
    analysis:        'team',
    recommendations: 'private',
  })

  const handleTemplateSelect = (template: typeof AGENT_TEMPLATES[0]) => {
    setSelectedTemplate(template.id)
    setPrompt(template.prompt)
  }

  const handleLaunch = () => {
    setLaunching(true)
    setTimeout(() => {
      router.push('/agent/history')
    }, 1200)
  }

  const finalPrompt = prompt.replace('[TICKER]', ticker || 'the company').replace('[SECTOR]', 'the selected sector')

  return (
    <AppShell>
      <Header title="Agent" subtitle="AI-assisted research report generation" />
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-6">

          <div className="flex gap-6">
            {/* Left: config */}
            <div className="flex-1 min-w-0 space-y-6">

              {/* Template picker */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
                  Task Template
                </Label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {AGENT_TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleTemplateSelect(t)}
                      className={cn(
                        'p-3 rounded-lg border text-left transition-all',
                        selectedTemplate === t.id
                          ? 'border-primary ring-1 ring-primary/30 bg-primary/5'
                          : t.color
                      )}
                    >
                      <div className={cn('mb-1.5', selectedTemplate === t.id ? 'text-primary' : 'text-muted-foreground')}>
                        {t.icon}
                      </div>
                      <p className="text-xs font-semibold text-foreground">{t.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-2">{t.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt editor */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Task Description
                </Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want the agent to research and generate..."
                  className="min-h-28 text-sm leading-relaxed resize-none bg-card"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Be specific. Include ticker symbols, timeframes, and the angle you want the agent to focus on.
                </p>
              </div>

              {/* Ticker (optional) */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Ticker (optional)
                  </Label>
                  <Select value={ticker} onValueChange={setTicker}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select ticker..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="" className="text-sm text-muted-foreground">None (no ticker)</SelectItem>
                      {tickers.map((t) => (
                        <SelectItem key={t.id} value={t.id} className="text-sm font-mono">
                          {t.id} — {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
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

              {/* Section visibility */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
                  Output Visibility — per section
                </Label>
                <div className="space-y-2">
                  {Object.entries(visibility).map(([section, vis]) => (
                    <div key={section} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                      <span className="text-sm font-medium text-foreground capitalize flex-1">{section}</span>
                      <div className="flex items-center gap-1">
                        {VISIBILITY_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setVisibility((prev) => ({ ...prev, [section]: opt.value }))}
                            className={cn(
                              'flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors',
                              vis === opt.value
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-secondary'
                            )}
                            title={opt.description}
                          >
                            {opt.icon}
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Control which parts of the generated report are visible to your team vs. private.
                </p>
              </div>
            </div>

            {/* Right: preview + launch */}
            <div className="w-56 shrink-0 space-y-4">
              <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Ready to launch</h3>
                </div>

                <Separator />

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Template</span>
                    <span className="font-medium text-foreground">
                      {AGENT_TEMPLATES.find((t) => t.id === selectedTemplate)?.label}
                    </span>
                  </div>
                  {ticker && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ticker</span>
                      <span className="ticker font-bold text-primary">{ticker}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model</span>
                    <span className="font-medium text-foreground text-right max-w-28 truncate">
                      {MODELS.find((m) => m.value === model)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Summary</span>
                    <span className="font-medium text-foreground capitalize">{visibility.summary}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Analysis</span>
                    <span className="font-medium text-foreground capitalize">{visibility.analysis}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recs.</span>
                    <span className="font-medium text-foreground capitalize">{visibility.recommendations}</span>
                  </div>
                </div>

                <Separator />

                <Button
                  className="w-full gap-2 text-sm"
                  onClick={handleLaunch}
                  disabled={launching || !prompt.trim()}
                >
                  {launching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Launching...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Launch Agent
                    </>
                  )}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground leading-relaxed p-3 bg-secondary/50 rounded-lg border border-border">
                Reports typically take 2-5 minutes. You will be notified when complete. You can leave this page.
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  )
}
