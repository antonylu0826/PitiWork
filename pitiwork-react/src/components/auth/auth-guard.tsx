'use client';

import * as React from 'react';
import { useKeycloak } from '@react-keycloak/web';

export interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps): React.JSX.Element | null {
  const { keycloak, initialized } = useKeycloak();

  React.useEffect(() => {
    if (initialized && !keycloak.authenticated) {
      keycloak.login();
    }
  }, [initialized, keycloak]);

  if (!initialized || !keycloak.authenticated) {
    return null; // Or a loading spinner
  }

  return <React.Fragment>{children}</React.Fragment>;
}
