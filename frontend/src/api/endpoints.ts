import axiosClient from './axiosClient';

// Auth
export const authApi = {
  login: (data: { email: string; password: string; totpCode?: string }) =>
    axiosClient.post('/auth/login', data),
  refresh: (refreshToken: string) =>
    axiosClient.post('/auth/refresh', { refreshToken }),
  logout: () => axiosClient.post('/auth/logout'),
  mfaSetup: () => axiosClient.get('/auth/mfa/setup'),
  mfaConfirm: (code: string) => axiosClient.post('/auth/mfa/confirm', { code }),
  changePassword: (oldPassword: string, newPassword: string) =>
    axiosClient.post('/auth/change-password', { oldPassword, newPassword }),
  listUsers: () => axiosClient.get('/auth/users'),
};

// Dashboard
export const dashboardApi = {
  get: () => axiosClient.get('/dashboard'),
};

// Finance
export const financeApi = {
  getDashboard: (months = 6) => axiosClient.get(`/finance/dashboard?months=${months}`),
};

// Expenses
export const expenseApi = {
  list: (page = 0, size = 20) => axiosClient.get(`/expenses?page=${page}&size=${size}`),
  getById: (id: number) => axiosClient.get(`/expenses/${id}`),
  create: (data: unknown) => axiosClient.post('/expenses', data),
  update: (id: number, data: unknown) => axiosClient.put(`/expenses/${id}`, data),
  delete: (id: number) => axiosClient.delete(`/expenses/${id}`),
  approve: (id: number) => axiosClient.put(`/expenses/${id}/approve`),
  reject: (id: number) => axiosClient.put(`/expenses/${id}/reject`),
  uploadInvoice: (id: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return axiosClient.post(`/expenses/${id}/upload-invoice`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  summary: (start: string, end: string) =>
    axiosClient.get(`/expenses/summary?start=${start}&end=${end}`),
};

// Sales Invoices
export const salesApi = {
  list: (page = 0, size = 20) => axiosClient.get(`/sales-invoices?page=${page}&size=${size}`),
  getById: (id: number) => axiosClient.get(`/sales-invoices/${id}`),
  create: (data: unknown) => axiosClient.post('/sales-invoices', data),
  update: (id: number, data: unknown) => axiosClient.put(`/sales-invoices/${id}`, data),
  overdue: () => axiosClient.get('/sales-invoices/overdue'),
  addPayment: (id: number, data: unknown) => axiosClient.post(`/sales-invoices/${id}/payments`, data),
  outstanding: () => axiosClient.get('/sales-invoices/outstanding-total'),
};

// Farmers
export const farmerApi = {
  list: (page = 0, size = 20) => axiosClient.get(`/farmers?page=${page}&size=${size}`),
  getById: (id: number) => axiosClient.get(`/farmers/${id}`),
  create: (data: unknown) => axiosClient.post('/farmers', data),
  update: (id: number, data: unknown) => axiosClient.put(`/farmers/${id}`, data),
  uploadPhoto: (id: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return axiosClient.post(`/farmers/${id}/photos`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getPurchases: (id: number) => axiosClient.get(`/farmers/${id}/purchases`),
  recordPurchase: (id: number, data: unknown) => axiosClient.post(`/farmers/${id}/purchases`, data),
};

// Manufacturers
export const manufacturerApi = {
  list: (page = 0, size = 20) => axiosClient.get(`/manufacturers?page=${page}&size=${size}`),
  getById: (id: number) => axiosClient.get(`/manufacturers/${id}`),
  create: (data: unknown) => axiosClient.post('/manufacturers', data),
  update: (id: number, data: unknown) => axiosClient.put(`/manufacturers/${id}`, data),
};

// Inventory
export const inventoryApi = {
  list: (page = 0, size = 20) => axiosClient.get(`/inventory?page=${page}&size=${size}`),
  getById: (id: number) => axiosClient.get(`/inventory/${id}`),
  create: (data: unknown) => axiosClient.post('/inventory', data),
  update: (id: number, data: unknown) => axiosClient.put(`/inventory/${id}`, data),
  adjustStock: (id: number, data: unknown) => axiosClient.post(`/inventory/${id}/adjust`, data),
  lowStock: () => axiosClient.get('/inventory/low-stock'),
  expiringSoon: (days = 30) => axiosClient.get(`/inventory/expiring-soon?days=${days}`),
};

// Customers (CRM)
export const customerApi = {
  list: (page = 0, size = 20) => axiosClient.get(`/customers?page=${page}&size=${size}`),
  getById: (id: number) => axiosClient.get(`/customers/${id}`),
  create: (data: unknown) => axiosClient.post('/customers', data),
  update: (id: number, data: unknown) => axiosClient.put(`/customers/${id}`, data),
  updateStage: (id: number, stage: string) =>
    axiosClient.patch(`/customers/${id}/stage`, { stage }),
  byStage: (stage: string) => axiosClient.get(`/customers/by-stage/${stage}`),
};

// Meetings
export const meetingApi = {
  list: (page = 0, size = 20) => axiosClient.get(`/meetings?page=${page}&size=${size}`),
  getById: (id: number) => axiosClient.get(`/meetings/${id}`),
  create: (data: unknown) => axiosClient.post('/meetings', data),
  update: (id: number, data: unknown) => axiosClient.put(`/meetings/${id}`, data),
  upcoming: (days = 7) => axiosClient.get(`/meetings/upcoming?days=${days}`),
};

// Tasks
export const taskApi = {
  list: (page = 0, size = 20) => axiosClient.get(`/tasks?page=${page}&size=${size}`),
  getById: (id: number) => axiosClient.get(`/tasks/${id}`),
  create: (data: unknown) => axiosClient.post('/tasks', data),
  update: (id: number, data: unknown) => axiosClient.put(`/tasks/${id}`, data),
  updateStatus: (id: number, status: string) =>
    axiosClient.patch(`/tasks/${id}/status`, { status }),
  overdue: () => axiosClient.get('/tasks/overdue'),
};

// Shipments (Export)
export const shipmentApi = {
  list: (page = 0, size = 20) => axiosClient.get(`/shipments?page=${page}&size=${size}`),
  getById: (id: number) => axiosClient.get(`/shipments/${id}`),
  create: (data: unknown) => axiosClient.post('/shipments', data),
  update: (id: number, data: unknown) => axiosClient.put(`/shipments/${id}`, data),
  byStatus: (status: string) => axiosClient.get(`/shipments/status/${status}`),
  upcomingArrivals: (days = 30) => axiosClient.get(`/shipments/upcoming-arrivals?days=${days}`),
};

// Documents
export const documentApi = {
  list: (page = 0, size = 20) => axiosClient.get(`/documents?page=${page}&size=${size}`),
  getById: (id: number) => axiosClient.get(`/documents/${id}`),
  upload: (formData: FormData) =>
    axiosClient.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateMeta: (id: number, data: unknown) => axiosClient.put(`/documents/${id}`, data),
  delete: (id: number) => axiosClient.delete(`/documents/${id}`),
  byCategory: (category: string) => axiosClient.get(`/documents/category/${category}`),
  expiringSoon: (days = 30) => axiosClient.get(`/documents/expiring-soon?days=${days}`),
  search: (q: string) => axiosClient.get(`/documents/search?q=${encodeURIComponent(q)}`),
};

// AI Assistant
export const aiApi = {
  query: (question: string, context?: string) =>
    axiosClient.post('/ai/query', { question, context }),
  summarizeMeeting: (notes: string) =>
    axiosClient.post('/ai/summarize-meeting', { notes }),
  paymentReminder: (data: unknown) =>
    axiosClient.post('/ai/payment-reminder', data),
  cashFlowPrediction: (historicalData: string) =>
    axiosClient.post('/ai/cashflow-prediction', { historicalData }),
};
