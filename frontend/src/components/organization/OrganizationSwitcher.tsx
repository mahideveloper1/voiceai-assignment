import React, { useState } from 'react';
import { useOrganization } from '../../contexts/OrganizationContext';
import { CreateOrganizationModal } from './CreateOrganizationModal';

export const OrganizationSwitcher: React.FC = () => {
  const { currentOrganization, organizations, loading, setCurrentOrganization } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (loading || !currentOrganization) {
    return <div className="text-sm text-gray-300">Loading...</div>;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors text-white"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <div className="text-left">
          <div className="text-xs text-blue-200">Organization</div>
          <div className="text-sm font-semibold">{currentOrganization.name}</div>
        </div>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl z-20 border border-gray-200">
            <div className="p-3 border-b border-gray-200">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Switch Organization
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {organizations.map((org: any) => (
                <button
                  key={org.id}
                  onClick={() => {
                    setCurrentOrganization(org);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    org.id === currentOrganization.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{org.name}</div>
                      {org.description && (
                        <div className="text-sm text-gray-500 mt-1">{org.description}</div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">Slug: {org.slug}</div>
                    </div>
                    {org.id === currentOrganization.id && (
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsCreateModalOpen(true);
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Organization
              </button>
              <div className="text-xs text-gray-500 mt-2 text-center">
                Current organization data is isolated from others
              </div>
            </div>
          </div>
        </>
      )}

      <CreateOrganizationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
