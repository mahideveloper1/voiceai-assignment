import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useQuery, useApolloClient } from '@apollo/client';
import { GET_ORGANIZATIONS } from '../graphql/queries/organizations';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  contactEmail: string;
  isActive: boolean;
}

interface OrganizationContextType {
  currentOrganization: Organization | null;
  organizations: Organization[];
  loading: boolean;
  setCurrentOrganization: (org: Organization) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentOrganization, setCurrentOrganizationState] = useState<Organization | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const apolloClient = useApolloClient();

  const { data, loading } = useQuery(GET_ORGANIZATIONS, {
    fetchPolicy: 'cache-first', // Use cache to prevent unnecessary re-fetches
  });

  const organizations = data?.organizations || [];

  // Initialize from localStorage on mount - only run once when organizations are loaded
  useEffect(() => {
    if (organizations.length === 0) {
      return;
    }

    // If already initialized and current org still exists, don't re-initialize
    if (isInitialized && currentOrganization) {
      const orgStillExists = organizations.some((o: Organization) => o.id === currentOrganization.id);
      if (orgStillExists) {
        return;
      }
    }

    const savedSlug = localStorage.getItem('organizationSlug');
    if (savedSlug) {
      const org = organizations.find((o: Organization) => o.slug === savedSlug);
      if (org) {
        // Only set if it's different from current
        if (!currentOrganization || currentOrganization.id !== org.id) {
          setCurrentOrganizationState(org);
        }
        setIsInitialized(true);
      } else {
        // Default to first organization if saved slug not found
        if (!currentOrganization || currentOrganization.id !== organizations[0].id) {
          setCurrentOrganizationState(organizations[0]);
        }
        localStorage.setItem('organizationSlug', organizations[0].slug);
        setIsInitialized(true);
      }
    } else {
      // Set first organization as default
      if (!currentOrganization || currentOrganization.id !== organizations[0].id) {
        setCurrentOrganizationState(organizations[0]);
      }
      localStorage.setItem('organizationSlug', organizations[0].slug);
      setIsInitialized(true);
    }
  }, [organizations, isInitialized, currentOrganization]);

  const setCurrentOrganization = useCallback(async (org: Organization) => {
    console.log('[OrganizationContext] Switching to organization:', org.name, org.slug);
    setCurrentOrganizationState(org);
    localStorage.setItem('organizationSlug', org.slug);

    console.log('[OrganizationContext] Clearing Apollo cache...');
    // Clear Apollo cache and refetch all active queries
    await apolloClient.clearStore();

    console.log('[OrganizationContext] Reloading page...');
    // Reload the page to ensure clean state
    window.location.reload();
  }, [apolloClient]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      currentOrganization,
      organizations,
      loading,
      setCurrentOrganization,
    }),
    [currentOrganization, organizations.length, loading, setCurrentOrganization]
  );

  return (
    <OrganizationContext.Provider value={contextValue}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};
