import type { PropsWithChildren } from "react";
import { AuthProvider } from "@contexts/AuthContext";
import { PermissionsProvider } from "@/contexts/PermissionsContext";

export default function PrivatePageShell({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      <PermissionsProvider
        autoLoad={true}
        interfaceType="lk"
        refreshInterval={900000}
      >
        {children}
      </PermissionsProvider>
    </AuthProvider>
  );
}
