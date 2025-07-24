import React, { useState } from 'react';
import {
  Users,
  BookOpen,
  ArrowLeftRight,
  Bell,
  BarChart3,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
    { id: 'readers', label: 'Readers', icon: Users, path: '/readers' },
    { id: 'books', label: 'Books', icon: BookOpen, path: '/books' },
    { id: 'lendings', label: 'Lendings', icon: ArrowLeftRight, path: '/lendings' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
  ];

  const handleNavClick = (itemId: string, path: string) => {
    setActiveTab(itemId);
    navigate(path);
    setSidebarOpen(false);
  };

  return (
      <>
        {/* Mobile overlay */}
        {sidebarOpen && (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
            />
        )}

        {/* Sidebar */}
        <div
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
        >
          {/* Logo/Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Book Club</h1>
            <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                  <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id, item.path)}
                      className={`w-full flex items-center px-6 py-3 text-left text-sm font-medium transition-colors ${
                          activeTab === item.id
                              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </button>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="absolute bottom-0 w-full">
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">L</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Librarian</p>
                  <p className="text-xs text-gray-500">librarian@bookclub.lk</p>
                </div>
              </div>
              <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <LogOut className="mr-3 h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Top Header for mobile */}
        <header className="lg:hidden bg-white shadow-sm border-b border-gray-200 pl-16">
          <div className="flex items-center justify-between h-16 px-6">
            <h2 className="text-xl font-semibold text-gray-900 capitalize">{activeTab}</h2>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">Librarian</span>
              </div>
            </div>
          </div>
        </header>
      </>
  );
};

export default Navbar;
