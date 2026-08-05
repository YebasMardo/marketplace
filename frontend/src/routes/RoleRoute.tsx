import { Navigate, Outlet } from 'react-router-dom';
import { useGetMeQuery } from '../features/auth/authApi';
import type { Role } from '../types/api';

interface RoleRouteProps {
  allowed: Role[];
}

export function RoleRoute({ allowed }: RoleRouteProps) {
  const { data: me, isLoading } = useGetMeQuery();

  // En attente de la réponse — évite un flash de redirection avant que
  // /auth/me n'ait répondu.
  if (isLoading) return null;

  if (!me || !allowed.includes(me.role)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}