'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppShell } from '@/components/layout/app-shell'
import { NoteEditor } from '@/components/notes/note-editor'

export default function NewNotePage() {
  const router = useRouter()

  return (
    <AppShell>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page header bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-sm font-semibold text-foreground">New Research Note</h1>
          </div>
        </div>

        {/* Editor canvas */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-6 py-6">
            <NoteEditor mode="create" />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
