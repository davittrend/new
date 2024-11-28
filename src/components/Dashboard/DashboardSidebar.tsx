import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Clock, Settings, Users } from 'lucide-react';

const navigation = [
  { name: 'Accounts', href: '/dashboard/accounts', icon: Users },
  { name: 'Schedule Pin', href: '/dashboard', icon: LayoutGrid },
  { name: 'Scheduled Pins', href: '/dashboard/scheduled', icon: Clock },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function DashboardSidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                isActive
                  ? 'bg-red-50 text-red-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}