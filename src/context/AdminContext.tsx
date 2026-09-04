import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminRole, AdminDashboardKPIs, AdminUserRecord } from '../types';
import { adminService } from '../services/adminService';
import { useAuth } from './AuthContext';

export type AdminTab =
  | 'dashboard'
  | 'users'
  | 'subscriptions'
  | 'plans'
  | 'ai-usage'
  | 'maps'
  | 'templates'
  | 'workspaces'
  | 'notifications'
  | 'analytics'
  | 'audit-logs'
  | 'security'
  | 'settings'
  | 'features';

interface AdminContextType {
  adminRole: AdminRole;
  setAdminRole: (role: AdminRole) => void;
  currentTab: AdminTab;
  setCurrentTab: (tab: AdminTab) => void;
  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;
  isAdminAuthenticated: boolean;
  kpis: AdminDashboardKPIs | null;
  loading: boolean;
  error: string | null;
  refreshKey: number;
  refreshData: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [adminRole, setAdminRoleState] = useState<AdminRole>(() => {
    localStorage.setItem('mindflow_admin_email', 'starcybercafe097@gmail.com');
    return (localStorage.getItem('mindflow_admin_role') as AdminRole) || 'SUPER_ADMIN';
  });
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(true);
  const [kpis, setKpis] = useState<AdminDashboardKPIs | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const setAdminRole = (newRole: AdminRole) => {
    setAdminRoleState(newRole);
    localStorage.setItem('mindflow_admin_role', newRole);
    setRefreshKey((prev) => prev + 1);
  };

  const refreshData = () => {
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;
    async function loadIdentityAndKPIs() {
      setLoading(true);
      setError(null);
      try {
        const idRes = await adminService.getIdentity(adminRole);
        if (isMounted) {
          setIsAdminAuthenticated(true);
        }

        const dashRes = await adminService.getDashboard(adminRole);
        if (isMounted && dashRes.kpis) {
          setKpis(dashRes.kpis);
        }
      } catch (err: any) {
        console.warn('Admin identity verification:', err.message);
        if (isMounted) {
          setError(err.message || 'Failed to authenticate admin session');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadIdentityAndKPIs();
    return () => {
      isMounted = false;
    };
  }, [adminRole, refreshKey, user]);

  return (
    <AdminContext.Provider
      value={{
        adminRole,
        setAdminRole,
        currentTab,
        setCurrentTab,
        selectedUserId,
        setSelectedUserId,
        isAdminAuthenticated,
        kpis,
        loading,
        error,
        refreshKey,
        refreshData,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
