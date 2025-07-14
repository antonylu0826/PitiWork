'use client';

import * as React from 'react';
import { useKeycloak } from '@react-keycloak/web';

import type { User } from '@/types/user';

export interface UserContextValue {
  user: User | null;
  error: string | null;
  isLoading: boolean;
}

export const UserContext = React.createContext<UserContextValue | undefined>(undefined);

export interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps): React.JSX.Element {
  const { keycloak, initialized } = useKeycloak();
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    if (keycloak.authenticated && keycloak.tokenParsed) {
      const { sub, given_name, family_name, email, preferred_username } = keycloak.tokenParsed;
      setUser({
        id: sub || 'unknown',
        name: given_name && family_name ? `${given_name} ${family_name}` : preferred_username || 'Unknown User',
        email: email,
        // Avatar can be customized if available in the token
        avatar: '' 
      });
    } else {
      setUser(null);
    }
  }, [keycloak.authenticated, keycloak.tokenParsed]);

  return (
    <UserContext.Provider value={{ user, error: null, isLoading: !initialized }}>
      {children}
    </UserContext.Provider>
  );
}

export const UserConsumer = UserContext.Consumer;