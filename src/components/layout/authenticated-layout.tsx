import { Navigate, Outlet, useLocation } from '@tanstack/react-router'
import {
  canAccessPath,
  getDefaultPath,
  isAuthenticationPath,
} from '@/lib/access-control'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { useSession } from '@/context/session-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const session = useSession()
  const location = useLocation()
  if (session.loading) return null
  if (isAuthenticationPath(location.pathname)) return null
  if (!session.user) {
    return (
      <Navigate to='/sign-in' search={{ redirect: location.href }} replace />
    )
  }
  const defaultPath = getDefaultPath(session.user.role)
  if (location.pathname === '/' && defaultPath !== '/')
    return <Navigate to={defaultPath} replace />
  if (!canAccessPath(session.user.role, location.pathname))
    return <Navigate to='/unauthorized' replace />

  const defaultOpen = getCookie('sidebar_state') !== 'false'
  return (
    <SearchProvider role={session.user.role}>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          <AppSidebar />
          <SidebarInset
            className={cn(
              // Set content container, so we can use container queries
              '@container/content',

              // If layout is fixed, set the height
              // to 100svh to prevent overflow
              'has-data-[layout=fixed]:h-svh',

              // If layout is fixed and sidebar is inset,
              // set the height to 100svh - spacing (total margins) to prevent overflow
              'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
            )}
          >
            {children ?? <Outlet />}
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}
