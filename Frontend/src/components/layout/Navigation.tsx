import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

const Navigation: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    {
      name: 'Resources',
      path: '/',
      icon: '📚',
      allowedRoles: [UserRole.CONTENT_MANAGER, UserRole.VIEWER]
    },
    {
      name: 'Create Resource',
      path: '/create',
      icon: '➕',
      allowedRoles: [UserRole.CONTENT_MANAGER]
    }
  ];

  const filteredNavItems = navItems.filter(item => 
    user && item.allowedRoles.includes(user.role)
  );

  return (
    <nav className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile navigation - stacked layout */}
        <div className="sm:hidden">
          <div className="flex flex-col space-y-1 py-2">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-3 rounded-md font-medium text-sm transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Desktop navigation - horizontal layout */}
        <div className="hidden sm:flex space-x-8 overflow-x-auto">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">{item.name.split(' ')[0]}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;