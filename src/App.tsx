import { useState, useEffect, createElement } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { renderToStaticMarkup } from "react-dom/server";
import { SidebarProvider } from "@/components/ui/Sidebar/hooks/sidebar.provider";
import { SidebarTrigger, SidebarInset } from "@/components/ui/Sidebar/sidebar";
import { AppSidebar } from "@/components/ui/Sidebar/app-sidebar";
import { NAVIGATION_GROUPS } from "@/constants/app.constants";
import sooatelLogo from "@/assets/Sooatel.jpeg";
import utopiaLogo from "@/assets/Utopia.jpeg";
import { EmployeesPage } from "@/features/employees";
import { LoginPage } from "@/features/auth";
import { RolesPage } from "@/features/roles";
import { PlanningPage } from "@/features/planning";
import { SettingsPage } from "@/features/settings";
import { HotelConfigPage } from "@/features/hotel-config";
import { RestaurantCatalogPage } from "@/features/restaurant-catalog";
import { InventoryCatalogPage } from "@/features/inventory-catalog";
import { SalesPosPage, SalesListPage, RevenuePage } from "@/features/sales";
import { DashboardPage } from "@/features/dashboard";
import { CashMovementPage } from "@/features/cash_movement";
import { SuppliersPage } from "@/features/suppliers";
import type { SaleRecord } from "@/features/sales";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useAppStore } from "@/store/app.store";

function App() {
  const navigate = useNavigate();
  const [appMode, setAppMode] = useState<"utopia" | "sooatel">(() => {
    const savedMode = localStorage.getItem("appMode") as "utopia" | "sooatel";
    if (savedMode === "utopia" || savedMode === "sooatel") {
      return savedMode;
    }

    const hasPermission = useAppStore.getState().hasPermission;
    const hasHotel = hasPermission("hotel.access");
    const hasRestaurant = hasPermission("restaurant.access");

    if (hasRestaurant && !hasHotel) {
      return "utopia";
    }
    return "sooatel";
  });

  useEffect(() => {
    document.body.classList.remove("theme-utopia", "theme-sooatel");
    document.body.classList.add(`theme-${appMode}`);
  }, [appMode]);

  const [editingSale, setEditingSale] = useState<SaleRecord | null>(() => {
    const saved = sessionStorage.getItem("editingSale");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (editingSale) {
      sessionStorage.setItem("editingSale", JSON.stringify(editingSale));
    } else {
      sessionStorage.removeItem("editingSale");
    }
  }, [editingSale]);

  const [activeTab, setActiveTab] = useState<string>(() => {
    const savedTab = localStorage.getItem("activeTab");
    return savedTab || "Tableau de bord";
  });

  const [employeesPageTitle, setEmployeesPageTitle] = useState("Gestion des Employés");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "Caisse & PDV") {
      setEditingSale(null);
    }
  };

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("authToken");
  });

  useEffect(() => {
    const modeName = appMode === "utopia" ? "Restaurant Utopia" : "Hôtel Sooatel";
    document.title = `${modeName} - ${activeTab}`;

    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    let ActiveIcon = null;
    for (const group of NAVIGATION_GROUPS) {
      const foundItem = group.items.find(item => item.title === activeTab);
      if (foundItem) {
        ActiveIcon = foundItem.icon;
        break;
      }
    }

    if (ActiveIcon) {
      const svgString = renderToStaticMarkup(
        createElement(ActiveIcon, { color: "#1e293b", size: 32, strokeWidth: 2.5 })
      );
      const base64Svg = btoa(unescape(encodeURIComponent(svgString)));

      link.type = 'image/svg+xml';
      link.href = `data:image/svg+xml;base64,${base64Svg}`;
    } else {
      link.type = 'image/jpeg';
      link.href = appMode === "utopia" ? utopiaLogo : sooatelLogo;
    }
  }, [activeTab, appMode]);

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
    localStorage.setItem("appMode", appMode);
  }, [activeTab, appMode]);

  const handleLogin = () => {
    setIsAuthenticated(true);

    const hasPermission = useAppStore.getState().hasPermission;
    const hasHotel = hasPermission("hotel.access");
    const hasRestaurant = hasPermission("restaurant.access");

    if (hasRestaurant && !hasHotel) {
      setAppMode("utopia");
    } else {
      setAppMode("sooatel");
    }

    let firstPermittedTab = null;
    for (const group of NAVIGATION_GROUPS) {
      if (!group.permission || hasPermission(group.permission)) {
        for (const item of group.items) {
          if (!item.permission || hasPermission(item.permission)) {
            if (!firstPermittedTab) firstPermittedTab = item.title;
            break;
          }
        }
        if (firstPermittedTab) break;
      }
    }

    if (firstPermittedTab) {
      setActiveTab(firstPermittedTab);
    }

    navigate("/");
  };

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />
      } />
      <Route path="/" element={
        isAuthenticated ? (
          <SidebarProvider className={appMode === "utopia" ? "theme-utopia" : "theme-sooatel"}>
            <AppSidebar
              appMode={appMode}
              setAppMode={setAppMode}
              activeTab={activeTab}
              setActiveTab={handleTabChange}
            />
            <SidebarInset className="bg-secondary/5">
              <main className="w-full flex flex-col min-h-svh transition-colors duration-300 p-4 md:px-8 md:pb-8 md:pt-[14px]">
                <div className="w-full mb-8 relative">
                  <div className="absolute left-0 top-1">
                    <SidebarTrigger className="text-secondary hover:bg-secondary/20 hover:text-secondary-foreground -ml-4 md:-ml-6" />
                  </div>

                  <div className="w-full max-w-5xl mx-auto flex flex-col items-start justify-center text-left pl-12 xl:pl-0">
                    <h1 className="font-extrabold text-3xl md:text-4xl text-secondary tracking-tight uppercase">
                      {activeTab === "Gestion des Utilisateurs"
                        ? employeesPageTitle
                        : activeTab === "Chambres & Évènements"
                          ? "Configuration de l'Hôtel"
                          : activeTab === "Catalogue & Menus"
                            ? "Catalogue du Restaurant"
                            : activeTab === "Tableau de bord"
                              ? (appMode === "utopia" ? "Tableau de Bord" : "Vue d'ensemble")
                              : activeTab}
                    </h1>
                    <span className="text-primary font-bold text-sm md:text-base uppercase tracking-widest mt-1">
                      {appMode === "utopia" ? "Utopia Restaurant" : "Sooatel Hôtel"}
                    </span>
                  </div>
                </div>

                <section className="bg-card shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2rem] p-8 md:p-12 border border-border/50 flex-1 w-full max-w-5xl mx-auto space-y-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>

                  {activeTab !== "Gestion des Utilisateurs" && activeTab !== "Rôles et Permissions" && activeTab !== "Plannings" && activeTab !== "Paramètres Globaux" && activeTab !== "Chambres & Évènements" && activeTab !== "Catalogue & Menus" && activeTab !== "Caisse & PDV" && activeTab !== "Historique des Ventes" && activeTab !== "Recettes" && activeTab !== "Tableau de bord" && activeTab !== "Mouvements de Caisse" && activeTab !== "Fournisseurs & Achats" && (
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Bienvenue sur {appMode === "utopia" ? "Utopia" : "Sooatel"}</h2>
                      <p className="text-muted-foreground m-0 text-lg">
                        Vous visualisez actuellement la page <span className="font-bold text-primary">{activeTab}</span>.
                      </p>
                    </div>
                  )}

                  {activeTab === "Gestion des Utilisateurs" ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                      <ProtectedRoute permission="employee.read">
                        <EmployeesPage setPageTitle={setEmployeesPageTitle} />
                      </ProtectedRoute>
                    </div>
                  ) : activeTab === "Rôles et Permissions" ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full !mt-0 md:!-mt-4">
                      <ProtectedRoute permission="security.access">
                        <RolesPage />
                      </ProtectedRoute>
                    </div>
                  ) : activeTab === "Plannings" ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                      <ProtectedRoute permission="hr.schedule">
                        <PlanningPage />
                      </ProtectedRoute>
                    </div>
                  ) : activeTab === "Paramètres Globaux" ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                      <ProtectedRoute permission="settings.access">
                        <SettingsPage />
                      </ProtectedRoute>
                    </div>
                  ) : activeTab === "Chambres & Évènements" ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                      <ProtectedRoute permission="hotel.access">
                        <HotelConfigPage />
                      </ProtectedRoute>
                    </div>
                  ) : activeTab === "Catalogue & Menus" ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                      <ProtectedRoute permission="restaurant.access">
                        <RestaurantCatalogPage />
                      </ProtectedRoute>
                    </div>
                  ) : activeTab === "Caisse & PDV" ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                      <ProtectedRoute permission="sales.pos">
                        <SalesPosPage
                          onGoToHistory={() => setActiveTab("Historique des Ventes")}
                          saleToEdit={editingSale}
                          onClearEdit={() => {
                            setEditingSale(null);
                          }}
                        />
                      </ProtectedRoute>
                    </div>
                  ) : activeTab === "Historique des Ventes" ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                      <ProtectedRoute permission="sales.pos">
                        <SalesListPage
                          onEditSale={(sale) => {
                            setEditingSale(sale);
                            setActiveTab("Caisse & PDV");
                          }}
                        />
                      </ProtectedRoute>
                    </div>
                  ) : activeTab === "Recettes" ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                      <ProtectedRoute permission="sales.pos">
                        <RevenuePage />
                      </ProtectedRoute>
                    </div>
                  ) : activeTab === "Tableau de bord" ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                      <ProtectedRoute permission="sale.manage">
                        <DashboardPage />
                      </ProtectedRoute>
                    </div>
                  ) : activeTab === "Mouvements de Caisse" ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                      <ProtectedRoute permission="restaurant.purchases">
                        <CashMovementPage />
                      </ProtectedRoute>
                    </div>
                  ) : activeTab === "Fournisseurs & Achats" ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                      <ProtectedRoute permission="supplier.manage">
                        <SuppliersPage />
                      </ProtectedRoute>
                    </div>
                  ) : activeTab === "Gestion des Produits & Inventaire" ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                      <ProtectedRoute permission="stock.manage">
                        <InventoryCatalogPage />
                      </ProtectedRoute>
                    </div>
                  ) : (
                    <div className="bg-muted/30 rounded-2xl p-6 border border-border/50 flex flex-col items-center justify-center min-h-[300px] text-center">
                      <h3 className="text-xl font-semibold mb-2">Contenu : {activeTab}</h3>
                      <p className="text-muted-foreground">Cette section est en cours de développement.</p>
                    </div>
                  )}
                </section>
              </main>
            </SidebarInset>
          </SidebarProvider>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App;
