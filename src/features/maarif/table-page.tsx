import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export function TablePageHeading({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <div className='flex flex-wrap items-end justify-between gap-2'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>{title}</h2>
        <p className='text-muted-foreground'>{description}</p>
      </div>
      {children}
    </div>
  )
}

export function TableFeedback({
  message,
  onDismiss,
}: {
  message: string
  onDismiss: () => void
}) {
  if (!message) return null
  return (
    <Alert role='status'>
      <AlertDescription className='flex items-center justify-between gap-2'>
        {message}
        <Button
          variant='ghost'
          size='icon'
          aria-label='Fermer le message'
          onClick={onDismiss}
        >
          <X />
        </Button>
      </AlertDescription>
    </Alert>
  )
}
