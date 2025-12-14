import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              Resource Manager
            </h1>
          </div>

          {/* Desktop user info and logout */}
          <div className="hidden sm:flex items-center space-x-4">
            {user && (
              <>
                <div className="flex flex-col items-end text-sm">
                  <span className="font-medium text-gray-900 truncate max-w-32 lg:max-w-none">
                    {user.name}
                  </span>
                  <span className="text-gray-500 text-xs lg:text-sm">
                    {user.role === UserRole.CONTENT_MANAGER ? 'Content Manager' : 'Viewer'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden">
            {user && (
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {/* Hamburger icon */}
                <svg
                  className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                {/* Close icon */}
                <svg
                  className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && user && (
          <div className="sm:hidden border-t border-gray-200 py-3">
            <div className="flex flex-col space-y-3">
              <div className="px-4 py-2">
                <div className="text-base font-medium text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-500">
                  {user.role === UserRole.CONTENT_MANAGER ? 'Content Manager' : 'Viewer'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mx-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;