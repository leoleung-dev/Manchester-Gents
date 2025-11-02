'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AdminModeContext = createContext({ adminMode: true, toggleAdminMode: () => {} });

export function useAdminMode() {
  return useContext(AdminModeContext);
}

export default function AdminModeProvider({ children }) {
  const [adminMode, setAdminMode] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem('adminMode');
    if (stored === 'false') {
      setAdminMode(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      adminMode,
      toggleAdminMode: () => {
        setAdminMode((prev) => {
          const next = !prev;
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('adminMode', String(next));
          }
          return next;
        });
      }
    }),
    [adminMode]
  );

  return <AdminModeContext.Provider value={value}>{children}</AdminModeContext.Provider>;
}
