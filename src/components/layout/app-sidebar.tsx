import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Map,
  Trophy,
  Users,
  LogOut,
  Sparkles,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { CampaignSwitcher } from '@/features/auth/components/CampaignSwitcher'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Button } from '@/components/ui/button'

// Menu com apenas as paginas funcionais (dados reais)
const menuGroups = [
  {
    title: 'Diagnostico',
    items: [
      { title: 'Diagnostico Estrategico', url: '/diagnostico', icon: Sparkles },
    ],
  },
  {
    title: 'Mapa Estrategico',
    items: [
      { title: 'Plano de Acao', url: '/mapa/plano-acao', icon: Map },
    ],
  },
  {
    title: 'Analise',
    items: [
      { title: 'Perfil Vencedor', url: '/analise/perfil-vencedor', icon: Trophy },
      // @deprecated - Radar de Adversarios usa mock data, escondido do menu
      // { title: 'Radar de Adversarios', url: '/analise/radar-adversarios', icon: Radar },
    ],
  },
  // @deprecated - Simulador e Cortes usam mock data, escondidos do menu
  // {
  //   title: 'Campanha',
  //   items: [
  //     { title: 'Simulador', url: '/campanha/simulador', icon: SlidersHorizontal },
  //     { title: 'Cortes', url: '/campanha/cortes', icon: Video },
  //   ],
  // },
  {
    title: 'Configuracoes',
    items: [
      { title: 'Equipe', url: '/configuracoes/equipe', icon: Users },
      // @deprecated - Redes Sociais usa mock data, escondido do menu
      // { title: 'Redes Sociais', url: '/configuracoes/redes-sociais', icon: Share2 },
    ],
  },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut, user } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="ElegeHub"
              render={<Link to="/" />}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="font-bold text-lg">E</span>
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">ElegeHub</span>
                <span className="text-xs text-muted-foreground">CRM Politico</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Seletor de Campanha */}
        <CampaignSwitcher />
      </SidebarHeader>

      <SidebarContent>
        {/* Grupos de menu */}
        {menuGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      isActive={location.pathname === item.url}
                      tooltip={item.title}
                      render={<Link to={item.url} />}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="flex-1 truncate group-data-[collapsible=icon]:hidden">
                <p className="truncate text-sm font-medium">{user?.email || 'Usuario'}</p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleSignOut}
                className="group-data-[collapsible=icon]:hidden"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
