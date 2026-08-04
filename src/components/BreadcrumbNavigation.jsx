// Task 9: BreadcrumbNavigation component with schema
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { getBreadcrumbSchema } from '@/utils/seoUtils';

const BreadcrumbNavigation = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const customLabels = {
    '/healthcare-library': 'Healthcare Library',
    '/disease-library': 'Disease Library',
    '/treatment-library': 'Treatment Library',
    '/elder-care-library': 'Elder Care Library',
    '/nri-care-library': 'NRI Care Library',
    '/final-journey-library': 'Final Journey Library',
    '/nurse-at-home': 'Nurse at Home',
    '/elder-care': 'Elder Care',
    '/patient-attendant': 'Patient Attendant',
    '/icu-at-home': 'ICU at Home',
    '/doctor-at-home': 'Doctor at Home',
    '/physiotherapy-at-home': 'Physiotherapy at Home',
    '/lab-test-at-home': 'Lab Test at Home',
    '/injection-at-home': 'Injection at Home',
    '/ambulance-service': 'Ambulance Service',
    '/palliative-care': 'Palliative Care',
    '/cancer-care-at-home': 'Cancer Care at Home',
    '/stroke-care-at-home': 'Stroke Care at Home',
    '/services': 'Services',
    '/book': 'Book Care',
    '/contact': 'Contact Us'
  };

  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    ...pathnames.map((value, index) => {
      const to = `/${pathnames.slice(0, index + 1).join('/')}`;
      return {
        name: customLabels[to] || value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' '),
        path: to
      };
    })
  ];

  const schema = getBreadcrumbSchema(breadcrumbItems);

  if (location.pathname === '/') return null;

  return (
    <div className="border-b border-purple-100 bg-white/80 py-3 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>

        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-sm sm:gap-2">
            <li>
              <Link to="/" className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium text-gray-500 transition-colors hover:bg-purple-50 hover:text-[#7C3AED]">
                <Home className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Home</span>
              </Link>
            </li>

            {breadcrumbItems.slice(1).map((item, index) => {
              const isLast = index === breadcrumbItems.length - 2;
              return (
                <li key={item.path}>
                  <div className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-gray-300" aria-hidden="true" />
                    <Link
                      to={item.path}
                      className={`ml-1 rounded-full px-2 py-1 font-medium transition-colors ${
                        isLast
                          ? 'cursor-default bg-purple-50 text-[#7C3AED] pointer-events-none'
                          : 'text-gray-500 hover:bg-purple-50 hover:text-[#7C3AED]'
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