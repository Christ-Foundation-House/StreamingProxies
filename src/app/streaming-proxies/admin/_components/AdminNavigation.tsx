'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  BarChart3, 
  Plus,
  ChevronRight
} from 'lucide-react';

interface AdminNavigationProps {
  userPermissions?: string[];
  className?: string;
}

interface AdminPage {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  permission?: string;
  color: string;
}

const adminPages: AdminPage[] = [
  {
    id: 'overview',
    title: 'Overview',
    description: 'Admin panel dashboard and quick stats',
    path: '/streaming-proxies/admin',
    icon: <LayoutDashboard className="h-6 w-6" />,
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    id: 'users',
    title: 'User Management',
    description: 'Manage user access and permissions',
    path: '/streaming-proxies/admin/users',
    icon: <Users className="h-6 w-6" />,
    permission: 'manage_users',
    color: 'bg-orange-500 hover:bg-orange-600'
  },
  {
    id: 'settings',
    title: 'System Settings',
    description: 'Configure global system settings',
    path: '/streaming-proxies/admin/settings',
    icon: <Settings className="h-6 w-6" />,
    permission: 'manage_settings',
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  {
    id: 'analytics',
    title: 'View Analytics',
    description: 'Monitor performance and usage statistics',
    path: '/streaming-proxies/admin/analytics-enhanced',
    icon: <BarChart3 className="h-6 w-6" />,
    permission: 'view_analytics',
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    id: 'create',
    title: 'Create Proxy',
    description: 'Set up a new streaming proxy server',
    path: '/streaming-proxies/admin/create',
    icon: <Plus className="h-6 w-6" />,
    color: 'bg-indigo-500 hover:bg-indigo-600'
  }
];

export default function AdminNavigation({ 
  userPermissions = [], 
  className = '' 
}: AdminNavigationProps) {
  const pathname = usePathname();

  // Check if user has permission to access a page
  const hasPermission = (permission?: string): boolean => {
    if (!permission) return true; // No permission required
    return userPermissions.includes(permission) || userPermissions.includes('admin');
  };

  // Filter pages based on permissions
  const visiblePages = adminPages.filter(page => hasPermission(page.permission));

  // Get current page info
  const currentPage = adminPages.find(page => 
    page.path === pathname || 
    (page.path !== '/streaming-proxies/admin' && pathname.startsWith(page.path))
  );

  return (
    <div className={className}>
      {/* Breadcrumb Navigation */}
      {currentPage && currentPage.id !== 'overview' && (
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <Link 
              href="/streaming-proxies/admin"
              className="hover:text-gray-700 transition-colors"
            >
              Admin Panel
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium">{currentPage.title}</span>
          </nav>
        </div>
      )}

      {/* Admin Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visiblePages.map((page) => {
          const isCurrentPage = pathname === page.path || 
            (page.path !== '/streaming-proxies/admin' && pathname.startsWith(page.path));
          
          return (
            <Link key={page.id} href={page.path}>
              <Card 
                className={`p-6 hover:shadow-md transition-all cursor-pointer group ${
                  isCurrentPage ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-3 rounded-lg text-white transition-colors ${
                        isCurrentPage ? 'bg-blue-500' : page.color
                      } group-hover:scale-105 transition-transform`}>
                        {page.icon}
                      </div>
                      <div>
                        <h3 className={`text-lg font-medium transition-colors ${
                          isCurrentPage ? 'text-blue-900' : 'text-gray-900 group-hover:text-gray-700'
                        }`}>
                          {page.title}
                        </h3>
                        {page.permission && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 mt-1">
                            Requires: {page.permission.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm transition-colors ${
                      isCurrentPage ? 'text-blue-700' : 'text-gray-600 group-hover:text-gray-500'
                    }`}>
                      {page.description}
                    </p>
                  </div>
                  <ChevronRight className={`h-5 w-5 transition-all ${
                    isCurrentPage 
                      ? 'text-blue-500 transform translate-x-1' 
                      : 'text-gray-400 group-hover:text-gray-600 group-hover:transform group-hover:translate-x-1'
                  }`} />
                </div>
                
                {isCurrentPage && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Currently viewing
                    </div>
                  </div>
                )}
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Permission Notice */}
      {userPermissions.length > 0 && adminPages.length !== visiblePages.length && (
        <Card className="mt-6 p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-2 text-sm text-yellow-800">
            <Settings className="h-4 w-4" />
            <span>
              Some admin features are hidden based on your permissions. 
              Contact an administrator if you need additional access.
            </span>
          </div>
        </Card>
      )}

      {/* Quick Stats for Overview Page */}
      {currentPage?.id === 'overview' && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/streaming-proxies/dashboard">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                View Dashboard
              </Link>
            </Button>
            {hasPermission('manage_users') && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/streaming-proxies/admin/users">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Link>
              </Button>
            )}
            {hasPermission('view_analytics') && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/streaming-proxies/admin/analytics-enhanced">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}