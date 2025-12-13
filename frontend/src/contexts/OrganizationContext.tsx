import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useApolloClient } from '@apollo/client';
import { GET_ORGANIZATIONS } from '../graphql/queries/organizations';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
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
  const apolloClient = useApolloClient();

  const { data, loading } = useQuery(GET_ORGANIZATIONS);
  const organizations = data?.organizations || [];

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedSlug = localStorage.getItem('organizationSlug');
    if (savedSlug && organizations.length > 0) {
      const org = organizations.find((o: Organization) => o.slug === savedSlug);
      if (org) {
        setCurrentOrganizationState(org);
      } else if (organizations.length > 0) {
        // Default to first organization if saved slug not found
        setCurrentOrganizationState(organizations[0]);
        localStorage.setItem('organizationSlug', organizations[0].slug);
      }
    } else if (organizations.length > 0 && !currentOrganization) {
      // Set first organization as default
      setCurrentOrganizationState(organizations[0]);
      localStorage.setItem('organizationSlug', organizations[0].slug);
    }
  }, [organizations]);

  const setCurrentOrganization = async (org: Organization) => {
    console.log('[OrganizationContext] Switching to organization:', org.name, org.slug);
    setCurrentOrganizationState(org);
    localStorage.setItem('organizationSlug', org.slug);

    console.log('[OrganizationContext] Clearing Apollo cache...');
    // Clear Apollo cache and refetch all active queries
    await apolloClient.clearStore();

    console.log('[OrganizationContext] Reloading page...');
    // Reload the page to ensure clean state
    window.location.reload();
  };

  return (
    <OrganizationContext.Provider
      value={{
        currentOrganization,
        organizations,
        loading,
        setCurrentOrganization,
      }}
    >
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
