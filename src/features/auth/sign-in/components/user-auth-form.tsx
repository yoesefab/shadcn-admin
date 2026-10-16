import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { canAccessPath, getDefaultPath } from '@/lib/access-control'
import { cn } from '@/lib/utils'
import { useSession } from '@/context/session-provider'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

const formSchema = z.object({
  email: z.email({
    error: (iss) =>
      iss.input === '' ? 'Saisissez votre adresse e-mail.' : undefined,
  }),
  password: z
    .string()
    .min(1, 'Saisissez votre mot de passe.')
    .min(7, 'Le mot de passe doit contenir au moins 7 caractères.'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const session = useSession()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const user = await session.login(data.email, data.password)
      auth.setUser({
        accountNo: String(user.id),
        email: user.email,
        role: [user.role],
        exp: 0,
      })
      auth.setAccessToken('server-session')
      const defaultPath = getDefaultPath(user.role)
      const destination =
        redirectTo && canAccessPath(user.role, redirectTo)
          ? redirectTo
          : defaultPath
      await navigate({ to: destination, replace: true })
      toast.success(`Bienvenue, ${data.email}`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Une erreur est survenue.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse e-mail</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Se connecter
        </Button>
      </form>
    </Form>
  )
}
