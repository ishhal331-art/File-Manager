import { User, UploadedFile, AppNotification, FileType } from '../types';

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Storage disabled/insecure on iOS Safari private mode
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // ignore
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // ignore
    }
  },
};

let authToken: string | null = safeStorage.getItem('files_manager_token') || safeStorage.getItem('clay_portal_token');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    safeStorage.setItem('files_manager_token', token);
  } else {
    safeStorage.removeItem('files_manager_token');
    safeStorage.removeItem('clay_portal_token');
  }
}

export function getAuthToken(): string | null {
  return authToken || safeStorage.getItem('files_manager_token') || safeStorage.getItem('clay_portal_token');
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type');
    let data: any = {};
    if (contentType && contentType.includes('application/json')) {
      data = await response.json().catch(() => ({}));
    } else {
      const text = await response.text().catch(() => '');
      data = { message: text };
    }

    if (!response.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (err: any) {
    if (err.message && err.message !== 'Failed to fetch') {
      throw err;
    }
    console.warn(`Network request to ${endpoint} failed:`, err?.message || err);
    throw new Error(err?.message || 'Network connection unavailable.');
  }
}

export const api = {
  // Auth
  login: async (username: string, password: string) => {
    const data = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  register: async (userData: {
    username: string;
    password: string;
    fullName?: string;
    email?: string;
    phone?: string;
    employeeId?: string;
    role?: string;
  }) => {
    const data = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    return request('/api/auth/me');
  },

  logout: async () => {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Logout endpoint error:', err);
    } finally {
      setAuthToken(null);
    }
  },

  forgotPassword: async (username: string) => {
    return request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    return request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
  },

  updateProfile: async (profileData: {
    fullName?: string;
    email?: string;
    phone?: string;
    employeeId?: string;
  }): Promise<{ user: User; message: string }> => {
    return request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Users Management (Admin/Manager)
  getUsers: async (): Promise<{ users: User[] }> => {
    return request('/api/users');
  },

  createUser: async (userData: {
    username: string;
    password: string;
    confirmPassword: string;
    role: string;
    fullName?: string;
    status?: string;
  }) => {
    return request('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  toggleUserStatus: async (userId: string, status: string) => {
    return request(`/api/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  updateUserDetails: async (userId: string, details: { fullName?: string; email?: string; phone?: string; employeeId?: string }) => {
    return request(`/api/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(details),
    });
  },

  adminResetPassword: async (userId: string, newPassword: string, confirmPassword: string) => {
    return request(`/api/users/${userId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword, confirmPassword }),
    });
  },

  // Files & Progress
  getFiles: async (targetUserId?: string): Promise<{ files: UploadedFile[] }> => {
    const query = targetUserId ? `?userId=${encodeURIComponent(targetUserId)}` : '';
    try {
      const data = await request(`/api/files${query}`);
      return { files: Array.isArray(data?.files) ? data.files : [] };
    } catch (err: any) {
      console.warn('api.getFiles error, returning empty files array:', err?.message || err);
      return { files: [] };
    }
  },

  getUserProgress: async (): Promise<{ userProgress: any[] }> => {
    try {
      const data = await request('/api/files/user-progress');
      return { userProgress: Array.isArray(data?.userProgress) ? data.userProgress : [] };
    } catch (err: any) {
      console.warn('api.getUserProgress error, returning empty list:', err?.message || err);
      return { userProgress: [] };
    }
  },

  uploadFile: async (fileData: {
    fileType: FileType;
    fileName: string;
    mimeType: string;
    base64Data?: string;
    textContent?: string;
    period?: string;
  }): Promise<{ file: UploadedFile; message: string }> => {
    return request('/api/files/upload', {
      method: 'POST',
      body: JSON.stringify(fileData),
    });
  },

  deleteFile: async (fileId: string) => {
    return request(`/api/files/${fileId}`, {
      method: 'DELETE',
    });
  },

  updateFileData: async (fileId: string, extractedData: any[], extractedText?: string) => {
    return request(`/api/files/${fileId}/data`, {
      method: 'PUT',
      body: JSON.stringify({ extractedData, extractedText }),
    });
  },

  // Notifications
  getNotifications: async (): Promise<{ notifications: AppNotification[]; unreadCount?: number }> => {
    return request('/api/notifications');
  },

  markNotificationsRead: async (): Promise<{ success: boolean }> => {
    return request('/api/notifications/mark-read', {
      method: 'POST',
    });
  },

  markSingleNotificationRead: async (notificationId: string): Promise<{ success: boolean }> => {
    return request(`/api/notifications/${notificationId}/mark-read`, {
      method: 'POST',
    });
  },

  createNotification: async (title: string, message: string, targetUserId: string = 'ALL') => {
    return request('/api/notifications', {
      method: 'POST',
      body: JSON.stringify({ title, message, targetUserId }),
    });
  },

  replyNotification: async (notificationId: string, message: string) => {
    return request(`/api/notifications/${notificationId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  deleteNotification: async (notificationId: string) => {
    return request(`/api/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },

  // AI Fiscal Intelligence & Questions
  askAI: async (question: string, targetUserId?: string): Promise<{ answer: string; stats?: any }> => {
    return request('/api/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ question, targetUserId }),
    });
  },
};
