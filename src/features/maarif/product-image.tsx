import { useEffect, useId, useState } from 'react'
import { ImageIcon, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export type ProductImageChange = File | null | undefined

export function ProductImage({
  title,
  imageUrl,
  className,
  size = 'sm',
}: {
  title: string
  imageUrl?: string | null
  className?: string
  size?: 'sm' | 'lg'
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  return (
    <span
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted text-muted-foreground',
        size === 'lg' ? 'aspect-[4/3] w-full' : 'size-10',
        className
      )}
    >
      {imageUrl && failedUrl !== imageUrl ? (
        <img
          src={imageUrl}
          alt={`Couverture de ${title}`}
          className='h-full w-full object-cover'
          loading='lazy'
          onError={() => setFailedUrl(imageUrl)}
        />
      ) : (
        <>
          <ImageIcon
            aria-hidden
            className={size === 'lg' ? 'size-12' : 'size-5'}
          />
          <span className='sr-only'>Aucune image pour {title}</span>
        </>
      )}
    </span>
  )
}

export function ProductImageUpload({
  title,
  currentUrl,
  value,
  onChange,
}: {
  title: string
  currentUrl?: string | null
  value: ProductImageChange
  onChange: (value: ProductImageChange) => void
}) {
  const id = useId()
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const preview =
    value instanceof File
      ? URL.createObjectURL(value)
      : value === null
        ? null
        : currentUrl
  useEffect(
    () => () => {
      if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
    },
    [preview]
  )
  function select(file?: File) {
    if (!file) return
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Format non autorisé. Utilisez une image JPG, PNG ou WebP.')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('L’image ne doit pas dépasser 5 Mo.')
      return
    }
    setError('')
    onChange(file)
  }
  return (
    <fieldset className='space-y-3 sm:col-span-2'>
      <legend className='text-sm font-medium'>Image du produit</legend>
      <div className='flex flex-col gap-4 sm:flex-row'>
        <ProductImage
          title={title || 'ce produit'}
          imageUrl={preview}
          className='h-32 w-32'
        />
        <label
          htmlFor={id}
          className={cn(
            'flex min-h-32 flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition-colors focus-within:ring-2 focus-within:ring-ring',
            dragging && 'border-primary bg-accent'
          )}
          onDragEnter={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            select(e.dataTransfer.files[0])
          }}
        >
          <Upload className='mb-2 size-5' aria-hidden />
          <span className='text-sm font-medium'>
            Glissez une image ici ou parcourez vos fichiers
          </span>
          <span className='text-xs text-muted-foreground'>
            JPG, PNG ou WebP · 5 Mo maximum
          </span>
          <input
            id={id}
            className='sr-only'
            type='file'
            accept='.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp'
            onChange={(e) => {
              select(e.target.files?.[0])
              e.currentTarget.value = ''
            }}
            aria-describedby={`${id}-help ${id}-error`}
          />
          <span id={`${id}-help`} className='sr-only'>
            Le fichier doit être une image JPG, PNG ou WebP de cinq mégaoctets
            maximum.
          </span>
        </label>
      </div>
      <div className='flex gap-2'>
        {preview ? (
          <>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => document.getElementById(id)?.click()}
            >
              <Upload />
              Remplacer
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => {
                setError('')
                onChange(null)
              }}
            >
              <X />
              Supprimer
            </Button>
          </>
        ) : null}
      </div>
      {error ? (
        <p id={`${id}-error`} role='alert' className='text-sm text-destructive'>
          {error}
        </p>
      ) : (
        <span id={`${id}-error`} />
      )}
    </fieldset>
  )
}
