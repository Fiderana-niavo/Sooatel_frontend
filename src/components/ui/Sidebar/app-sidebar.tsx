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
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  KeyRound,
  LogOut,
  Bot
} from "lucide-react";
import { NAVIGATION_GROUPS } from "@/constants/app.constants";
import sooatelLogo from "@/assets/Sooatel.jpeg";
import utopiaLogo from "@/assets/Utopia.jpeg";
import { useSidebar } from "@/components/ui/Sidebar/hooks/sidebar.hook";
import { useAppStore } from "@/store/app.store";
import { ChangePasswordModal } from "@/features/auth/components/ChangePasswordModal";
import { AuthService } from "@/features/auth/services/auth.service";
import { Snackbar, type SnackbarType } from "@/components/ui/Snackbar/snackbar";

// --- Navigation Data Models ---

// --- Simple Accordion Wrapper ---
function AccordionMenuItem({ group, activeTab, setActiveTab }: { group: typeof NAVIGATION_GROUPS[0], activeTab: string, setActiveTab: (t: string) => void }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const hasPermission = useAppStore((s) => s.hasPermission);

  const visibleItems = group.items.filter((item) => hasPermission(item.permission));
  if (visibleItems.length === 0) return null;

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

      {(!isCollapsed && isOpen) && (
        <SidebarMenuSub>
          {visibleItems.map((item) => (
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

// --- Dynamic User Menu Component ---
function UserProfileMenu() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { connectedUser, clear } = useAppStore();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ message: string; type: SnackbarType; isOpen: boolean }>({
    message: "",
    type: "info",
    isOpen: false,
  });

  const showSnackbar = (message: string, type: SnackbarType = "info") => {
    setSnackbar({ message, type, isOpen: true });
  };

  const handleLogout = () => {
    AuthService.logout();
    clear();
    window.location.href = "/login";
  };

  const handleChangePassword = async (current: string, next: string) => {
    if (!connectedUser) {
      showSnackbar("Aucun utilisateur connecté.", "error");
      return;
    }
    setIsChangingPassword(true);
    try {
      await AuthService.changeAuthenticatedPassword({
        idUser: connectedUser.idUser,
        currentPassword: current,
        newPassword: next,
      });
      showSnackbar("Mot de passe modifié avec succès.", "success");
      setIsPasswordModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors du changement de mot de passe.";
      showSnackbar(msg, "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="mt-2 bg-card border border-border shadow-sm min-w-0 w-full"
          onClick={() => !isCollapsed && setIsOpen(!isOpen)}
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground shrink-0">
            <Users className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none flex-1 min-w-0">
            <span className="font-semibold text-sm truncate w-full text-left block">
              {connectedUser ? `${connectedUser.name ?? ''} ${connectedUser.lastname ?? ''}`.trim() || connectedUser.username : "Administrateur"}
            </span>
            <span className="text-xs text-muted-foreground truncate w-full text-left block">
              {connectedUser ? "Utilisateur connecté" : "Super-administrateur"}
            </span>
          </div>
          <Settings className="ml-auto size-4 text-muted-foreground shrink-0" />
        </SidebarMenuButton>

        {(!isCollapsed && isOpen) && (
          <div className="absolute bottom-full left-0 mb-2 w-full bg-popover border border-border shadow-lg rounded-xl overflow-hidden z-50 flex flex-col p-1 animate-in fade-in slide-in-from-bottom-2">
            <button
              onClick={() => { setIsPasswordModalOpen(true); setIsOpen(false); }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors w-full text-left"
            >
              <KeyRound className="size-4 shrink-0 text-primary" />
              <span className="truncate">Changer le mot de passe</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors w-full text-left mt-1"
            >
              <LogOut className="size-4 shrink-0" />
              <span className="truncate">Logout</span>
            </button>
          </div>
        )}
      </SidebarMenuItem>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        isLoading={isChangingPassword}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handleChangePassword}
      />

      {snackbar.isOpen && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar({ ...snackbar, isOpen: false })}
        />
      )}
    </>
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
  const hasPermission = useAppStore((s) => s.hasPermission);
  const permissions = useAppStore((s) => s.permissions);
  console.log("APP STORE PERMISSIONS:", permissions);
  
  const canSwitchMode = hasPermission("hotel.access") && hasPermission("restaurant.access");

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      {/* TOP ZONE: LOGO & CONTEXT SWITCHER */}
      <SidebarHeader className="border-b border-border pb-4 mb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={() => canSwitchMode && setAppMode(appMode === "utopia" ? "sooatel" : "utopia")}
              className={`bg-primary/10 text-primary transition-colors ${canSwitchMode ? "hover:bg-primary/20 cursor-pointer" : "cursor-default"}`}
              tooltip={canSwitchMode ? `Basculer vers ${appMode === "utopia" ? "Hôtel Sooatel" : "Restaurant Utopia"}` : undefined}
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
                  </div>
                  {canSwitchMode && <ChevronRight className="ml-auto size-4 shrink-0" />}
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
              {NAVIGATION_GROUPS.filter(g => g.scopes.includes(appMode)).map((group) => (
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

          <UserProfileMenu />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
