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

async function getAdminHeaders(overrideRole?: AdminRole): Promise<Record<string, string>> {
  const currentUser = auth.currentUser;
  let token = '';
  if (currentUser) {
    try {
      token = await currentUser.getIdToken(true);
    } catch (e) {
      // ignore
    }
  }

  const userEmail = currentUser?.email?.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
    ? SUPER_ADMIN_EMAIL
    : (currentUser?.email || SUPER_ADMIN_EMAIL);
  const userId = currentUser?.uid || 'admin-starcybercafe';
  const role = overrideRole || (localStorage.getItem('mindflow_admin_role') as AdminRole) || 'SUPER_ADMIN';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-user-email': userEmail,
    'x-user-id': userId,
    'x-admin-role': role,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: any = {};
  try {
    data = JSON.parse(text);
  } catch (e) {
    if (!res.ok) {
      throw new Error(`Admin API error (${res.status}): ${text.includes('<!doctype') ? 'Server returned HTML page instead of JSON' : text.substring(0, 100)}`);
    }
  }
  if (!res.ok) {
    throw new Error(data.message || data.error || `Admin API error (${res.status})`);
  }
  return data as T;
}

export const adminService = {
  // Identity & Auth
  async getIdentity(role?: AdminRole) {
    const headers = await getAdminHeaders(role);
    const res = await fetch('/api/admin/me', { headers });
    return handleResponse<{ admin: { id: string; email: string; role: AdminRole }; system: any }>(res);
  },

  // Dashboard KPIs
  async getDashboard(role?: AdminRole) {
    const headers = await getAdminHeaders(role);
    const res = await fetch('/api/admin/dashboard', { headers });
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

    const headers = await getAdminHeaders(role);
    const res = await fetch(`/api/admin/users?${query.toString()}`, { headers });
    return handleResponse<{ users: AdminUserRecord[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(res);
  },

  async getUserDetails(userId: string, role?: AdminRole) {
    const headers = await getAdminHeaders(role);
    const res = await fetch(`/api/admin/users/${userId}`, { headers });
    return handleResponse<{ user: AdminUserRecord }>(res);
  },

  async updateUserStatus(userId: string, status: 'active' | 'suspended', reason?: string, role?: AdminRole) {
    const headers = await getAdminHeaders(role);
    const res = await fetch(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status, reason }),
    });
    return handleResponse<{ success: boolean; user: AdminUserRecord }>(res);
  },

  async updateUserPlan(userId: string, plan: PlanType, reason?: string, role?: AdminRole) {
    const headers = await getAdminHeaders(role);
    const res = await fetch(`/api/admin/users/${userId}/plan`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ plan, reason }),
    });
    return handleResponse<{ success: boolean; user: AdminUserRecord }>(res);
  },

  async resetUserUsage(userId: string, reason?: string, role?: AdminRole) {
    const headers = await getAdminHeaders(role);
    const res = await fetch(`/api/admin/users/${userId}/reset-usage`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reason }),
    });
    return handleResponse<{ success: boolean; message: string; usage: any }>(res);
  },

  // Subscriptions
  async getSubscriptions(role?: AdminRole) {
    const headers = await getAdminHeaders(role);
    const res = await fetch('/api/admin/subscriptions', { headers });
    return handleResponse<{ subscriptions: AdminSubscription[]; paymentGatewayStatus: string; message: string }>(res);
  },

  // Plans
  async getPlans(role?: AdminRole) {
    const headers = await getAdminHeaders(role);
    const res = await fetch('/api/admin/plans', { headers });
    return handleResponse<{ plans: AdminPlanConfig[] }>(res);
  },

  async updatePlan(planId: string, updates: Partial<AdminPlanConfig>, role?: AdminRole) {
    const headers = await getAdminHeaders(role);
    const res = await fetch(`/api/admin/plans/${planId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    });
    return handleResponse<{ success: boolean; plan: AdminPlanConfig }>(res);
  },

  // AI Usage & Logs
  async getAIUsage(role?: AdminRole) {
    const headers = await getAdminHeaders(role);
    const res = await fetch('/api/admin/ai-usage', { headers });
    return handleResponse<{ metrics: AdminAIUsageMetrics }>(res);
  },

  async getAILogs(limit = 50, role?: AdminRole) {
    const headers = await getAdminHeaders(role);
    const res = await fetch(`/api/admin/ai-logs?limit=${limit}`, { headers });
    return handleResponse<{ logs: AIGenerationLog[] }>(res);
  },

  // Maps
  async getMaps(search?: string, role?: AdminRole) {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const headers = await getAdminHeaders(role);
    const res = await fetch(`/api/admin/maps${query}`, { headers });
    return handleResponse<{ maps: AdminMapSummary[] }>(res);
  },

  // Templates
  async getTemplates(role?: AdminRole) {
    const headers = await getAdminHeaders(role);
    const res = await fetch('/api/admin/templates', { headers });
    return handleResponse<{ templates: AdminTemplateRecord[] }>(res);
  },

  async createTemplate(templateData: Partial<AdminTemplateRecord>, role?: AdminRole) {
    const headers = await getAdminHeaders(role);
    const res = await fetch('/api/admin/templates', {
      method: 'POST',
      headers,
      body: JSON.stringify(templateData),
    });
    return handleResponse<{ success: boolean; template: AdminTemplateRecord }>(res);
  },

  async updateTemplate(id: string, updates: Partial<AdminTemplateRecord>, role?: AdminRole) {
    const headers = await getAdminHeaders(role);
    const res = await fetch(`/api/admin/templates/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    });
    return handleResponse<{ success: boolean; template: AdminTemplateRecord }>(res);
  },

  async deleteTemplate(id: string, role?: AdminRole) {
    const headers = await getAdminHeaders(role);
    const res = await fetch(`/api/admin/templates/${id}`, {
      method: 'DELETE',
      headers,
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Workspaces
  async getWorkspaces(role?: AdminRole) {
    const headers = await getAdminHeaders(role);
    const res = await fetch('/api/admin/workspaces', { headers });
    return handleResponse<{ workspaces: AdminWorkspaceRecord[] }>(res);
  },

  // Notifications
  async broadcastNotification(payload: Partial<AdminNotificationBroadcast>, role?: AdminRole) {
    const headers = await getAdminHeaders(role);
    const res = await fetch('/api/admin/notifications', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; broadcast: AdminNotificationBroadcast }>(res);
  },

  async getNotifications(role?: AdminRole) {
    const headers = await getAdminHeaders(role);
    const res = await fetch('/api/admin/notifications', { headers });
    return handleResponse<{ notifications: AdminNotificationBroadcast[] }>(res);
  },

  // Analytics
  async getAnalytics(role?: AdminRole) {
    const headers = await getAdminHeaders(role);
    const res = await fetch('/api/admin/analytics', { headers });
    return handleResponse<{ metrics: any }>(res);
  },

  // Audit Logs
  async getAuditLogs(limit = 100, role?: AdminRole) {
    const headers = await getAdminHeaders(role);
    const res = await fetch(`/api/admin/audit-logs?limit=${limit}`, { headers });
    return handleResponse<{ auditLogs: AdminAuditLog[] }>(res);
  },

  // Security
  async getSecurityDiagnostics(role?: AdminRole) {
    const headers = await getAdminHeaders(role);
    const res = await fetch('/api/admin/security', { headers });
    return handleResponse<{ diagnostics: AdminSecurityDiagnostics }>(res);
  },

  // Feature Flags
  async getFeatureFlags(role?: AdminRole) {
    const headers = await getAdminHeaders(role);
    const res = await fetch('/api/admin/features', { headers });
    return handleResponse<{ features: AdminFeatureFlags }>(res);
  },

  async updateFeatureFlags(updates: Partial<AdminFeatureFlags>, role?: AdminRole) {
    const headers = await getAdminHeaders(role);
    const res = await fetch('/api/admin/features', {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    });
    return handleResponse<{ success: boolean; features: AdminFeatureFlags }>(res);
  },

  // System Settings
  async getSystemSettings(role?: AdminRole) {
    const headers = await getAdminHeaders(role);
    const res = await fetch('/api/admin/settings', { headers });
    return handleResponse<{ settings: AdminSystemSettings }>(res);
  },

  async updateSystemSettings(updates: Partial<AdminSystemSettings>, role?: AdminRole) {
    const headers = await getAdminHeaders(role);
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    });
    return handleResponse<{ success: boolean; settings: AdminSystemSettings }>(res);
  },
};
