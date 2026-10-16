import { useState, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { KeyRound, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { authApi } from '@/api/auth-api'
import { ApiError } from '@/api/client'
import { useSession } from '@/context/session-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'

const roleLabels = {
  ADMINISTRATOR: 'Administrateur',
  MANAGER: 'Gestionnaire',
  STOCK_EMPLOYEE: 'Employé de stock',
} as const

function errorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : 'Une erreur inattendue est survenue.'
}

export function ProfilePage() {
  const { user } = useSession()
  const queryClient = useQueryClient()
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [profileError, setProfileError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  if (!user) return null
  const initials = user.fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toLocaleUpperCase('fr')

  async function saveProfile(event: FormEvent) {
    event.preventDefault()
    setProfileError('')
    setSavingProfile(true)
    try {
      const updated = await authApi.updateProfile({
        fullName: fullName.trim(),
        email: email.trim(),
      })
      queryClient.setQueryData(['session'], updated)
      setFullName(updated.fullName)
      setEmail(updated.email)
      toast.success('Vos informations ont été mises à jour.')
    } catch (error) {
      setProfileError(errorMessage(error))
    } finally {
      setSavingProfile(false)
    }
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault()
    setPasswordError('')
    if (newPassword.length < 12) {
      setPasswordError(
        'Le nouveau mot de passe doit contenir au moins 12 caractères.'
      )
      return
    }
    if (newPassword !== confirmation) {
      setPasswordError(
        'La confirmation ne correspond pas au nouveau mot de passe.'
      )
      return
    }
    setSavingPassword(true)
    try {
      await authApi.updatePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmation('')
      toast.success('Votre mot de passe a été modifié.')
    } catch (error) {
      setPasswordError(errorMessage(error))
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <>
      <Header fixed>
        <p className='text-sm font-semibold'>Espace personnel</p>
      </Header>
      <Main className='space-y-6'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Mon profil</h1>
          <p className='text-muted-foreground'>
            Gérez vos informations personnelles et la sécurité de votre compte.
          </p>
        </div>

        <section className='flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center'>
          <Avatar className='size-16'>
            <AvatarFallback className='bg-emerald-700 text-lg font-semibold text-white'>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0 flex-1'>
            <h2 className='truncate text-2xl font-bold tracking-tight'>
              {user.fullName}
            </h2>
            <p className='truncate text-sm text-muted-foreground'>
              {user.email}
            </p>
          </div>
          <div className='inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'>
            <ShieldCheck className='size-4' /> {roleLabels[user.role]}
          </div>
        </section>

        <div className='grid gap-6 lg:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <UserRound className='size-5 text-emerald-700' /> Informations
                personnelles
              </CardTitle>
              <CardDescription>
                Ces informations sont affichées dans votre espace de travail.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className='space-y-5' onSubmit={saveProfile}>
                {profileError && (
                  <Alert variant='destructive'>
                    <AlertDescription>{profileError}</AlertDescription>
                  </Alert>
                )}
                <div className='space-y-2'>
                  <Label htmlFor='profile-name'>Nom complet</Label>
                  <div className='relative'>
                    <UserRound className='absolute start-3 top-2.5 size-4 text-muted-foreground' />
                    <Input
                      id='profile-name'
                      className='ps-9'
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      maxLength={150}
                      required
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='profile-email'>Adresse e-mail</Label>
                  <div className='relative'>
                    <Mail className='absolute start-3 top-2.5 size-4 text-muted-foreground' />
                    <Input
                      id='profile-email'
                      className='ps-9'
                      type='email'
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      maxLength={254}
                      required
                    />
                  </div>
                </div>
                <Separator />
                <Button
                  type='submit'
                  disabled={savingProfile || !fullName.trim() || !email.trim()}
                >
                  {savingProfile
                    ? 'Enregistrement…'
                    : 'Enregistrer les informations'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <KeyRound className='size-5 text-emerald-700' /> Sécurité
              </CardTitle>
              <CardDescription>
                Utilisez au moins 12 caractères pour protéger votre compte.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className='space-y-5' onSubmit={savePassword}>
                {passwordError && (
                  <Alert variant='destructive'>
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}
                <div className='space-y-2'>
                  <Label htmlFor='current-password'>Mot de passe actuel</Label>
                  <Input
                    id='current-password'
                    type='password'
                    autoComplete='current-password'
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='new-password'>Nouveau mot de passe</Label>
                  <Input
                    id='new-password'
                    type='password'
                    autoComplete='new-password'
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    minLength={12}
                    maxLength={128}
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='confirm-password'>
                    Confirmer le nouveau mot de passe
                  </Label>
                  <Input
                    id='confirm-password'
                    type='password'
                    autoComplete='new-password'
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    minLength={12}
                    maxLength={128}
                    required
                  />
                </div>
                <Separator />
                <Button
                  type='submit'
                  disabled={
                    savingPassword ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmation
                  }
                >
                  {savingPassword
                    ? 'Modification…'
                    : 'Modifier le mot de passe'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
