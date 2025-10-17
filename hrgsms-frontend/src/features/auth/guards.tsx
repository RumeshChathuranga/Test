import { type PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getRole, getToken } from "../../lib/storage";
import { hasAnyRole } from "../../lib/roles";

export function RequireAuth({ children }: PropsWithChildren) {
  const token = getToken();
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

export function RequireRole({
  children,
  roles,
}: PropsWithChildren<{
  roles: ("Admin" | "Manager" | "Reception" | "Staff")[];
}>) {
  const role = getRole();
  const location = useLocation();
  if (!hasAnyRole(role, roles)) {
    return <Navigate to={"/"} replace state={{ from: location }} />;
  }
  return children;
}

export default RequireAuth;
