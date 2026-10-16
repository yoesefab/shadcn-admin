import { useEffect, useState } from 'react'
import {
  Archive,
  ChartLineUp,
  CheckCircle,
  CircleNotch,
  CloudArrowUp,
  FloppyDisk,
  GearSix,
  Shield,
  UserPlus,
  X,
} from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { RecordsTable } from '@/features/maarif/records-table'
import { StatusBadge } from '@/features/maarif/status-badge'
import { frenchDateOrder } from '@/features/maarif/table-format'
import { TablePageHeading, TableFeedback } from '@/features/maarif/table-page'

function ErrorMessage({ id, children }) {
  return (
    <p id={id} role='alert' className='text-sm text-destructive'>
      {children}
    </p>
  )
}

const ADMIN_USERS = [
  {
    id: 'USR-001',
    fullName: 'Nadia El Mansouri',
    email: 'nadia.elmansouri@maarifculture.ma',
    role: 'Administrateur',
    active: true,
    createdAt: '12 février 2024 à 09:15',
  },
  {
    id: 'USR-002',
    fullName: 'Youssef Alaoui',
    email: 'youssef.alaoui@maarifculture.ma',
    role: 'Gestionnaire',
    active: true,
    createdAt: '03 avril 2024 à 11:42',
  },
  {
    id: 'USR-003',
    fullName: 'Salma Berrada',
    email: 'salma.berrada@maarifculture.ma',
    role: 'Employé de stock',
    active: true,
    createdAt: '21 mai 2024 à 08:30',
  },
  {
    id: 'USR-004',
    fullName: 'Omar Idrissi',
    email: 'omar.idrissi@maarifculture.ma',
    role: 'Employé de stock',
    active: false,
    createdAt: '14 juin 2024 à 15:18',
  },
  {
    id: 'USR-005',
    fullName: 'Imane Benjelloun',
    email: 'imane.benjelloun@maarifculture.ma',
    role: 'Gestionnaire',
    active: true,
    createdAt: '09 septembre 2024 à 10:06',
  },
  {
    id: 'USR-006',
    fullName: 'Amine Chraïbi',
    email: 'amine.chraibi@maarifculture.ma',
    role: 'Employé de stock',
    active: true,
    createdAt: '18 novembre 2024 à 14:37',
  },
  {
    id: 'USR-007',
    fullName: 'Sara El Fassi',
    email: 'sara.elfassi@maarifculture.ma',
    role: 'Gestionnaire',
    active: false,
    createdAt: '06 janvier 2025 à 16:25',
  },
  {
    id: 'USR-008',
    fullName: 'Mehdi Tazi',
    email: 'mehdi.tazi@maarifculture.ma',
    role: 'Employé de stock',
    active: true,
    createdAt: '27 février 2025 à 09:54',
  },
  {
    id: 'USR-009',
    fullName: 'Khadija Aït Lahcen',
    email: 'khadija.aitlahcen@maarifculture.ma',
    role: 'Employé de stock',
    active: true,
    createdAt: '15 avril 2025 à 13:12',
  },
  {
    id: 'USR-010',
    fullName: 'Anas Lahlou',
    email: 'anas.lahlou@maarifculture.ma',
    role: 'Gestionnaire',
    active: true,
    createdAt: '02 juin 2025 à 10:48',
  },
  {
    id: 'USR-011',
    fullName: 'Meryem Skalli',
    email: 'meryem.skalli@maarifculture.ma',
    role: 'Administrateur',
    active: true,
    createdAt: '19 septembre 2025 à 08:40',
  },
  {
    id: 'USR-012',
    fullName: 'Hicham Amrani',
    email: 'hicham.amrani@maarifculture.ma',
    role: 'Employé de stock',
    active: false,
    createdAt: '11 mars 2026 à 17:03',
  },
]

function AdminRoleBadge({ role }) {
  return (
    <Badge variant='outline'>
      <Shield />
      {role}
    </Badge>
  )
}
function AdminStatusBadge({ active }) {
  return <StatusBadge status={active ? 'Actif' : 'Inactif'} />
}

function AdminConfirmDialog({ action, onCancel, onConfirm }) {
  const [isSaving, setIsSaving] = useState(false)
  const [nextRole, setNextRole] = useState(
    action.user.role === 'Administrateur' ? 'Gestionnaire' : 'Administrateur'
  )
  const isRole = action.type === 'role'
  const isPassword = action.type === 'password'
  const isDeactivate = action.type === 'status' && action.user.active

  const title = isRole
    ? 'Confirmer le changement de rôle'
    : isPassword
      ? 'Réinitialiser le mot de passe ?'
      : isDeactivate
        ? 'Désactiver ce compte ?'
        : 'Réactiver ce compte ?'
  const confirmLabel = isRole
    ? 'Changer le rôle'
    : isPassword
      ? 'Réinitialiser'
      : isDeactivate
        ? 'Désactiver'
        : 'Réactiver'

  const submit = () => {
    setIsSaving(true)
    window.setTimeout(() => onConfirm(isRole ? nextRole : undefined), 620)
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !isSaving) onCancel()
      }}
    >
      <DialogContent
        className='max-h-[90svh] overflow-y-auto'
        showCloseButton={!isSaving}
        onEscapeKeyDown={(event) => {
          if (isSaving) event.preventDefault()
        }}
        onPointerDownOutside={(event) => {
          if (isSaving) event.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {action.user.fullName} · {action.user.email}
          </DialogDescription>
        </DialogHeader>
        {isRole ? (
          <div className='space-y-3'>
            <p className='text-sm text-muted-foreground'>
              Ce changement modifie immédiatement les autorisations de
              l’utilisateur.
            </p>
            <label className='space-y-2 text-sm font-medium'>
              <span>Nouveau rôle</span>
              <Select
                value={nextRole}
                onValueChange={setNextRole}
                disabled={isSaving}
              >
                <SelectTrigger aria-label='Nouveau rôle' className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Administrateur', 'Gestionnaire', 'Employé de stock'].map(
                    (role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </label>
          </div>
        ) : (
          <p className='text-sm text-muted-foreground'>
            {isPassword
              ? 'Le mot de passe actuel sera invalidé. L’utilisateur devra utiliser les nouvelles informations de connexion transmises par l’administrateur.'
              : isDeactivate
                ? 'L’utilisateur ne pourra plus se connecter tant que son compte restera inactif.'
                : 'L’utilisateur retrouvera immédiatement l’accès correspondant à son rôle actuel.'}
          </p>
        )}
        <div className='flex flex-wrap justify-end gap-2'>
          <Button variant='outline' disabled={isSaving} onClick={onCancel}>
            Annuler
          </Button>
          <Button
            variant={isDeactivate || isPassword ? 'destructive' : 'default'}
            disabled={isSaving}
            onClick={submit}
          >
            {isSaving && <CircleNotch className='animate-spin' />}
            {isSaving ? 'Enregistrement…' : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CreateAdminUserDialog({ onCancel, onCreate }) {
  const [values, setValues] = useState({
    fullName: '',
    email: '',
    role: 'Employé de stock',
  })
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  const update = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }))
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const submit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!values.fullName.trim())
      nextErrors.fullName = 'Le nom complet est requis.'
    if (!EMAIL_PATTERN.test(values.email.trim()))
      nextErrors.email = 'Saisissez une adresse e-mail valide.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setIsSaving(true)
    window.setTimeout(() => onCreate(values), 620)
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !isSaving) onCancel()
      }}
    >
      <DialogContent
        className='max-h-[90svh] overflow-y-auto sm:max-w-2xl'
        showCloseButton={!isSaving}
        onEscapeKeyDown={(event) => {
          if (isSaving) event.preventDefault()
        }}
        onPointerDownOutside={(event) => {
          if (isSaving) event.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>Créer un utilisateur</DialogTitle>
          <DialogDescription>
            Le compte sera actif dès sa création.
          </DialogDescription>
        </DialogHeader>
        <form
          className='grid gap-4! sm:grid-cols-2 [&>footer]:sm:col-span-2 [&>label]:space-y-2 [&>label]:text-sm [&>label]:font-medium'
          noValidate
          onSubmit={submit}
        >
          <label>
            <span>Nom complet</span>
            <Input
              aria-describedby={
                errors.fullName ? 'admin-full-name-error' : undefined
              }
              aria-invalid={Boolean(errors.fullName)}
              autoFocus
              onChange={(event) => update('fullName', event.target.value)}
              placeholder='Prénom et nom'
              value={values.fullName}
            />
            {errors.fullName ? (
              <ErrorMessage id='admin-full-name-error'>
                {errors.fullName}
              </ErrorMessage>
            ) : null}
          </label>
          <label>
            <span>Adresse e-mail professionnelle</span>
            <Input
              aria-describedby={errors.email ? 'admin-email-error' : undefined}
              aria-invalid={Boolean(errors.email)}
              onChange={(event) => update('email', event.target.value)}
              placeholder='prenom.nom@maarifculture.ma'
              type='email'
              value={values.email}
            />
            {errors.email ? (
              <ErrorMessage id='admin-email-error'>{errors.email}</ErrorMessage>
            ) : null}
          </label>
          <label>
            <span>Rôle</span>
            <span className='block'>
              <Select
                value={values.role}
                onValueChange={(value) => update('role', value)}
              >
                <SelectTrigger
                  aria-label='Rôle du nouvel utilisateur'
                  className='w-full'
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Administrateur'>Administrateur</SelectItem>
                  <SelectItem value='Gestionnaire'>Gestionnaire</SelectItem>
                  <SelectItem value='Employé de stock'>
                    Employé de stock
                  </SelectItem>
                </SelectContent>
              </Select>
            </span>
          </label>
          <div className='flex items-start gap-3 rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground sm:col-span-2 [&>svg]:size-5 [&>svg]:shrink-0'>
            <Shield aria-hidden='true' />
            <p>
              <strong>Accès accordé selon le rôle choisi.</strong> Les
              autorisations pourront être modifiées ultérieurement.
            </p>
          </div>
          <footer className='flex flex-wrap justify-end gap-2'>
            <Button
              variant='outline'
              disabled={isSaving}
              onClick={onCancel}
              type='button'
            >
              Annuler
            </Button>
            <Button variant='default' disabled={isSaving} type='submit'>
              {isSaving ? (
                <>
                  <CircleNotch
                    aria-hidden='true'
                    className='size-4 animate-spin'
                  />
                  Création…
                </>
              ) : (
                <>
                  <UserPlus aria-hidden='true' />
                  Créer l’utilisateur
                </>
              )}
            </Button>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function UserManagementPage() {
  const [users, setUsers] = useState(ADMIN_USERS)
  const [dialog, setDialog] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [feedback, setFeedback] = useState('')
  const confirmAction = (nextRole) => {
    const { type, user } = dialog
    if (type === 'role') {
      setUsers((current) =>
        current.map((item) =>
          item.id === user.id ? { ...item, role: nextRole } : item
        )
      )
      setFeedback('Rôle de ' + user.fullName + ' modifié : ' + nextRole + '.')
    } else if (type === 'status') {
      setUsers((current) =>
        current.map((item) =>
          item.id === user.id ? { ...item, active: !item.active } : item
        )
      )
      setFeedback(
        'Compte de ' +
          user.fullName +
          (user.active ? ' désactivé.' : ' réactivé.')
      )
    } else
      setFeedback(
        'Mot de passe de ' + user.fullName + ' réinitialisé avec succès.'
      )
    setDialog(null)
  }
  const createUser = (values) => {
    setUsers((current) => [
      {
        id: 'USR-' + String(current.length + 1).padStart(3, '0'),
        ...values,
        active: true,
        createdAt: '27 août 2026 à 22:45',
      },
      ...current,
    ])
    setShowCreate(false)
    setFeedback('Utilisateur ' + values.fullName + ' créé avec succès.')
  }
  return (
    <div className='flex min-w-0 flex-col gap-6'>
      <TablePageHeading
        title='Utilisateurs'
        description='Gérez les comptes et les autorisations de Maarif Analytics.'
      >
        <Button onClick={() => setShowCreate(true)}>
          <UserPlus />
          Créer un utilisateur
        </Button>
      </TablePageHeading>
      <TableFeedback message={feedback} onDismiss={() => setFeedback('')} />
      <RecordsTable
        label='Utilisateurs'
        data={users}
        rowId={(row) => row.id}
        rowLabel={(row) => row.fullName}
        searchPlaceholder='Rechercher un nom ou une adresse e-mail…'
        fields={[
          {
            key: 'fullName',
            label: 'Nom complet',
            render: (row) => (
              <span className='font-medium'>{row.fullName}</span>
            ),
          },
          { key: 'id', label: 'Identifiant', hidden: true },
          {
            key: 'email',
            label: 'Adresse e-mail',
            render: (row) => <a href={'mailto:' + row.email}>{row.email}</a>,
          },
          {
            key: 'role',
            label: 'Rôle',
            filter: true,
            render: (row) => <Badge variant='outline'>{row.role}</Badge>,
          },
          {
            key: 'active',
            label: 'Statut',
            filter: true,
            value: (row) => (row.active ? 'Actif' : 'Inactif'),
            render: (row) => (
              <StatusBadge status={row.active ? 'Actif' : 'Inactif'} />
            ),
          },
          {
            key: 'createdAt',
            label: 'Créé le',
            value: (row) => frenchDateOrder(row.createdAt),
            render: (row) => row.createdAt,
          },
        ]}
        actions={(user) => [
          {
            label: 'Changer le rôle',
            onClick: () => setDialog({ type: 'role', user }),
          },
          {
            label: user.active ? 'Désactiver le compte' : 'Réactiver le compte',
            onClick: () => setDialog({ type: 'status', user }),
            variant: user.active ? 'destructive' : 'default',
          },
          {
            label: 'Réinitialiser le mot de passe',
            onClick: () => setDialog({ type: 'password', user }),
          },
        ]}
      />
      {dialog && (
        <AdminConfirmDialog
          action={dialog}
          onCancel={() => setDialog(null)}
          onConfirm={confirmAction}
        />
      )}
      {showCreate && (
        <CreateAdminUserDialog
          onCancel={() => setShowCreate(false)}
          onCreate={createUser}
        />
      )}
    </div>
  )
}

const DEFAULT_SYSTEM_SETTINGS = {
  timezone: 'Africa/Casablanca',
  forecastHistoryWeeks: '12',
  minimumStock: '5',
  safetyStock: '7',
  importMaxSizeMb: '10',
  importMaxRows: '5000',
}

function SystemSettingsSection({ onSave, settingsData }) {
  const initialSettings = { ...DEFAULT_SYSTEM_SETTINGS, ...settingsData }
  const [settings, setSettings] = useState(initialSettings)
  const [savedSettings, setSavedSettings] = useState(initialSettings)
  const [saveState, setSaveState] = useState('idle')
  const [errors, setErrors] = useState({})
  const isDirty = Object.keys(settings).some(
    (key) => settings[key] !== savedSettings[key]
  )
  useEffect(() => {
    if (!settingsData) return
    const next = { ...DEFAULT_SYSTEM_SETTINGS, ...settingsData }
    setSettings(next)
    setSavedSettings(next)
  }, [settingsData])

  const update = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }))
    setSaveState('idle')
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const save = async (event) => {
    event.preventDefault()
    const limits = {
      forecastHistoryWeeks: [
        4,
        104,
        'L’historique doit être compris entre 4 et 104 semaines.',
      ],
      minimumStock: [
        0,
        999,
        'Le stock minimum doit être compris entre 0 et 999.',
      ],
      safetyStock: [
        0,
        999,
        'Le stock de sécurité doit être compris entre 0 et 999.',
      ],
      importMaxSizeMb: [
        1,
        50,
        'La taille maximale doit être comprise entre 1 et 50 Mo.',
      ],
      importMaxRows: [
        100,
        25000,
        'La limite doit être comprise entre 100 et 25 000 lignes.',
      ],
    }
    const nextErrors = Object.fromEntries(
      Object.entries(limits).flatMap(([key, [min, max, message]]) => {
        const value = Number(settings[key])
        return Number.isFinite(value) && value >= min && value <= max
          ? []
          : [[key, message]]
      })
    )
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setSaveState('saving')
    try {
      await onSave?.(settings)
      setSavedSettings(settings)
      setSaveState('success')
    } catch {
      setSaveState('idle')
    }
  }

  return (
    <form className='grid gap-6! md:grid-cols-2' noValidate onSubmit={save}>
      {saveState === 'success' ? (
        <div
          className='flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700 md:col-span-2 dark:border-green-900 dark:bg-green-950 dark:text-green-300 [&>span]:flex-1 [&>svg]:size-5'
          role='status'
        >
          <CheckCircle aria-hidden='true' weight='fill' />
          <span>Paramètres système enregistrés avec succès.</span>
          <Button
            aria-label='Fermer le message'
            onClick={() => setSaveState('idle')}
            type='button'
          >
            <X aria-hidden='true' />
          </Button>
        </div>
      ) : null}

      <Card aria-labelledby='timezone-settings-title' className='gap-6 p-6'>
        <CardHeader className='flex items-start gap-3 p-0 [&_p]:mt-2 [&_p]:text-sm [&_p]:text-muted-foreground [&_svg]:size-5'>
          <span>
            <GearSix aria-hidden='true' />
          </span>
          <div>
            <CardTitle id='timezone-settings-title'>
              Fuseau horaire métier
            </CardTitle>
            <p>
              Utilisé pour les dates affichées et les regroupements quotidiens.
            </p>
          </div>
        </CardHeader>
        <label className='block space-y-2 text-sm font-medium [&_small]:block [&_small]:font-normal [&_small]:text-muted-foreground'>
          <span>Fuseau horaire</span>
          <span className='block'>
            <Select
              value={settings.timezone}
              onValueChange={(value) => update('timezone', value)}
            >
              <SelectTrigger
                aria-label='Fuseau horaire métier'
                className='w-full'
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Africa/Casablanca'>
                  Africa/Casablanca
                </SelectItem>
              </SelectContent>
            </Select>
          </span>
          <small>Les instants restent stockés en UTC.</small>
        </label>
      </Card>

      <Card aria-labelledby='forecast-settings-title' className='gap-6 p-6'>
        <CardHeader className='flex items-start gap-3 p-0 [&_p]:mt-2 [&_p]:text-sm [&_p]:text-muted-foreground [&_svg]:size-5'>
          <span>
            <ChartLineUp aria-hidden='true' />
          </span>
          <div>
            <CardTitle id='forecast-settings-title'>
              Historique des prévisions
            </CardTitle>
            <p>
              Définit la quantité minimale de données requise avant de générer
              une prévision.
            </p>
          </div>
        </CardHeader>
        <label className='block space-y-2 text-sm font-medium [&_small]:block [&_small]:font-normal [&_small]:text-muted-foreground'>
          <span>Historique hebdomadaire minimum</span>
          <span className='flex items-center gap-3 [&_em]:w-20 [&_em]:shrink-0 [&_em]:text-xs [&_em]:font-normal [&_em]:text-muted-foreground [&_em]:not-italic [&_input]:min-w-0'>
            <Input
              aria-describedby={
                errors.forecastHistoryWeeks
                  ? 'forecast-history-error'
                  : 'forecast-history-help'
              }
              aria-invalid={Boolean(errors.forecastHistoryWeeks)}
              inputMode='numeric'
              min='4'
              onChange={(event) =>
                update('forecastHistoryWeeks', event.target.value)
              }
              type='number'
              value={settings.forecastHistoryWeeks}
            />
            <em>semaines</em>
          </span>
          {errors.forecastHistoryWeeks ? (
            <ErrorMessage id='forecast-history-error'>
              {errors.forecastHistoryWeeks}
            </ErrorMessage>
          ) : (
            <small id='forecast-history-help'>
              Valeur recommandée : 12 semaines.
            </small>
          )}
        </label>
      </Card>

      <Card
        aria-labelledby='stock-settings-title'
        className='gap-6 p-6 md:col-span-2'
      >
        <CardHeader className='flex items-start gap-3 p-0 [&_p]:mt-2 [&_p]:text-sm [&_p]:text-muted-foreground [&_svg]:size-5'>
          <span>
            <Archive aria-hidden='true' />
          </span>
          <div>
            <CardTitle id='stock-settings-title'>
              Valeurs par défaut du stock
            </CardTitle>
            <p>
              Proposées lors de la création d’un produit et modifiables produit
              par produit.
            </p>
          </div>
        </CardHeader>
        <div className='grid gap-6 sm:grid-cols-2'>
          <label className='block space-y-2 text-sm font-medium [&_small]:block [&_small]:font-normal [&_small]:text-muted-foreground'>
            <span>Seuil de stock minimum</span>
            <span className='flex items-center gap-3 [&_em]:w-20 [&_em]:shrink-0 [&_em]:text-xs [&_em]:font-normal [&_em]:text-muted-foreground [&_em]:not-italic [&_input]:min-w-0'>
              <Input
                aria-describedby={
                  errors.minimumStock ? 'minimum-stock-error' : undefined
                }
                aria-invalid={Boolean(errors.minimumStock)}
                inputMode='numeric'
                min='0'
                onChange={(event) => update('minimumStock', event.target.value)}
                type='number'
                value={settings.minimumStock}
              />
              <em>unités</em>
            </span>
            {errors.minimumStock ? (
              <ErrorMessage id='minimum-stock-error'>
                {errors.minimumStock}
              </ErrorMessage>
            ) : null}
          </label>
          <label className='block space-y-2 text-sm font-medium [&_small]:block [&_small]:font-normal [&_small]:text-muted-foreground'>
            <span>Stock de sécurité</span>
            <span className='flex items-center gap-3 [&_em]:w-20 [&_em]:shrink-0 [&_em]:text-xs [&_em]:font-normal [&_em]:text-muted-foreground [&_em]:not-italic [&_input]:min-w-0'>
              <Input
                aria-describedby={
                  errors.safetyStock ? 'safety-stock-error' : undefined
                }
                aria-invalid={Boolean(errors.safetyStock)}
                inputMode='numeric'
                min='0'
                onChange={(event) => update('safetyStock', event.target.value)}
                type='number'
                value={settings.safetyStock}
              />
              <em>unités</em>
            </span>
            {errors.safetyStock ? (
              <ErrorMessage id='safety-stock-error'>
                {errors.safetyStock}
              </ErrorMessage>
            ) : null}
          </label>
        </div>
      </Card>

      <Card
        aria-labelledby='import-settings-title'
        className='gap-6 p-6 md:col-span-2'
      >
        <CardHeader className='flex items-start gap-3 p-0 [&_p]:mt-2 [&_p]:text-sm [&_p]:text-muted-foreground [&_svg]:size-5'>
          <span>
            <CloudArrowUp aria-hidden='true' />
          </span>
          <div>
            <CardTitle id='import-settings-title'>
              Limites des fichiers d’import
            </CardTitle>
            <p>Appliquées aux fichiers CSV de ventes avant validation.</p>
          </div>
        </CardHeader>
        <div className='grid gap-6 sm:grid-cols-2'>
          <label className='block space-y-2 text-sm font-medium [&_small]:block [&_small]:font-normal [&_small]:text-muted-foreground'>
            <span>Taille maximale du fichier</span>
            <span className='flex items-center gap-3 [&_em]:w-20 [&_em]:shrink-0 [&_em]:text-xs [&_em]:font-normal [&_em]:text-muted-foreground [&_em]:not-italic [&_input]:min-w-0'>
              <Input
                aria-describedby={
                  errors.importMaxSizeMb ? 'import-size-error' : undefined
                }
                aria-invalid={Boolean(errors.importMaxSizeMb)}
                inputMode='numeric'
                min='1'
                onChange={(event) =>
                  update('importMaxSizeMb', event.target.value)
                }
                type='number'
                value={settings.importMaxSizeMb}
              />
              <em>Mo</em>
            </span>
            {errors.importMaxSizeMb ? (
              <ErrorMessage id='import-size-error'>
                {errors.importMaxSizeMb}
              </ErrorMessage>
            ) : null}
          </label>
          <label className='block space-y-2 text-sm font-medium [&_small]:block [&_small]:font-normal [&_small]:text-muted-foreground'>
            <span>Nombre maximal de lignes</span>
            <span className='flex items-center gap-3 [&_em]:w-20 [&_em]:shrink-0 [&_em]:text-xs [&_em]:font-normal [&_em]:text-muted-foreground [&_em]:not-italic [&_input]:min-w-0'>
              <Input
                aria-describedby={
                  errors.importMaxRows ? 'import-rows-error' : undefined
                }
                aria-invalid={Boolean(errors.importMaxRows)}
                inputMode='numeric'
                min='100'
                onChange={(event) =>
                  update('importMaxRows', event.target.value)
                }
                type='number'
                value={settings.importMaxRows}
              />
              <em>lignes</em>
            </span>
            {errors.importMaxRows ? (
              <ErrorMessage id='import-rows-error'>
                {errors.importMaxRows}
              </ErrorMessage>
            ) : null}
          </label>
        </div>
      </Card>

      <footer className='flex flex-wrap items-center justify-between gap-3 md:col-span-2 [&_p]:text-sm [&_p]:text-muted-foreground'>
        <p aria-live='polite'>
          {isDirty ? 'Modifications non enregistrées' : 'Paramètres à jour'}
        </p>
        <Button
          variant='default'
          disabled={!isDirty || saveState === 'saving'}
          type='submit'
        >
          {saveState === 'saving' ? (
            <CircleNotch aria-hidden='true' className='size-4 animate-spin' />
          ) : (
            <FloppyDisk aria-hidden='true' />
          )}
          {saveState === 'saving'
            ? 'Enregistrement…'
            : 'Enregistrer les paramètres'}
        </Button>
      </footer>
    </form>
  )
}

export function AdministrationPage({ onSave, settings }) {
  return (
    <div className='flex min-w-0 flex-col gap-6'>
      <TablePageHeading
        title='Administration'
        description='Gérez les paramètres système et les règles communes.'
      />
      <SystemSettingsSection onSave={onSave} settingsData={settings} />
    </div>
  )
}
