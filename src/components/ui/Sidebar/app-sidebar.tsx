import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/Sidebar/sidebar";

import {
  UtensilsCrossed,
  Package,
  Users,
  Bot,
  ChevronDown,
  LayoutDashboard,
  CreditCard,
  ShoppingCart,
  Boxes,
  ArrowRightLeft,
  AlertTriangle,
  TrendingUp,
  Contact,
  CalendarDays,
  HeartHandshake,
  Settings,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import sooatelLogo from "@/assets/Sooatel.jpeg";
import utopiaLogo from "@/assets/Utopia.jpeg";
import { useSidebar } from "@/components/ui/Sidebar/hooks/sidebar.hook";

// --- Navigation Data Models ---

export const navigationGroups = [
  {
    title: "Opérations restaurant",
    icon: UtensilsCrossed,
    items: [
      { title: "Tableau de bord", url: "/resto/dashboard", icon: LayoutDashboard },
      { title: "Caisse & PDV", url: "/resto/pos", icon: CreditCard },
      { title: "Achats & Dépenses", url: "/resto/purchases", icon: ShoppingCart },
    ],
  },
  {
    title: "Inventaire & logistique",
    icon: Package,
    items: [
      { title: "Niveaux de Stock", url: "/inventory/stock", icon: Boxes },
      { title: "Mouvements", url: "/inventory/movements", icon: ArrowRightLeft },
      { title: "Audits & Alertes", url: "/inventory/audits", icon: AlertTriangle },
      { title: "Prévisions IA", url: "/inventory/ai", icon: TrendingUp },
    ],
  },
  {
    title: "Ressources humaines",
    icon: Users,
    items: [
      { title: "Annuaire du Personnel", url: "/hr/directory", icon: Contact },
      { title: "Plannings", url: "/hr/schedules", icon: CalendarDays },
      { title: "Bien-être de l'Équipe", url: "/hr/welfare", icon: HeartHandshake },
      { title: "Gestion des Utilisateurs", url: "/hr/users", icon: Users },
      { title: "Rôles et Permissions", url: "/hr/roles", icon: ShieldCheck },
    ],
  },
];

// --- Simple Accordion Wrapper ---
function AccordionMenuItem({ group, activeTab, setActiveTab }: { group: typeof navigationGroups[0], activeTab: string, setActiveTab: (t: string) => void }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={group.title}
        onClick={() => !isCollapsed && setIsOpen(!isOpen)}
        className="justify-between"
      >
        <div className="flex items-center gap-2 min-w-0">
          <group.icon className="size-5 text-primary shrink-0" />
          <span className="font-medium text-sm truncate">{group.title}</span>
        </div>
        {!isCollapsed && (
          <ChevronDown className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        )}
      </SidebarMenuButton>

      {/* When expanded, show submenu if open. In mini mode, the CSS handles hiding it or showing it via Tooltip. */}
      {(!isCollapsed && isOpen) && (
        <SidebarMenuSub>
          {group.items.map((item) => (
            <SidebarMenuSubItem key={item.title}>
              <SidebarMenuSubButton
                isActive={activeTab === item.title}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(item.title);
                }}
                href={item.url}
              >
                <item.icon className="size-4" />
                <span>{item.title}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}

// --- App Sidebar Component ---
interface AppSidebarProps {
  appMode: "utopia" | "sooatel";
  setAppMode: (mode: "utopia" | "sooatel") => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function AppSidebar({ appMode, setAppMode, activeTab, setActiveTab }: AppSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      {/* TOP ZONE: LOGO & CONTEXT SWITCHER */}
      <SidebarHeader className="border-b border-border pb-4 mb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={() => setAppMode(appMode === "utopia" ? "sooatel" : "utopia")}
              className="bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
              tooltip={`Basculer vers ${appMode === "utopia" ? "Hôtel Sooatel" : "Restaurant Utopia"}`}
            >
              <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground overflow-hidden">
                {appMode === "utopia" ? (
                  <img src={utopiaLogo} alt="Logo Utopia" className="size-full object-cover" />
                ) : (
                  <img src={sooatelLogo} alt="Logo Sooatel" className="size-full object-cover" />
                )}
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-bold text-sm">
                      {appMode === "utopia" ? "Restaurant Utopia" : "Hôtel Sooatel"}
                    </span>
                    {/* <span className="text-[10px] opacity-70 uppercase tracking-wider">Sélecteur de contexte</span> */}
                  </div>
                  <ChevronRight className="ml-auto size-4 shrink-0" />
                </>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* MIDDLE ZONE: DYNAMIC NAVIGATION GROUPS */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : "text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2"}>
            Départements
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationGroups.map((group) => (
                <AccordionMenuItem
                  key={group.title}
                  group={group}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* BOTTOM ZONE: FIXED UTILITIES */}
      <SidebarFooter className="border-t border-border pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Assistant IA">
              <Bot className="size-5 text-accent" />
              <span>Assistant IA</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="mt-2 bg-card border border-border shadow-sm">
              <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <Users className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold text-sm">Administrateur</span>
                <span className="text-xs text-muted-foreground">Super-administrateur</span>
              </div>
              <Settings className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
