import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ApiError } from '@/api/client'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { ProductFormReferences } from './backend-adapters'
import { ProductImageUpload, type ProductImageChange } from './product-image'

const amount = (value: string) => Number(value.replace(',', '.'))
const submitErrorMessage = (error: unknown) =>
  error instanceof ApiError
    ? (error.violations[0]?.message ?? error.message)
    : 'Impossible d’enregistrer le produit. Réessayez.'

const productSchema = (
  currentSku?: string,
  existingSkus: string[] = [],
  references?: ProductFormReferences
) =>
  z
    .object({
      sku: z
        .string()
        .trim()
        .regex(/^[A-Z]{3}-\d{6}$/, 'Utilisez le format LIV-000000.')
        .refine(
          (value) => value === currentSku || !existingSkus.includes(value),
          'Ce SKU est déjà utilisé par un autre produit.'
        ),
      isbn: z
        .string()
        .trim()
        .refine(
          (value) =>
            !value || /^(?:\d[ -]?){9}[\dXx]$|^(?:\d[ -]?){13}$/.test(value),
          'Saisissez un ISBN-10 ou ISBN-13 valide.'
        ),
      title: z.string().trim().min(1, 'Le titre est requis.'),
      authors: z.string().trim().min(1, 'Ajoutez au moins un auteur.'),
      description: z.string(),
      publisher: z.string().min(1, 'Choisissez un éditeur.'),
      category: z.string().min(1, 'Choisissez une catégorie.'),
      language: z.string().min(1, 'Choisissez une langue.'),
      sellingPrice: z
        .string()
        .trim()
        .refine(
          (value) => Number.isFinite(amount(value)) && amount(value) > 0,
          'Saisissez un prix de vente supérieur à 0 MAD.'
        ),
      purchaseCost: z
        .string()
        .trim()
        .refine(
          (value) =>
            value !== '' &&
            Number.isFinite(amount(value)) &&
            amount(value) >= 0,
          'Saisissez un coût d’achat valide.'
        ),
      minimumStock: z
        .string()
        .regex(/^\d+$/, 'Saisissez un stock minimum positif ou nul.'),
      supplier: z.string().min(1, 'Choisissez un fournisseur.'),
      supplierLeadTime: z
        .string()
        .refine(
          (value) => /^\d+$/.test(value),
          'Le délai doit être positif ou nul.'
        ),
      active: z.boolean(),
    })
    .refine(
      (values) => amount(values.purchaseCost) <= amount(values.sellingPrice),
      {
        message: 'Le coût d’achat ne peut pas dépasser le prix de vente.',
        path: ['purchaseCost'],
      }
    )
    .refine(
      (values) =>
        references?.publishers.some((item) => item.name === values.publisher) ??
        false,
      { message: 'Choisissez un éditeur disponible.', path: ['publisher'] }
    )
    .refine(
      (values) =>
        references?.categories.some((item) => item.name === values.category) ??
        false,
      { message: 'Choisissez une catégorie disponible.', path: ['category'] }
    )
    .refine(
      (values) =>
        references?.suppliers.some(
          (item) => item.active && item.name === values.supplier
        ) ?? false,
      { message: 'Choisissez un fournisseur disponible.', path: ['supplier'] }
    )

export type ProductForm = z.infer<ReturnType<typeof productSchema>>
const PRODUCT_FORM_DEFAULTS: ProductForm = {
  sku: '',
  isbn: '',
  title: '',
  description: '',
  authors: '',
  publisher: '',
  category: '',
  language: '',
  sellingPrice: '',
  purchaseCost: '',
  minimumStock: '',
  supplier: '',
  supplierLeadTime: '',
  active: true,
}
const fields: {
  name: Exclude<keyof ProductForm, 'active'>
  label: string
  options?: string[]
  multiline?: boolean
  inputMode?: 'decimal' | 'numeric'
}[] = [
  { name: 'sku', label: 'SKU' },
  { name: 'isbn', label: 'ISBN' },
  { name: 'title', label: 'Titre' },
  { name: 'authors', label: 'Auteurs' },
  { name: 'description', label: 'Description', multiline: true },
  { name: 'publisher', label: 'Éditeur' },
  { name: 'category', label: 'Catégorie' },
  {
    name: 'language',
    label: 'Langue',
    options: ['Français', 'Arabe', 'Anglais'],
  },
  { name: 'supplier', label: 'Fournisseur' },
  { name: 'sellingPrice', label: 'Prix de vente (MAD)', inputMode: 'decimal' },
  { name: 'purchaseCost', label: 'Coût d’achat (MAD)', inputMode: 'decimal' },
  { name: 'minimumStock', label: 'Stock minimum', inputMode: 'numeric' },
  {
    name: 'supplierLeadTime',
    label: 'Délai fournisseur (jours)',
    inputMode: 'numeric',
  },
]

type EditableProduct = {
  imageUrl?: string | null
  sku: string
  isbn?: string | null
  title: string
  description?: string | null
  author: string
  publisher?: string | null
  category: string
  language: string
  price: number
  purchaseCost?: number | null
  threshold: number
  supplier?: string | null
  supplierLeadTime?: number | null
  active: boolean
}

function productFormValues(product?: EditableProduct): ProductForm {
  if (!product) return PRODUCT_FORM_DEFAULTS
  return {
    sku: product.sku,
    isbn: product.isbn ?? '',
    title: product.title,
    description: product.description ?? '',
    authors: product.author === '—' ? '' : product.author,
    publisher: product.publisher ?? '',
    category: product.category,
    language: product.language,
    sellingPrice: product.price.toFixed(2).replace('.', ','),
    purchaseCost: Number(product.purchaseCost ?? 0)
      .toFixed(2)
      .replace('.', ','),
    minimumStock: String(product.threshold),
    supplier: product.supplier ?? '',
    supplierLeadTime: String(product.supplierLeadTime ?? ''),
    active: product.active,
  }
}

export function ProductCreateDialog({
  onClose,
  onCreate,
  product,
  existingSkus = [],
  references,
  onReloadReferences,
}: {
  onClose: () => void
  onCreate?: (values: ProductForm, image: ProductImageChange) => Promise<void>
  product?: EditableProduct
  existingSkus?: string[]
  references: ProductFormReferences
  onReloadReferences?: () => void
}) {
  const isEdit = Boolean(product)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [image, setImage] = useState<ProductImageChange>(undefined)
  const [submitError, setSubmitError] = useState('')
  const optionsByField = {
    category: references.categories.map((item) => item.name),
    publisher: references.publishers.map((item) => item.name),
    supplier: references.suppliers
      .filter((item) => item.active)
      .map((item) => item.name),
  }
  const catalogIncomplete = Object.values(optionsByField).some(
    (options) => options.length === 0
  )
  const form = useForm<ProductForm>({
    resolver: zodResolver(
      productSchema(product?.sku, existingSkus, references)
    ),
    defaultValues: productFormValues(product),
  })
  const dirty = form.formState.isDirty
  const productTitle = useWatch({ control: form.control, name: 'title' })
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  const requestClose = () => (dirty ? setConfirmDiscard(true) : onClose())
  const onSubmit = async (values: ProductForm) => {
    setSubmitError('')
    try {
      await onCreate?.(values, image)
      form.reset()
      toast.success(isEdit ? 'Produit mis à jour' : 'Produit validé', {
        description: isEdit
          ? 'Les modifications ont été enregistrées.'
          : 'Le produit a été enregistré.',
      })
      onClose()
    } catch (error) {
      setSubmitError(submitErrorMessage(error))
    }
  }
  return (
    <>
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) requestClose()
        }}
      >
        <DialogContent className='max-h-[90svh] sm:max-w-3xl'>
          <DialogHeader className='text-start'>
            <DialogTitle>
              {isEdit ? 'Modifier le produit' : 'Créer un produit'}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? `Mettez à jour les informations de ${product?.title}.`
                : 'Ajoutez une référence au catalogue.'}{' '}
              Cliquez sur Enregistrer lorsque vous avez terminé.
            </DialogDescription>
          </DialogHeader>
          <div className='max-h-[65svh] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
            <Form {...form}>
              <form
                id='product-form'
                onSubmit={form.handleSubmit(onSubmit)}
                className='grid grid-cols-1 items-start gap-4! px-0.5 sm:grid-cols-2'
                noValidate
              >
                <ProductImageUpload
                  title={productTitle}
                  currentUrl={product?.imageUrl}
                  value={image}
                  onChange={(next) => {
                    setImage(next)
                    form.setValue('title', form.getValues('title'), {
                      shouldDirty: true,
                    })
                  }}
                />
                {fields.map((config) => (
                  <FormField
                    key={config.name}
                    control={form.control}
                    name={config.name}
                    render={({ field }) => {
                      const options =
                        optionsByField[
                          config.name as keyof typeof optionsByField
                        ] ?? config.options
                      return (
                        <FormItem
                          className={
                            config.multiline
                              ? 'min-w-0 sm:col-span-2'
                              : 'min-w-0'
                          }
                        >
                          <FormLabel>{config.label}</FormLabel>
                          {options ? (
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value)
                                if (config.name === 'supplier') {
                                  const supplier = references.suppliers.find(
                                    (item) => item.name === value
                                  )
                                  if (supplier) {
                                    form.setValue(
                                      'supplierLeadTime',
                                      String(supplier.defaultLeadTimeDays),
                                      {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                      }
                                    )
                                  }
                                }
                              }}
                              disabled={options.length === 0}
                            >
                              <FormControl>
                                <SelectTrigger
                                  className='w-full'
                                  onBlur={field.onBlur}
                                  ref={field.ref}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {options.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <FormControl>
                              {config.multiline ? (
                                <Textarea rows={3} {...field} />
                              ) : (
                                <Input
                                  inputMode={config.inputMode}
                                  autoComplete='off'
                                  {...field}
                                />
                              )}
                            </FormControl>
                          )}
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />
                ))}
                <FormField
                  control={form.control}
                  name='active'
                  render={({ field }) => (
                    <FormItem className='flex items-center gap-3 sm:col-span-2'>
                      <FormLabel>Produit actif</FormLabel>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
          {catalogIncomplete ? (
            <Alert variant='destructive' role='alert'>
              <AlertDescription>
                Les catégories, éditeurs ou fournisseurs sont indisponibles.
                Ajoutez-les au catalogue avant d’enregistrer un produit.
              </AlertDescription>
              {onReloadReferences ? (
                <Button
                  type='button'
                  variant='outline'
                  onClick={onReloadReferences}
                >
                  Recharger les référentiels
                </Button>
              ) : null}
            </Alert>
          ) : null}
          {submitError && (
            <Alert variant='destructive'>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              disabled={form.formState.isSubmitting}
              onClick={requestClose}
            >
              Annuler
            </Button>
            <Button
              type='submit'
              form='product-form'
              disabled={form.formState.isSubmitting || catalogIncomplete}
            >
              {form.formState.isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Modifications non enregistrées</AlertDialogTitle>
            <AlertDialogDescription>
              Les informations saisies seront perdues si vous fermez ce
              formulaire.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuer la modification</AlertDialogCancel>
            <AlertDialogAction onClick={onClose}>
              Quitter sans enregistrer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
