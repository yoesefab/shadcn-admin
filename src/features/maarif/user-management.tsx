import { useState } from 'react'
import { z } from 'zod'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UserResponse } from '@/types/api'
import { LoaderCircle, Plus, CheckCircle, CircleOff } from 'lucide-react'
import { administrationApi } from '@/api/administration-api'
import { useSession } from '@/context/session-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { RecordsTable } from './records-table'
import { StatusBadge } from './status-badge'

const roles = {
  ADMINISTRATOR: 'Administrateur',
  MANAGER: 'Gestionnaire',
  STOCK_EMPLOYEE: 'Employé de stock',
}
const schema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Le nom est requis.')
    .max(150, '150 caractères maximum.'),
  email: z.string().trim().email('Adresse e-mail invalide.').max(254),
  password: z
    .string()
    .max(128, '128 caractères maximum.')
    .refine((value) => !value || value.length >= 12, '12 caractères minimum.')
    .refine(
      (value) => !value || /[a-z]/.test(value),
      'Une minuscule est requise.'
    )
    .refine(
      (value) => !value || /[A-Z]/.test(value),
      'Une majuscule est requise.'
    )
    .refine((value) => !value || /\d/.test(value), 'Un chiffre est requis.'),
  role: z.enum(['ADMINISTRATOR', 'MANAGER', 'STOCK_EMPLOYEE']),
  active: z.boolean(),
})
type Values = z.infer<typeof schema>

function UserEditor({
  user,
  onClose,
  onSaved,
}: {
  user: UserResponse | null
  onClose: () => void
  onSaved: () => void
}) {
  const queryClient = useQueryClient()
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
      password: '',
      role: user?.role ?? 'STOCK_EMPLOYEE',
      active: user?.active ?? true,
    },
  })
  const selectedRole = useWatch({ control: form.control, name: 'role' })
  const active = useWatch({ control: form.control, name: 'active' })
  const save = useMutation({
    mutationFn: (values: Values) => {
      const body = { ...values, password: values.password || undefined }
      return user
        ? administrationApi.updateUser(user.id, body)
        : administrationApi.createUser(body)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['administration', 'users'],
      })
      await queryClient.invalidateQueries({ queryKey: ['session'] })
      onSaved()
    },
  })
  const submit = form.handleSubmit((values) => {
    if (!user && !values.password) {
      form.setError('password', { message: 'Le mot de passe est requis.' })
      return
    }
    save.mutate(values)
  })
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !save.isPending) onClose()
      }}
    >
      <DialogContent
        className='max-h-[90svh] overflow-y-auto sm:max-w-lg'
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {user ? 'Modifier l’utilisateur' : 'Créer un utilisateur'}
          </DialogTitle>
          <DialogDescription>
            Renseignez le profil et les droits d’accès au personnel Maarif
            Culture.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className='space-y-5'>
          <fieldset disabled={save.isPending} className='space-y-4'>
            {(['fullName', 'email', 'password'] as const).map((name) => (
              <div key={name} className='space-y-2'>
                <Label htmlFor={`user-${name}`}>
                  {name === 'fullName'
                    ? 'Nom complet'
                    : name === 'email'
                      ? 'Adresse e-mail'
                      : user
                        ? 'Nouveau mot de passe (facultatif)'
                        : 'Mot de passe'}
                </Label>
                <Input
                  id={`user-${name}`}
                  type={
                    name === 'password'
                      ? 'password'
                      : name === 'email'
                        ? 'email'
                        : 'text'
                  }
                  autoComplete={name === 'password' ? 'new-password' : 'off'}
                  aria-invalid={!!form.formState.errors[name]}
                  aria-describedby={`user-${name}-hint`}
                  {...form.register(name)}
                />
                <p
                  id={`user-${name}-hint`}
                  className={
                    form.formState.errors[name]
                      ? 'text-sm text-destructive'
                      : 'text-xs text-muted-foreground'
                  }
                >
                  {form.formState.errors[name]?.message ??
                    (name === 'password'
                      ? user
                        ? 'Laissez vide pour conserver le mot de passe. Sinon, 12 à 128 caractères.'
                        : '12 à 128 caractères.'
                      : '')}
                </p>
              </div>
            ))}
            <div className='space-y-2'>
              <Label htmlFor='user-role'>Rôle</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) =>
                  form.setValue('role', value as Values['role'], {
                    shouldDirty: true,
                  })
                }
                disabled={save.isPending}
              >
                <SelectTrigger id='user-role' className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roles).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='flex items-center justify-between rounded-lg border p-3'>
              <div>
                <Label htmlFor='user-active'>Compte actif</Label>
                <p className='mt-1 text-xs text-muted-foreground'>
                  Un compte désactivé ne peut plus se connecter.
                </p>
              </div>
              <Switch
                id='user-active'
                checked={active}
                onCheckedChange={(value) =>
                  form.setValue('active', value, { shouldDirty: true })
                }
                disabled={save.isPending}
              />
            </div>
          </fieldset>
          {save.isError && (
            <Alert variant='destructive'>
              <AlertDescription>{save.error.message}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              disabled={save.isPending}
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button type='submit' disabled={save.isPending}>
              {save.isPending && (
                <LoaderCircle className='animate-spin' aria-hidden='true' />
              )}
              {save.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function UserManagement() {
  const { user } = useSession()
  const [editor, setEditor] = useState<{ user: UserResponse | null } | null>(
    null
  )
  const [feedback, setFeedback] = useState('')
  const allowed = user?.role === 'ADMINISTRATOR'
  const users = useQuery({
    queryKey: ['administration', 'users', 'all'],
    queryFn: ({ signal }) => administrationApi.allUsers(signal),
    enabled: allowed,
  })
  if (!allowed)
    return (
      <Alert variant='destructive'>
        <AlertDescription>
          La gestion des utilisateurs est réservée aux administrateurs.
        </AlertDescription>
      </Alert>
    )
  return (
    <>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Utilisateurs</h2>
          <p className='text-muted-foreground'>
            Consultez et gérez les comptes et les accès de votre équipe.
          </p>
        </div>
        <Button
          onClick={() => {
            setFeedback('')
            setEditor({ user: null })
          }}
        >
          <Plus />
          Créer un utilisateur
        </Button>
      </div>
      {feedback && (
        <Alert role='status'>
          <AlertDescription>{feedback}</AlertDescription>
        </Alert>
      )}
      {users.isPending ? (
        <p role='status' className='py-8 text-center text-muted-foreground'>
          Chargement des utilisateurs…
        </p>
      ) : users.isError ? (
        <Alert variant='destructive'>
          <AlertDescription>
            {users.error.message}
            <Button variant='outline' onClick={() => void users.refetch()}>
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <RecordsTable
          data={users.data}
          label='Utilisateurs'
          rowId={(row) => String(row.id)}
          rowLabel={(row) => row.fullName}
          searchPlaceholder='Rechercher par nom ou e-mail…'
          fields={[
            {
              key: 'fullName',
              label: 'Nom complet',
              render: (row) => (
                <span className='font-medium'>{row.fullName}</span>
              ),
            },
            { key: 'email', label: 'Adresse e-mail' },
            {
              key: 'role',
              label: 'Rôle',
              value: (row) => roles[row.role],
              filter: true,
              filterOptions: Object.values(roles).map((value) => ({
                label: value,
                value,
              })),
              render: (row) => (
                <Badge variant='outline'>{roles[row.role]}</Badge>
              ),
            },
            {
              key: 'active',
              label: 'Statut',
              value: (row) => (row.active ? 'Actif' : 'Désactivé'),
              filter: true,
              filterOptions: [
                { label: 'Actif', value: 'Actif', icon: CheckCircle },
                { label: 'Désactivé', value: 'Désactivé', icon: CircleOff },
              ],
              render: (row) => (
                <StatusBadge status={row.active ? 'Actif' : 'Désactivé'}>
                  {row.active ? (
                    <CheckCircle data-icon='inline-start' aria-hidden='true' />
                  ) : (
                    <CircleOff data-icon='inline-start' aria-hidden='true' />
                  )}
                  {row.active ? 'Actif' : 'Désactivé'}
                </StatusBadge>
              ),
            },
          ]}
          actions={(row) => [
            {
              label: 'Modifier le compte',
              onClick: () => {
                setFeedback('')
                setEditor({ user: row })
              },
            },
          ]}
        />
      )}
      {editor && (
        <UserEditor
          user={editor.user}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setFeedback(
              editor.user ? 'Utilisateur mis à jour.' : 'Utilisateur créé.'
            )
            setEditor(null)
          }}
        />
      )}
    </>
  )
}
