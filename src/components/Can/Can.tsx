import { useAppStore } from "@/store/app.store";

interface CanProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Renders children only if the connected user has the given permission.
 * @example
 * <Can permission="employee.delete">
 *   <DeleteButton />
 * </Can>
 */
export function Can({ permission, children, fallback = null }: CanProps) {
  const hasPermission = useAppStore((s) => s.hasPermission);
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
}
