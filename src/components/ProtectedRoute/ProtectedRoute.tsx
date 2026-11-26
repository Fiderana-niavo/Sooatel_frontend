import { ShieldX } from "lucide-react";
import { useAppStore } from "@/store/app.store";

interface ProtectedRouteProps {
  permission: string;
  children: React.ReactNode;
}

/**
 * Wraps a page component and renders a 403 screen if the user lacks the permission.
 * The backend remains the true security layer — this is purely a UX guard.
 *
 * @example
 * <ProtectedRoute permission="hotel.access">
 *   <ReservationPage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({ permission, children }: ProtectedRouteProps) {
  const hasPermission = useAppStore((s) => s.hasPermission);

  if (!hasPermission(permission)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center gap-6 animate-in fade-in duration-300">
        <div className="p-5 rounded-2xl bg-destructive/10 text-destructive">
          <ShieldX className="size-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Accès refusé</h2>
          <p className="text-muted-foreground max-w-sm">
            Vous n'avez pas la permission pour acceder a cette page.
          </p>
        </div>
        <span className="text-xs font-mono text-muted-foreground/60 bg-muted px-3 py-1 rounded-full">
          403 — Accès non autorisé
        </span>
      </div>
    );
  }

  return <>{children}</>;
}
