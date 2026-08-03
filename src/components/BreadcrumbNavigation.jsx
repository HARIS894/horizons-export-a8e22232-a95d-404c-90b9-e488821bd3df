// Task 9: BreadcrumbNavigation component with schema
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { getBreadcrumbSchema } from '@/utils/seoUtils';

const BreadcrumbNavigation = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    ...pathnames.map((value, index) => {
      const to = `/${pathnames.slice(0, index + 1).join('/')}`;
      return {
        name: value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' '),
        path: to
      };
    })
  ];

  const schema = getBreadcrumbSchema(breadcrumbItems);

  if (location.pathname === '/') return null;

  return (
    <div className="bg-gray-50 border-b border-gray-200 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
        
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <div>
                <Link to="/" className="text-gray-400 hover:text-gray-500">
                  <Home className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Home</span>
                </Link>
              </div>
            </li>
            
            {breadcrumbItems.slice(1).map((item, index) => {
              const isLast = index === breadcrumbItems.length - 2;
              return (
                <li key={item.path}>
                  <div className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-gray-300" aria-hidden="true" />
                    <Link
                      to={item.path}
                      className={`ml-2 text-sm font-medium ${
                        isLast 
                          ? 'text-[#6B46C1] font-semibold cursor-default pointer-events-none' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {item.name}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default BreadcrumbNavigation;