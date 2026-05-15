import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Map,
  Trophy,
  Radar,
  SlidersHorizontal,
  Video,
  Share2,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'

const menuItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
  },
]

const menuGroups = [
  {
    title: 'Mapa Estratégico',
    items: [
      { title: 'Plano de Ação', url: '/mapa/plano-acao', icon: Map },
    ],
  },
  {
    title: 'Análise',
    items: [
      { title: 'Perfil Vencedor', url: '/analise/perfil-vencedor', icon: Trophy },
      { title: 'Radar de Adversários', url: '/analise/radar-adversarios', icon: Radar },
    ],
  },
  {
    title: 'Campanha',
    items: [
      { title: 'Simulador', url: '/campanha/simulador', icon: SlidersHorizontal },
      { title: 'Cortes', url: '/campanha/cortes', icon: Video },
    ],
  },
  {
    title: 'Configurações',
    items: [
      { title: 'Redes Sociais', url: '/configuracoes/redes-sociais', icon: Share2 },
    ],
  },
]

export function AppSidebar() {
  const location = useLocation()

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
                <span className="text-xs text-muted-foreground">CRM Político</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Dashboard - Item avulso */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
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

      <SidebarRail />
    </Sidebar>
  )
}
