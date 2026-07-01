import { useState, useEffect, createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SidebarProvider } from "@/components/ui/Sidebar/hooks/sidebar.provider";
import { SidebarTrigger, SidebarInset } from "@/components/ui/Sidebar/sidebar";
import { AppSidebar, navigationGroups } from "@/components/ui/Sidebar/app-sidebar";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import sooatelLogo from "@/assets/Sooatel.jpeg";
import utopiaLogo from "@/assets/Utopia.jpeg";

function App() {
  const [appMode, setAppMode] = useState<"utopia" | "sooatel">("utopia");
  const [activeTab, setActiveTab] = useState<string>("Tableau de bord");

  // Dynamic Browser Tab Title and Favicon
  useEffect(() => {
    const modeName = appMode === "utopia" ? "Restaurant Utopia" : "Hôtel Sooatel";
    document.title = `${modeName} - ${activeTab}`;

    // Met à jour l'icône de l'onglet (favicon)
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    // Recherche de l'icône correspondante à l'onglet actif
    let ActiveIcon = null;
    for (const group of navigationGroups) {
      const foundItem = group.items.find(item => item.title === activeTab);
      if (foundItem) {
        ActiveIcon = foundItem.icon;
        break;
      }
    }

    if (ActiveIcon) {
      // Transformation du composant React en image SVG pour l'onglet
      const svgString = renderToStaticMarkup(
        createElement(ActiveIcon, { color: "#1e293b", size: 32, strokeWidth: 2.5 })
      );
      // Encodage en base64 pour être certain que tous les navigateurs l'affichent
      const base64Svg = btoa(unescape(encodeURIComponent(svgString)));

      // Injection de l'image SVG
      link.type = 'image/svg+xml';
      link.href = `data:image/svg+xml;base64,${base64Svg}`;
    } else {
      // Fallback sur le logo de base si on ne trouve pas d'icône
      link.type = 'image/jpeg';
      link.href = appMode === "utopia" ? utopiaLogo : sooatelLogo;
    }
  }, [activeTab, appMode]);

  return (
    <SidebarProvider className={appMode === "utopia" ? "theme-utopia" : "theme-sooatel"}>
      <AppSidebar
        appMode={appMode}
        setAppMode={setAppMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <SidebarInset className="bg-secondary/5">
        <main className="w-full flex flex-col min-h-svh transition-colors duration-300 p-4 md:px-8 md:pb-8 md:pt-[14px]">

          <div className="w-full mb-8 relative">
            <div className="absolute left-0 top-1">
              <SidebarTrigger className="text-secondary hover:bg-secondary/20 hover:text-secondary-foreground -ml-4 md:-ml-6" />
            </div>

            <div className="w-full max-w-5xl mx-auto flex flex-col items-start justify-center text-left pl-12 xl:pl-0">
              <h1 className="font-extrabold text-3xl md:text-4xl text-secondary tracking-tight uppercase">
                {appMode === "utopia" ? "Tableau de Bord" : "Vue d'ensemble"}
              </h1>
              <span className="text-primary font-bold text-sm md:text-base uppercase tracking-widest mt-1">
                {appMode === "utopia" ? "Utopia Restaurant" : "Sooatel Hôtel"}
              </span>
            </div>
          </div>

          <section className="bg-card shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2rem] p-8 md:p-12 border border-border/50 flex-1 w-full max-w-5xl mx-auto space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>

            <div>
              <h2 className="text-2xl font-bold mb-2">Bienvenue sur {appMode === "utopia" ? "Utopia" : "Sooatel"}</h2>
              <p className="text-muted-foreground m-0 text-lg">
                Vous visualisez actuellement la page <span className="font-bold text-primary">{activeTab}</span>.
              </p>
            </div>

            <div className="bg-muted/30 rounded-2xl p-6 border border-border/50">
              <h3 className="text-lg font-semibold mb-6">Démonstration des Composants ({appMode === "utopia" ? "Thème Restaurant" : "Thème Hôtel"})</h3>

              <div className="space-y-6 max-w-md">
                <Input
                  className="bg-background"
                  placeholder="Rechercher des ressources..."
                />

                <Input
                  type="password"
                  className="bg-background"
                  placeholder="Saisir le mot de passe"
                />

                <div className="flex flex-wrap gap-4 pt-4">
                  <Button className="font-semibold px-8 rounded-xl shadow-lg shadow-primary/20">Bouton Principal</Button>
                  <Button variant="secondary" className="font-semibold px-8 rounded-xl shadow-lg shadow-secondary/20">Bouton Secondaire</Button>
                  <Button variant="outline" className="font-semibold px-8 rounded-xl">Contour</Button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App;
