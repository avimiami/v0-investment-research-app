import Link from 'next/link'
import { FileX, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppShell } from '@/components/layout/app-shell'

export default function NoteNotFound() {
  return (
    <AppShell>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto">
            <FileX className="w-7 h-7 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Note not found</h1>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              This note may have been deleted, or you may not have access to view it.
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to home
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  )
}
