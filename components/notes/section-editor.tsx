'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Sparkles, MessageSquare, X, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface SectionEditorProps {
  title: string
  description?: string
  value: string
  onChange: (value: string) => void
  defaultOpen?: boolean
  placeholder?: string
  required?: boolean
  accentColor?: string
  // raw notes paste area (for mgmt call)
  showRawNotes?: boolean
  rawNotesPlaceholder?: string
}

export function SectionEditor({
  title,
  description,
  value,
  onChange,
  defaultOpen = true,
  placeholder,
  required = false,
  accentColor = 'bg-primary/5 border-l-primary',
  showRawNotes = false,
  rawNotesPlaceholder = 'Paste raw notes here to summarize...',
}: SectionEditorProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [rawNotes, setRawNotes] = useState('')
  const [isSummarizing, setIsSummarizing] = useState(false)

  const handleAIFill = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const placeholder_content = AI_FILL_STUBS[title] ?? `[AI-generated ${title.toLowerCase()} content would appear here based on your research context and linked ticker data.]`
      onChange(placeholder_content)
      setIsGenerating(false)
    }, 900)
  }

  const handleSummarize = () => {
    if (!rawNotes.trim()) return
    setIsSummarizing(true)
    setTimeout(() => {
      onChange(`Summary of meeting notes:\n\n• Management expressed cautious optimism on near-term outlook, noting macro headwinds in H1.\n• CEO emphasized focus on operational efficiency and margin improvement.\n• CFO guided to 8-10% revenue growth for FY26, slightly below consensus.\n• Key Q&A: management addressed supply chain concerns, indicated inventory normalization by Q2.\n• Follow-up: confirm capex guidance in next IR call.`)
      setRawNotes('')
      setIsSummarizing(false)
    }, 1200)
  }

  const handleChatSend = () => {
    if (!chatInput.trim()) return
    const userMsg: ChatMessage = { role: 'user', content: chatInput }
    setChatMessages((prev) => [...prev, userMsg])
    setChatInput('')
    setIsGenerating(true)
    setTimeout(() => {
      const reply: ChatMessage = {
        role: 'assistant',
        content: `Based on available context for this section, here is a suggested addition: consider expanding on the competitive moat and how pricing power has trended over the last 4 quarters. Would you like me to draft specific language?`,
      }
      setChatMessages((prev) => [...prev, reply])
      setIsGenerating(false)
    }, 800)
  }

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden')}>
      {/* Section header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-secondary/40 hover:bg-secondary/70 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-foreground">
            {title}
            {required && <span className="text-destructive ml-1">*</span>}
          </span>
          {description && !open && (
            <span className="ml-2 text-xs text-muted-foreground truncate">{description}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {value && (
            <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
              {value.split(' ').filter(Boolean).length}w
            </span>
          )}
          {open ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Section body */}
      {open && (
        <div className="p-4 bg-card space-y-3">
          {description && (
            <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          )}

          {/* Raw notes paste area (Management Call only) */}
          {showRawNotes && (
            <div className="rounded-md border border-dashed border-border bg-secondary/30 p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Paste raw meeting notes to summarize</p>
              <Textarea
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
                placeholder={rawNotesPlaceholder}
                className="min-h-24 text-xs resize-none bg-background border-border focus-visible:ring-1 leading-relaxed font-mono"
              />
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1.5 w-full"
                onClick={handleSummarize}
                disabled={!rawNotes.trim() || isSummarizing}
              >
                {isSummarizing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3 text-violet-500" />
                )}
                {isSummarizing ? 'Summarizing...' : 'Summarize into section'}
              </Button>
            </div>
          )}

          {/* Main textarea */}
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? `Write your ${title.toLowerCase()} notes here...`}
            className="min-h-32 text-sm resize-none bg-background border-border focus-visible:ring-1 leading-relaxed"
          />

          {/* Footer: word count + AI actions */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {value.split(' ').filter(Boolean).length} words
            </span>
            <div className="flex items-center gap-1.5">
              {/* AI chatbot popover */}
              <Popover open={chatOpen} onOpenChange={setChatOpen}>
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                    title="Ask AI about this section"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Ask AI
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end" side="top">
                  <div className="p-3 border-b border-border">
                    <p className="text-xs font-semibold text-foreground">{title} — AI Assistant</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Ask questions or request drafting help for this section</p>
                  </div>
                  <div className="max-h-48 overflow-y-auto p-3 space-y-2">
                    {chatMessages.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-3">No messages yet. Ask a question below.</p>
                    )}
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={cn('text-xs rounded-md px-2.5 py-2 leading-relaxed', msg.role === 'user' ? 'bg-primary/10 text-foreground ml-4' : 'bg-secondary text-foreground mr-4')}>
                        {msg.content}
                      </div>
                    ))}
                    {isGenerating && chatOpen && (
                      <div className="bg-secondary rounded-md px-2.5 py-2 mr-4">
                        <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-2 border-t border-border flex gap-2">
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSend() } }}
                      placeholder="Ask about this section..."
                      className="flex-1 text-xs bg-background border border-border rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-primary/50"
                    />
                    <Button size="sm" className="h-7 w-7 p-0" onClick={handleChatSend} disabled={!chatInput.trim()}>
                      <Send className="w-3 h-3" />
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* AI Fill button */}
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2.5 text-xs gap-1.5 border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300 dark:border-violet-800 dark:text-violet-400 dark:hover:bg-violet-950"
                onClick={handleAIFill}
                disabled={isGenerating && !chatOpen}
                title="AI-fill this section"
              >
                {isGenerating && !chatOpen ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                {isGenerating && !chatOpen ? 'Filling...' : 'AI Fill'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Stub AI fill content per section title
const AI_FILL_STUBS: Record<string, string> = {
  'Business Review': `Revenue of $12.4B (+9% YoY) came in 2% ahead of consensus. Gross margins expanded 80bps to 43.2%, driven by favorable mix shift and easing input costs. Operating income of $2.1B beat by $120M. Full-year guidance raised to $49-51B revenue (+7-10% YoY), above the $48.5B Street estimate.`,
  'Bull / Bear': `Bull case: continued market share gains in cloud, operating leverage driving margin expansion toward 20%+ EBIT margins, and emerging AI monetization adding $3-5B incremental revenue by FY28.\n\nBear case: slowing enterprise IT spend, increasing competition from hyperscalers, and valuation at 28x forward EPS leaving limited margin of safety.`,
  'Cash Flow & Shareholder Returns': `FCF of $3.2B in the quarter, up 18% YoY. TTM FCF yield of 4.1%. Company repurchased $1.1B of stock in Q1, with $4.2B remaining under current authorization. Dividend raised 6% to $0.32/share quarterly. Net cash position of $8.7B.`,
  'Management Review': `CEO tone was constructive but measured — flagged macro uncertainty in Europe as a near-term watch item. Emphasis on AI integration roadmap resonated positively. CFO's guidance cadence was conservative, consistent with historical patterns of underpromise/overdeliver. Management credibility remains high.`,
  'Quick Note': `Key observation: channel checks indicate improving sell-through data vs. Q4 trough. Three action items: (1) update model for revised margin guidance, (2) review peer commentary from MSFT/GOOGL earnings, (3) schedule channel call with VAR contacts.`,
  'Competitive Dynamics': `Primary threat from [Competitor A] intensifying in SMB segment — pricing pressure evident. Enterprise segment remains sticky with 92% net retention. Moat assessment: moderate, sustained by ecosystem switching costs and proprietary data advantage. Watch for new entrant [Startup X] gaining traction in mid-market.`,
  'Key Insights & Action Items': `1. Raise PT to $185 (from $170) on improved margin outlook\n2. Maintain Overweight — risk/reward still favorable at 24x FY27E EPS\n3. Follow-up: verify backlog conversion rate with IR\n4. Monitor: competitor pricing actions in next 60 days\n5. Model update needed: revise FY26E EPS to $7.20 (from $6.95)`,
  'Macro Context': `Fed pause expected through H1. Credit spreads widening modestly but not dislocating. USD strength creating ~150bps headwind to international revenue. Housing market stabilizing; consumer balance sheets resilient at aggregate level but bifurcating at income extremes. Watch CPI print on the 15th.`,
  'Theme Thesis': `The AI infrastructure buildout cycle remains underappreciated in its duration. Historical technology capex cycles (fiber, mobile) ran 7-10 years. We are 2-3 years into this cycle. Key beneficiaries: power/cooling infrastructure, custom silicon, and enterprise software embedding AI natively into workflows.`,
  'Industry Overview': `Sector at an inflection point: consolidation accelerating as top 3 players gain share. Regulatory tailwinds in EU, headwinds in US. Pricing environment improving after 18-month compression. TAM expanding into adjacent verticals — management teams universally citing 20-30% untapped opportunity.`,
}
