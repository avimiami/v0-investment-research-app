'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Zap,
  TrendingUp,
  Users,
  Building2,
  Globe,
  Sparkles,
  EyeOff,
  Lock,
  Share2,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTickers, type NoteVisibility, type NoteType } from '@/lib/data'

const NOTE_TYPES: { value: NoteType; label: string; icon: React.ReactNode; placeholder: string }[] = [
  {
    value: 'stock',
    label: 'Stock / Ticker',
    icon: <TrendingUp className="w-4 h-4" />,
    placeholder: 'Quick take on earnings beat, price reaction, channel checks, mgmt tone...',
  },
  {
    value: 'industry',
    label: 'Industry',
    icon: <Building2 className="w-4 h-4" />,
    placeholder: 'Sector dynamics, supply chain checks, pricing power observations...',
  },
  {
    value: 'macro',
    label: 'Macro',
    icon: <Globe className="w-4 h-4" />,
    placeholder: 'Rates move, data print reaction, cross-asset signal, positioning note...',
  },
  {
    value: 'theme',
    label: 'Theme',
    icon: <Sparkles className="w-4 h-4" />,
    placeholder: 'New datapoint supporting or challenging an investment theme...',
  },
]

const QUICK_TAGS = [
  'earnings', 'channel check', 'mgmt meeting', 'site visit', 'conference',
  'data point', 'bull case', 'bear case', 'risk', 'catalyst', 'valuation',
]

const VISIBILITY_OPTS: { value: NoteVisibility; label: string; icon: React.ReactNode }[] = [
  { value: 'private',    label: 'Private',    icon: <EyeOff className="w-3 h-3" /> },
  { value: 'team',       label: 'Team',       icon: <Users className="w-3 h-3" /> },
  { value: 'shared',     label: 'Shared',     icon: <Share2 className="w-3 h-3" /> },
  { value: 'restricted', label: 'Restricted', icon: <Lock className="w-3 h-3" /> },
]

export default function QuickNotePage() {
  const router = useRouter()
  const tickers = getTickers()

  const [type, setType] = useState<NoteType>('stock')
  const [ticker, setTicker] = useState('')
  const [content, setContent] = useState('')
  const [visibility, setVisibility] = useState<NoteVisibility>('team')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [saved, setSaved] = useState(false)

  const selectedTypeConfig = NOTE_TYPES.find((t) => t.value === type)!

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )

  const handleSave = () => {
    if (!content.trim()) return
    setSaved(true)
    setTimeout(() => {
      router.push('/')
    }, 1200)
  }

  const charCount = content.length
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  return (
    <AppShell>
      <Header title="Quick Insight" subtitle="Capture a fast observation before it fades" />
      <main className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-6 py-6">

          {saved ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <p className="text-base font-semibold text-foreground">Note saved</p>
              <p className="text-sm text-muted-foreground">Redirecting to home...</p>
            </div>
          ) : (
            <div className="space-y-6">

              {/* Type selector */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
                  Note Type
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {NOTE_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setType(t.value)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all',
                        type === t.value
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                      )}
                    >
                      {t.icon}
                      <span className="text-xs font-medium">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ticker selector — only for stock type */}
              {type === 'stock' && (
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Ticker (optional)
                  </Label>
                  <Select value={ticker} onValueChange={setTicker}>
                    <SelectTrigger className="h-9 text-sm w-60">
                      <SelectValue placeholder="Select ticker..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="" className="text-muted-foreground text-sm">None</SelectItem>
                      {tickers.map((t) => (
                        <SelectItem key={t.id} value={t.id} className="text-sm font-mono">
                          {t.id} — {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Main text area — big and prominent */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Observation
                </Label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={selectedTypeConfig.placeholder}
                  className="min-h-44 text-sm leading-relaxed resize-none bg-card"
                  autoFocus
                />
                <div className="flex items-center justify-between mt-1.5 text-xs text-muted-foreground">
                  <span>{wordCount} word{wordCount !== 1 ? 's' : ''}</span>
                  <span>{charCount} chars</span>
                </div>
              </div>

              {/* Quick tags */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
                  Tags
                </Label>
                <div className="flex flex-wrap gap-2">
                  {QUICK_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        'px-2.5 py-1 rounded-full text-xs border transition-all',
                        selectedTags.includes(tag)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visibility */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
                  Visibility
                </Label>
                <div className="flex gap-2">
                  {VISIBILITY_OPTS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setVisibility(opt.value)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
                        visibility === opt.value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-muted-foreground hover:bg-secondary'
                      )}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-sm"
                    onClick={() => {
                      setContent('')
                      setSelectedTags([])
                      setTicker('')
                    }}
                    disabled={!content.trim()}
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 text-sm gap-1.5"
                    onClick={handleSave}
                    disabled={!content.trim()}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Save Insight
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </AppShell>
  )
}
