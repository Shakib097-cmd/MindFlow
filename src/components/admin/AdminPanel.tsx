import React from 'react';
import { AdminProvider, useAdmin } from '../../context/AdminContext';
import { AdminLayout } from './AdminLayout';
import { AdminDashboardView } from './AdminDashboardView';
import { AdminUsersView } from './AdminUsersView';
import { AdminSubscriptionsView } from './AdminSubscriptionsView';
import { AdminPlansView } from './AdminPlansView';
import { AdminAIUsageView } from './AdminAIUsageView';
import { AdminMapsView } from './AdminMapsView';
import { AdminTemplatesView } from './AdminTemplatesView';
import { AdminWorkspacesView } from './AdminWorkspacesView';
import { AdminNotificationsView } from './AdminNotificationsView';
import { AdminAnalyticsView } from './AdminAnalyticsView';
import { AdminAuditLogsView } from './AdminAuditLogsView';
import { AdminSecurityView } from './AdminSecurityView';
import { AdminFeaturesView } from './AdminFeaturesView';
import { AdminSettingsView } from './AdminSettingsView';
import { AdminUserDetailsModal } from './AdminUserDetailsModal';
import { useAuth } from '../../context/AuthContext';
import { AdminLoginGate } from './AdminLoginGate';
import { AdminAccessDeniedView } from './AdminAccessDeniedView';

const AdminContent: React.FC = () => {
  const { currentTab, selectedUserId, setSelectedUserId, refreshData } = useAdmin();

  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <AdminDashboardView />;
      case 'users':
        return <AdminUsersView />;
      case 'subscriptions':
        return <AdminSubscriptionsView />;
      case 'plans':
        return <AdminPlansView />;
      case 'ai-usage':
        return <AdminAIUsageView />;
      case 'maps':
        return <AdminMapsView />;
      case 'templates':
        return <AdminTemplatesView />;
      case 'workspaces':
        return <AdminWorkspacesView />;
      case 'notifications':
        return <AdminNotificationsView />;
      case 'analytics':
        return <AdminAnalyticsView />;
      case 'audit-logs':
        return <AdminAuditLogsView />;
      case 'security':
        return <AdminSecurityView />;
      case 'features':
        return <AdminFeaturesView />;
      case 'settings':
        return <AdminSettingsView />;
      default:
        return <AdminDashboardView />;
    }
  };

  return (
    <AdminLayout>
      {renderTabContent()}
      {selectedUserId && (
        <AdminUserDetailsModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onUpdated={() => {
            refreshData();
          }}
        />
      )}
    </AdminLayout>
  );
};

export const AdminPanel: React.FC = () => {
  const { user, profile, loading } = useAuth();

  const isSuperAdmin =
    user?.email?.trim().toLowerCase() === 'starcybercafe097@gmail.com' ||
    profile?.email?.trim().toLowerCase() === 'starcybercafe097@gmail.com';

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center text-slate-300">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Verifying Administrator Access...</span>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    if (user) {
      return <AdminAccessDeniedView />;
    }
    return <AdminLoginGate />;
  }

  return (
    <AdminProvider>
      <AdminContent />
    </AdminProvider>
  );
};
