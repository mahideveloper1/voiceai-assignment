import React from 'react';
import { Link } from 'react-router-dom';
import { OrganizationSwitcher } from '../organization/OrganizationSwitcher';

export const Header: React.FC = () => {
  return (
    <header className="bg-blue-600 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-black hover:text-gray-700">
          Project Management
        </Link>
        <div className="flex items-center gap-6">
          <nav className="flex gap-6">
            <Link to="/dashboard" className="text-black hover:text-gray-700 transition-colors">
              Dashboard
            </Link>
            <Link to="/projects" className="text-black hover:text-gray-700 transition-colors">
              Projects
            </Link>
          </nav>
          <OrganizationSwitcher />
        </div>
      </div>
    </header>
  );
};
