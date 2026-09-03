import {
  AdminRole,
  AdminUserRecord,
  AdminSubscription,
  AdminPlanConfig,
  AIGenerationLog,
  AdminAIUsageMetrics,
  AdminMapSummary,
  AdminTemplateRecord,
  AdminWorkspaceRecord,
  AdminNotificationBroadcast,
  AdminAuditLog,
  AdminSecurityDiagnostics,
  AdminFeatureFlags,
  AdminSystemSettings,
  AdminDashboardKPIs,
  PlanType,
} from '../types';
import { auth } from '../lib/firebase';

const SUPER_ADMIN_EMAIL = 'starcybercafe097@gmail.com';

function getAdminHeaders(overrideRole?: AdminRole): HeadersInit {
  const currentUser = auth.currentUser;
  const userEmail =
    currentUser?.email?.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
      ? SUPER_ADMIN_EMAIL
      : currentUser?.email || localStorage.getItem('mindflow_admin_email') || '';
  const userId = currentUser?.uid || 'admin-starcybercafe';
  const role = overrideRole || (localStorage.getItem('mindflow_admin_role') as AdminRole) || 'SUPER_ADMIN';

  return {
    'Content-Type': 'application/json',
    'x-user-email': userEmail,
    'x-user-id': userId,
    'x-admin-role': role,
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `Admin API error (${res.status})`);
  }
  return res.json();
}

export const adminService = {
  // Identity & Auth
  async getIdentity(role?: AdminRole) {
    const res = await fetch('/api/admin/me', {
      headers: getAdminHeaders(role),
    });
    return handleResponse<{ admin: { id: string; email: string; role: AdminRole }; system: any }>(res);
  },

  // Dashboard KPIs
  async getDashboard(role?: AdminRole) {
    const res = await fetch('/api/admin/dashboard', {
      headers: getAdminHeaders(role),
    });
    return handleResponse<{ kpis: AdminDashboardKPIs; recentActivity: AdminAuditLog[]; recentAILogs: AIGenerationLog[] }>(res);
  },

  // Users
  async getUsers(params: { search?: string; status?: string; plan?: string; page?: number; limit?: number } = {}, role?: AdminRole) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.plan && params.plan !== 'all') query.set('plan', params.plan);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());

    const res = await fetch(`/api/admin/users?${query.toString()}`, {
      headers: getAdminHeaders(role),
    });
    return handleResponse<{ users: AdminUserRecord[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(res);
  },

  async getUserDetails(userId: string, role?: AdminRole) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      headers: getAdminHeaders(role),
    });
    return handleResponse<{ user: AdminUserRecord }>(res);
  },

  async updateUserStatus(userId: string, status: 'active' | 'suspended', reason?: string, role?: AdminRole) {
    const res = await fetch(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: getAdminHeaders(role),
      body: JSON.stringify({ status, reason }),
    });
    return handleResponse<{ success: boolean; user: AdminUserRecord }>(res);
  },

  async updateUserPlan(userId: string, plan: PlanType, reason?: string, role?: AdminRole) {
    const res = await fetch(`/api/admin/users/${userId}/plan`, {
      method: 'PATCH',
      headers: getAdminHeaders(role),
      body: JSON.stringify({ plan, reason }),
    });
    return handleResponse<{ success: boolean; user: AdminUserRecord }>(res);
  },

  async resetUserUsage(userId: string, reason?: string, role?: AdminRole) {
    const res = await fetch(`/api/admin/users/${userId}/reset-usage`, {
      method: 'POST',
      headers: getAdminHeaders(role),
      body: JSON.stringify({ reason }),
    });
    return handleResponse<{ success: boolean; message: string; usage: any }>(res);
  },

  // Subscriptions
  async getSubscriptions(role?: AdminRole) {
    const res = await fetch('/api/admin/subscriptions', {
      headers: getAdminHeaders(role),
    });
    return handleResponse<{ subscriptions: AdminSubscription[]; paymentGatewayStatus: string; message: string }>(res);
  },

  // Plans
  async getPlans(role?: AdminRole) {
    const res = await fetch('/api/admin/plans', {
      headers: getAdminHeaders(role),
    });
    return handleResponse<{ plans: AdminPlanConfig[] }>(res);
  },

  async updatePlan(planId: string, updates: Partial<AdminPlanConfig>, role?: AdminRole) {
    const res = await fetch(`/api/admin/plans/${planId}`, {
      method: 'PATCH',
      headers: getAdminHeaders(role),
      body: JSON.stringify(updates),
    });
    return handleResponse<{ success: boolean; plan: AdminPlanConfig }>(res);
  },

  // AI Usage & Logs
  async getAIUsage(role?: AdminRole) {
    const res = await fetch('/api/admin/ai-usage', {
      headers: getAdminHeaders(role),
    });
    return handleResponse<{ metrics: AdminAIUsageMetrics }>(res);
  },

  async getAILogs(limit = 50, role?: AdminRole) {
    const res = await fetch(`/api/admin/ai-logs?limit=${limit}`, {
      headers: getAdminHeaders(role),
    });
    return handleResponse<{ logs: AIGenerationLog[] }>(res);
  },

  // Maps
  async getMaps(search?: string, role?: AdminRole) {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`/api/admin/maps${query}`, {
      headers: getAdminHeaders(role),
    });
    return handleResponse<{ maps: AdminMapSummary[] }>(res);
  },

  // Templates
  async getTemplates(role?: AdminRole) {
    const res = await fetch('/api/admin/templates', {
      headers: getAdminHeaders(role),
    });
    return handleResponse<{ templates: AdminTemplateRecord[] }>(res);
  },

  async createTemplate(templateData: Partial<AdminTemplateRecord>, role?: AdminRole) {
    const res = await fetch('/api/admin/templates', {
      method: 'POST',
      headers: getAdminHeaders(role),
      body: JSON.stringify(templateData),
    });
    return handleResponse<{ success: boolean; template: AdminTemplateRecord }>(res);
  },

  async updateTemplate(id: string, updates: Partial<AdminTemplateRecord>, role?: AdminRole) {
    const res = await fetch(`/api/admin/templates/${id}`, {
      method: 'PATCH',
      headers: getAdminHeaders(role),
      body: JSON.stringify(updates),
    });
    return handleResponse<{ success: boolean; template: AdminTemplateRecord }>(res);
  },

  async deleteTemplate(id: string, role?: AdminRole) {
    const res = await fetch(`/api/admin/templates/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(role),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Workspaces
  async getWorkspaces(role?: AdminRole) {
    const res = await fetch('/api/admin/workspaces', {
      headers: getAdminHeaders(role),
    });
    return handleResponse<{ workspaces: AdminWorkspaceRecord[] }>(res);
  },

  // Notifications
  async broadcastNotification(payload: Partial<AdminNotificationBroadcast>, role?: AdminRole) {
    const res = await fetch('/api/admin/notifications', {
      method: 'POST',
      headers: getAdminHeaders(role),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; broadcast: AdminNotificationBroadcast }>(res);
  },

  async getNotifications(role?: AdminRole) {
    const res = await fetch('/api/admin/notifications', {
      headers: getAdminHeaders(role),
    });
    return handleResponse<{ notifications: AdminNotificationBroadcast[] }>(res);
  },

  // Analytics
  async getAnalytics(role?: AdminRole) {
    const res = await fetch('/api/admin/analytics', {
      headers: getAdminHeaders(role),
    });
    return handleResponse<{ metrics: any }>(res);
  },

  // Audit Logs
  async getAuditLogs(limit = 100, role?: AdminRole) {
    const res = await fetch(`/api/admin/audit-logs?limit=${limit}`, {
      headers: getAdminHeaders(role),
    });
    return handleResponse<{ auditLogs: AdminAuditLog[] }>(res);
  },

  // Security
  async getSecurityDiagnostics(role?: AdminRole) {
    const res = await fetch('/api/admin/security', {
      headers: getAdminHeaders(role),
    });
    return handleResponse<{ diagnostics: AdminSecurityDiagnostics }>(res);
  },

  // Feature Flags
  async getFeatureFlags(role?: AdminRole) {
    const res = await fetch('/api/admin/features', {
      headers: getAdminHeaders(role),
    });
    return handleResponse<{ features: AdminFeatureFlags }>(res);
  },

  async updateFeatureFlags(updates: Partial<AdminFeatureFlags>, role?: AdminRole) {
    const res = await fetch('/api/admin/features', {
      method: 'PATCH',
      headers: getAdminHeaders(role),
      body: JSON.stringify(updates),
    });
    return handleResponse<{ success: boolean; features: AdminFeatureFlags }>(res);
  },

  // System Settings
  async getSystemSettings(role?: AdminRole) {
    const res = await fetch('/api/admin/settings', {
      headers: getAdminHeaders(role),
    });
    return handleResponse<{ settings: AdminSystemSettings }>(res);
  },

  async updateSystemSettings(updates: Partial<AdminSystemSettings>, role?: AdminRole) {
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: getAdminHeaders(role),
      body: JSON.stringify(updates),
    });
    return handleResponse<{ success: boolean; settings: AdminSystemSettings }>(res);
  },
};
