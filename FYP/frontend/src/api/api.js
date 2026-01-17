import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  registerStudent: (data) => api.post('/auth/register/student/', data),
  registerCleaner: (data) => api.post('/auth/register/cleaner/', data),
  login: (data) => api.post('/auth/login/', data),
  getCurrentUser: () => api.get('/auth/me/'),
  forgotPassword: (email) => api.post('/auth/forgot-password/', { email }),
  resetPassword: (data) => api.post('/auth/reset-password/', data),
};

// Booking APIs
export const bookingAPI = {
  list: (params) => api.get('/bookings/', { params }),
  create: (data) => api.post('/bookings/', data),
  get: (id) => api.get(`/bookings/${id}/`),
  update: (id, data) => api.put(`/bookings/${id}/`, data),
  assignCleaner: (id, cleanerId) => api.post(`/bookings/${id}/assign_cleaner/`, { cleaner_id: cleanerId }),
  updateStatus: (id, status) => api.post(`/bookings/${id}/update_status/`, { status }),
  myBookings: () => api.get('/bookings/my_bookings/'),
  history: () => api.get('/bookings/history/'),
  acceptBooking: (id) => api.post(`/cleaner/bookings/${id}/accept/`),
  
  // Payment APIs
  markOfflinePayment: (id) => api.post(`/bookings/${id}/payment/offline/`),
  uploadPaymentReceipt: (id, formData) => {
    return api.post(`/bookings/${id}/payment/receipt/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Cleaner APIs
export const cleanerAPI = {
  newRequests: () => api.get('/cleaner/tasks/new/'),
  todayTasks: () => api.get('/cleaner/tasks/today/'),
  allTasks: () => api.get('/cleaner/tasks/all/'),
  history: () => api.get('/cleaner/history/'),
  stats: () => api.get('/cleaner/stats/'),
};

// Issue APIs
export const issueAPI = {
  list: () => api.get('/issues/'),
  create: (data) => api.post('/issues/', data),
  get: (id) => api.get(`/issues/${id}/`),
  updateStatus: (id, data) => api.post(`/issues/${id}/update_status/`, data),
};

// Admin APIs
export const adminAPI = {
  stats: () => api.get('/admin/stats/'),
  cleanersList: () => api.get('/admin/cleaners/'),
  availableCleaners: () => api.get('/admin/cleaners/available/'),
  toggleCleanerStatus: (userId) => api.post(`/admin/cleaners/${userId}/toggle-status/`),
  paymentReceipts: () => api.get('/admin/payment-receipts/'),
};

// Notification APIs
export const notificationAPI = {
  list: () => api.get('/notifications/'),
  markRead: (id) => api.post(`/notifications/${id}/mark_read/`),
  markAllRead: () => api.post('/notifications/mark_all_read/'),
  unreadCount: () => api.get('/notifications/unread_count/'),
};

// Profile APIs
export const profileAPI = {
  getStudent: () => api.get('/profile/student/'),
  updateStudent: (data) => api.put('/profile/student/', data),
  getCleaner: () => api.get('/profile/cleaner/'),
  updateCleaner: (data) => api.put('/profile/cleaner/', data),
};

export default api;
