'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'

interface SectionEditorProps {
  title: string
  description?: string
  value: string
  onChange: (value: string) => void
  defaultOpen?: boolean
  placeholder?: string
  required?: boolean
}

export function SectionEditor({
  title,
  description,
  value,
  onChange,
  defaultOpen = true,
  placeholder,
  required = false,
}: SectionEditorProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Section header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-secondary/50 hover:bg-secondary transition-colors text-left"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground">
            {title}
            {required && <span className="text-destructive ml-1">*</span>}
          </span>
          {description && !open && (
            <span className="ml-2 text-xs text-muted-foreground truncate">{description}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {value && (
            <span className="text-xs text-muted-foreground">
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
        <div className="p-4 bg-card">
          {description && (
            <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{description}</p>
          )}
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? `Write your ${title.toLowerCase()} notes here...`}
            className="min-h-32 text-sm resize-none bg-background border-border focus-visible:ring-1 leading-relaxed"
          />
          <p className="text-xs text-muted-foreground mt-1.5 text-right">
            {value.split(' ').filter(Boolean).length} words
          </p>
        </div>
      )}
    </div>
  )
}
