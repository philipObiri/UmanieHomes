import { api } from './client';
import type {
  AuthTokens,
  LoginCredentials,
  PaginatedResponse,
  Property,
  BlogPost,
  TeamMember,
  Testimonial,
  FAQ,
  Tenant,
  ThemeConfig,
  User,
  Lead,
} from '../types';

// Auth
export const authApi = {
  login: (creds: LoginCredentials) =>
    api.post<AuthTokens>('/auth/login/', creds).then((r) => r.data),
  logout: (refresh: string) =>
    api.post('/auth/logout/', { refresh }).then((r) => r.data),
  me: () => api.get<User>('/auth/me/').then((r) => r.data),
  changePassword: (data: { old_password: string; new_password: string }) =>
    api.post('/auth/password/change/', data).then((r) => r.data),
};

// Tenant
export const tenantApi = {
  current: () => api.get<Tenant>('/tenants/current/').then((r) => r.data),
  updateCurrent: (data: Record<string, unknown>) =>
    api.patch<Tenant>('/tenants/current/', data).then((r) => r.data),
  theme: () => api.get<ThemeConfig>('/themes/').then((r) => r.data),
  settings: () => api.get('/tenants/settings/').then((r) => r.data),
  updateSettings: (data: Record<string, unknown>) =>
    api.patch('/tenants/settings/', data).then((r) => r.data),
  requestExport: () =>
    api.post<{ task_id: string }>('/tenants/export/').then((r) => r.data),
  exportStatus: (taskId: string) =>
    api.get<{ status: string; download_url?: string }>(`/tenants/export/${taskId}/`).then((r) => r.data),
};

// Properties
export const propertiesApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Property>>('/properties/listings/', { params }).then((r) => r.data),
  featured: () =>
    api.get<Property[]>('/properties/featured/').then((r) =>
      Array.isArray(r.data) ? { count: r.data.length, results: r.data, next: null, previous: null } : r.data
    ),
  get: (id: number | string) =>
    api.get<Property>(`/properties/listings/${id}/`).then((r) => r.data),
  inquire: (id: number | string, data: Partial<Lead>) =>
    api.post(`/properties/listings/${id}/inquire/`, data).then((r) => r.data),
  create: (data: FormData | Partial<Property>) =>
    api.post('/properties/listings/', data).then((r) => r.data),
  update: (id: number, data: Partial<Property>) =>
    api.patch(`/properties/listings/${id}/`, data).then((r) => r.data),
  delete: (id: number) =>
    api.delete(`/properties/listings/${id}/`).then((r) => r.data),
  uploadImage: (id: number, formData: FormData) =>
    api.post(`/properties/listings/${id}/images/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
  listImages: (id: number) =>
    api.get(`/properties/listings/${id}/images/`).then((r) => r.data),
  deleteImage: (propertyId: number, imageId: number) =>
    api.delete(`/properties/listings/${propertyId}/images/${imageId}/`).then((r) => r.data),
  setPrimaryImage: (propertyId: number, imageId: number) =>
    api.patch(`/properties/listings/${propertyId}/images/${imageId}/`, { is_primary: true }).then((r) => r.data),
};

// CMS
export const cmsApi = {
  posts: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<BlogPost>>('/cms/posts/', { params }).then((r) => r.data),
  post: (slug: string) =>
    api.get<BlogPost>(`/cms/posts/${slug}/`).then((r) => r.data),
  createPost: (data: Record<string, unknown>) =>
    api.post('/cms/posts/', data).then((r) => r.data),
  updatePost: (slug: string, data: Record<string, unknown>) =>
    api.patch(`/cms/posts/${slug}/`, data).then((r) => r.data),
  deletePost: (slug: string) =>
    api.delete(`/cms/posts/${slug}/`).then((r) => r.data),
  pages: () =>
    api.get('/cms/pages/').then((r) => r.data),
  page: (slug: string) =>
    api.get(`/cms/pages/${slug}/`).then((r) => r.data),
  createPage: (data: Record<string, unknown>) =>
    api.post('/cms/pages/', data).then((r) => r.data),
  updatePage: (slug: string, data: Record<string, unknown>) =>
    api.patch(`/cms/pages/${slug}/`, data).then((r) => r.data),
  deletePage: (slug: string) =>
    api.delete(`/cms/pages/${slug}/`).then((r) => r.data),
  media: (params?: Record<string, unknown>) =>
    api.get('/cms/media/', { params }).then((r) => r.data),
  uploadMedia: (formData: FormData) =>
    api.post('/cms/media/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
  deleteMedia: (id: number) =>
    api.delete(`/cms/media/${id}/`).then((r) => r.data),
  team: () =>
    api.get<PaginatedResponse<TeamMember>>('/cms/team/').then((r) => r.data),
  createTeamMember: (formData: FormData) =>
    api.post('/cms/team/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  updateTeamMember: (id: number, formData: FormData) =>
    api.patch(`/cms/team/${id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  deleteTeamMember: (id: number) =>
    api.delete(`/cms/team/${id}/`).then((r) => r.data),
  testimonials: () =>
    api.get<PaginatedResponse<Testimonial>>('/cms/testimonials/').then((r) => r.data),
  createTestimonial: (data: FormData) =>
    api.post('/cms/testimonials/', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  updateTestimonial: (id: number, data: FormData) =>
    api.patch(`/cms/testimonials/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  deleteTestimonial: (id: number) =>
    api.delete(`/cms/testimonials/${id}/`).then((r) => r.data),
  faqs: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<FAQ>>('/cms/faqs/', { params }).then((r) => r.data),
};

// CRM
export const crmApi = {
  leads: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Lead>>('/crm/leads/', { params }).then((r) => r.data),
  lead: (id: number) =>
    api.get<Lead>(`/crm/leads/${id}/`).then((r) => r.data),
  createLead: (data: Partial<Lead>) =>
    api.post('/crm/leads/', data).then((r) => r.data),
  updateLead: (id: number, data: Partial<Lead>) =>
    api.patch(`/crm/leads/${id}/`, data).then((r) => r.data),
  deleteLead: (id: number) =>
    api.delete(`/crm/leads/${id}/`).then((r) => r.data),
  tours: (params?: Record<string, unknown>) =>
    api.get('/crm/tours/', { params }).then((r) => r.data),
  createTour: (data: Record<string, unknown>) =>
    api.post('/crm/tours/', data).then((r) => r.data),
  updateTour: (id: number, data: Record<string, unknown>) =>
    api.patch(`/crm/tours/${id}/`, data).then((r) => r.data),
  clients: (params?: Record<string, unknown>) =>
    api.get('/crm/clients/', { params }).then((r) => r.data),
};

// Helpdesk
export const helpdeskApi = {
  tickets: (params?: Record<string, unknown>) =>
    api.get('/helpdesk/tickets/', { params }).then((r) => r.data),
  ticket: (id: number) =>
    api.get(`/helpdesk/tickets/${id}/`).then((r) => r.data),
  createTicket: (data: Record<string, unknown>) =>
    api.post('/helpdesk/tickets/', data).then((r) => r.data),
  updateTicket: (id: number, data: Record<string, unknown>) =>
    api.patch(`/helpdesk/tickets/${id}/`, data).then((r) => r.data),
  createChatSession: () =>
    api.post('/helpdesk/chat/sessions/').then((r) => r.data),
  chatSession: (id: number) =>
    api.get(`/helpdesk/chat/sessions/${id}/`).then((r) => r.data),
};

// Analytics
export const analyticsApi = {
  dashboard: () =>
    api.get('/analytics/dashboard/').then((r) => r.data),
  platform: () =>
    api.get('/analytics/platform/').then((r) => r.data),
};

// Financials
export const financialsApi = {
  deals: (params?: Record<string, unknown>) =>
    api.get('/financials/deals/', { params }).then((r) => r.data),
  deal: (id: number) =>
    api.get(`/financials/deals/${id}/`).then((r) => r.data),
  createDeal: (data: Record<string, unknown>) =>
    api.post('/financials/deals/', data).then((r) => r.data),
  updateDeal: (id: number, data: Record<string, unknown>) =>
    api.patch(`/financials/deals/${id}/`, data).then((r) => r.data),
  commissions: (params?: Record<string, unknown>) =>
    api.get('/financials/commissions/', { params }).then((r) => r.data),
  invoices: (params?: Record<string, unknown>) =>
    api.get('/financials/invoices/', { params }).then((r) => r.data),
  invoicePdf: (id: number) =>
    api.get(`/financials/invoices/${id}/pdf/`, { responseType: 'blob' }).then((r) => r.data),
  createInvoice: (data: Record<string, unknown>) =>
    api.post('/financials/invoices/', data).then((r) => r.data),
  updateInvoice: (id: number, data: Record<string, unknown>) =>
    api.patch(`/financials/invoices/${id}/`, data).then((r) => r.data),
};

// Team / Users
export const teamApi = {
  members: () =>
    api.get('/team/members/').then((r) => r.data),
  member: (id: number) =>
    api.get(`/team/members/${id}/`).then((r) => r.data),
};

// Notifications
export const notificationsApi = {
  list: () => api.get('/notifications/').then((r) => r.data),
  markRead: (ids: number[]) =>
    api.post('/notifications/mark-read/', { ids }).then((r) => r.data),
  subscribePush: (subscription: { endpoint: string; p256dh: string; auth: string }) =>
    api.post('/notifications/push-subscriptions/', subscription).then((r) => r.data),
};
