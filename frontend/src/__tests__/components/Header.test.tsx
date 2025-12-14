import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { OrganizationProvider } from '../../contexts/OrganizationContext';
import { MockedProvider } from '@apollo/client/testing';

// Mock organization data
const mockOrganization = {
  id: '123',
  name: 'Test Organization',
  slug: 'test-org',
};

const mockOrganizations = [mockOrganization];

// Mock the useOrganization hook
vi.mock('../../contexts/OrganizationContext', async () => {
  const actual = await vi.importActual('../../contexts/OrganizationContext');
  return {
    ...actual,
    useOrganization: () => ({
      currentOrganization: mockOrganization,
      organizations: mockOrganizations,
      loading: false,
      setCurrentOrganization: vi.fn(),
    }),
  };
});

describe('Header Component', () => {
  const renderHeader = () => {
    return render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BrowserRouter>
          <OrganizationProvider>
            <Header />
          </OrganizationProvider>
        </BrowserRouter>
      </MockedProvider>
    );
  };

  it('renders the header', () => {
    renderHeader();

    // Check if main header element exists
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderHeader();

    // Check for Dashboard link
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/');

    // Check for Projects link
    const projectsLink = screen.getByRole('link', { name: /projects/i });
    expect(projectsLink).toBeInTheDocument();
    expect(projectsLink).toHaveAttribute('href', '/projects');
  });

  it('renders the organization switcher', () => {
    renderHeader();

    // Organization switcher should display current organization name
    expect(screen.getByText('Test Organization')).toBeInTheDocument();
  });

  it('displays the logo/brand', () => {
    renderHeader();

    // Check for logo or brand text
    const logo = screen.getByText(/project management/i);
    expect(logo).toBeInTheDocument();
  });
});
