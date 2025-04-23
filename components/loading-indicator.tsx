'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoadingIndicator() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a') as HTMLAnchorElement;

      if (link && link.href && link.origin === window.location.origin) {
        if (link.pathname !== window.location.pathname) {
          setLoading(true);
        }
      }
    };

    const handleRouteDone = () => {
      setLoading(false);
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('popstate', handleRouteDone);

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('popstate', handleRouteDone);
    };
  }, []);

  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#F4847B]"></div>
    </div>
  );
}
