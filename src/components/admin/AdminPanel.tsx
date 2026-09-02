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
  return (
    <AdminProvider>
      <AdminContent />
    </AdminProvider>
  );
};
