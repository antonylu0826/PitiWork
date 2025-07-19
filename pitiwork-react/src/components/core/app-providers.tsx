'use client';

import * as React from 'react';
import { ReactKeycloakProvider } from '@react-keycloak/web';

import { UserProvider } from '@/contexts/user-context';
import { LocalizationProvider } from '@/components/core/localization-provider';
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';
import keycloak from '@/lib/auth/keycloak';

interface AppProvidersProps {
  children: React.ReactNode;
}

const handleTokens = (tokens: { token: string; idToken: string; refreshToken: string }) => {
  console.log('Keycloak tokens received:', tokens);
};

export function AppProviders({ children }: AppProvidersProps): React.JSX.Element {
  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{ onLoad: 'login-required' }}
      onTokens={handleTokens}
    >
      <LocalizationProvider>
        <UserProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </UserProvider>
      </LocalizationProvider>
    </ReactKeycloakProvider>
  );
}
