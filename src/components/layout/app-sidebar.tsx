import { canAccessPath } from '@/lib/access-control'
import { useLayout } from '@/context/layout-provider'
import { useSession } from '@/context/session-provider'
import { useOpenAlertCount } from '@/hooks/use-open-alert-count'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { user } = useSession()
  const openAlerts = useOpenAlertCount()
  const brand = sidebarData.teams[0]
  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size='lg'
              asChild
              className='hover:bg-transparent active:bg-transparent'
            >
              <div>
                <div className='flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                  <brand.logo className='size-4' aria-hidden='true' />
                </div>
                <div className='grid flex-1 text-start text-sm leading-tight group-data-[collapsible=icon]:hidden'>
                  <span className='truncate font-semibold'>{brand.name}</span>
                  <span className='truncate text-xs'>{brand.plan}</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups
          .map((group) => ({
            ...group,
            items: group.items
              .filter(
                (item) =>
                  !user || !item.url || canAccessPath(user.role, item.url)
              )
              .map((item) =>
                item.url === '/alerts' && openAlerts.data
                  ? { ...item, badge: String(openAlerts.data) }
                  : item
              ),
          }))
          .filter((group) => group.items.length > 0)
          .map((props) => (
            <NavGroup key={props.title} {...props} />
          ))}
      </SidebarContent>
      <SidebarFooter>
        {user ? (
          <NavUser
            user={{ name: user.fullName, email: user.email, avatar: '' }}
          />
        ) : null}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
