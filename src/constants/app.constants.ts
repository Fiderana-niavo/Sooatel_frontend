import {
  UtensilsCrossed, Package, Users, Building, BedDouble, BookOpen, AlertTriangle, TrendingUp, Contact, CalendarDays, HeartHandshake, Settings, ShieldCheck, LayoutDashboard, CreditCard, Boxes, ArrowRightLeft,
  Box, Layers, MenuSquare, List, Ruler, Bed, Grid2x2, Banknote, PackageCheck
} from "lucide-react";

// ============================================================================
// 1. NAVIGATION SIDEBAR (Menu Latéral)
// ============================================================================

export type AppMode = "utopia" | "sooatel";

export const NAVIGATION_GROUPS = [
  {
    title: "Opérations restaurant",
    icon: UtensilsCrossed,
    permission: "restaurant.access",
    scopes: ["utopia"], // Visible uniquement dans le Restaurant
    items: [
      { title: "Tableau de bord", url: "/resto/dashboard", icon: LayoutDashboard, permission: "sale.manage" },
      { title: "Caisse & PDV", url: "/resto/pos", icon: CreditCard, permission: "sales.pos" },
      { title: "Historique des Ventes", url: "/resto/sales", icon: List, permission: "sales.pos" },
      { title: "Recettes", url: "/resto/revenue", icon: TrendingUp, permission: "sales.pos" },
      { title: "Mouvements de Caisse", url: "/cash-movements", icon: Banknote, permission: "restaurant.purchases" },
      { title: "Catalogue & Menus", url: "/resto/catalog", icon: BookOpen, permission: "restaurant.access" },
    ],
  },
  {
    title: "Opérations hôtel",
    icon: Building,
    permission: "hotel.access",
    scopes: ["sooatel"], // Visible uniquement dans l'Hôtel
    items: [
      { title: "Chambres & Évènements", url: "/hotel/config", icon: BedDouble, permission: "hotel.access" },
    ],
  },
  {
    title: "Inventaire & logistique",
    icon: Package,
    permission: "stock.access",
    scopes: ["utopia", "sooatel"], // Visible des deux côtés
    items: [
      { title: "Gestion des Produits & Inventaire", url: "/inventory/catalog", icon: Box, permission: "stock.manage" },
      { title: "Niveaux de Stock", url: "/inventory/stock", icon: Boxes, permission: "stock.read" },
      { title: "Fournisseurs & Achats", url: "/inventory/suppliers", icon: Package, permission: "supplier.read" },
      { title: "Commandes Fournisseurs", url: "/inventory/purchases", icon: Package, permission: "stock.manage" },
      { title: "Livraisons Fournisseurs", url: "/inventory/deliveries", icon: PackageCheck, permission: "stock.manage" },
      { title: "Mouvements", url: "/inventory/movements", icon: ArrowRightLeft, permission: "stock.read" },
      { title: "Audits & Alertes", url: "/inventory/audits", icon: AlertTriangle, permission: "stock.audit" },
      { title: "Prévisions IA", url: "/inventory/ai", icon: TrendingUp, permission: "stock.forecast" },
    ],
  },
  {
    title: "Ressources humaines",
    icon: Users,
    permission: "hr.access",
    scopes: ["utopia", "sooatel"], // Visible des deux côtés
    items: [
      { title: "Annuaire du Personnel", url: "/hr/directory", icon: Contact, permission: "hr.access" },
      { title: "Plannings", url: "/hr/schedules", icon: CalendarDays, permission: "hr.schedule" },
      { title: "Bien-être de l'Équipe", url: "/hr/welfare", icon: HeartHandshake, permission: "hr.welfare" },
      { title: "Gestion des Utilisateurs", url: "/hr/users", icon: Users, permission: "employee.read" },
      { title: "Rôles et Permissions", url: "/hr/roles", icon: ShieldCheck, permission: "security.access" },
    ],
  },
  {
    title: "Configuration",
    icon: Settings,
    permission: "settings.access",
    scopes: ["utopia", "sooatel"], // Visible des deux côtés
    items: [
      { title: "Paramètres Globaux", url: "/settings/global", icon: Settings, permission: "settings.access" },
    ],
  },
];

// ============================================================================
// 2. CONFIGURATION DES MODULES (Pages de configuration)
// ============================================================================

export const RESTAURANT_MODULES = [
  {
    title: "Gestion de la Carte (Menus)",
    items: [
      { id: "menuItems", title: "Plats du Menu", description: "Gérez les plats proposés aux clients.", icon: MenuSquare, colorClass: "text-orange-500 bg-orange-500/10", hoverClass: "group-hover:bg-orange-500" },
      { id: "menuCategories", title: "Catégories de Menu", description: "Catégorisez les plats (Entrées, Desserts...).", icon: List, colorClass: "text-rose-500 bg-rose-500/10", hoverClass: "group-hover:bg-rose-500" },
    ]
  }
];

export const HOTEL_MODULES = [
  {
    title: "Configuration de l'Hébergement",
    items: [
      { id: "rooms", title: "Chambres", description: "Gérez la liste des chambres et salles de l'hôtel.", icon: Bed, colorClass: "text-primary bg-primary/10", hoverClass: "group-hover:bg-primary" },
      { id: "roomTypes", title: "Types de Chambres", description: "Définissez les types (Standard, Suite, VIP...).", icon: Grid2x2, colorClass: "text-secondary bg-secondary/10", hoverClass: "group-hover:bg-secondary" },
      { id: "events", title: "Évènements", description: "Configurez les évènements pour la réservation.", icon: CalendarDays, colorClass: "text-blue-500 bg-blue-500/10", hoverClass: "group-hover:bg-blue-500" },
    ]
  }
];

export const INVENTORY_MODULES = [
  {
    title: "Gestion des Produits & Inventaire",
    items: [
      { id: "items", title: "Articles", description: "Gérez la liste de vos produits et ingrédients.", icon: Box, colorClass: "text-primary bg-primary/10", hoverClass: "group-hover:bg-primary" },
      { id: "itemTypes", title: "Types d'Articles", description: "Catégorisez vos articles (ex: Boisson, Viande...).", icon: Layers, colorClass: "text-secondary bg-secondary/10", hoverClass: "group-hover:bg-secondary" },
      { id: "units", title: "Unités de Mesure", description: "Configurez les unités (Kg, Litre, Pièce...).", icon: Ruler, colorClass: "text-emerald-500 bg-emerald-500/10", hoverClass: "group-hover:bg-emerald-500" },
    ]
  }
];
