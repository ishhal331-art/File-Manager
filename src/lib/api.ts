import { User, UploadedFile, AppNotification, FileType } from '../types';

let authToken: string | null = localStorage.getItem('clay_portal_token');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('clay_portal_token', token);
  } else {
    localStorage.removeItem('clay_portal_token');
  }
}

export function getAuthToken(): string | null {
  return authToken || localStorage.getItem('clay_portal_token');
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

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An unexpected server error occurred.');
  }

  return data;
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

  // Users Management (Admin/Manager)
  getUsers: async (): Promise<{ users: User[] }> => {
    return request('/api/users');
  },

  createUser: async (userData: {
    fullName: string;
    username: string;
    password: string;
    confirmPassword: string;
    role: string;
    email?: string;
    phone?: string;
    employeeId?: string;
    status: string;
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

  adminResetPassword: async (userId: string, newPassword: string, confirmPassword: string) => {
    return request(`/api/users/${userId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword, confirmPassword }),
    });
  },

  // Files & Progress
  getFiles: async (targetUserId?: string): Promise<{ files: UploadedFile[] }> => {
    const query = targetUserId ? `?userId=${encodeURIComponent(targetUserId)}` : '';
    return request(`/api/files${query}`);
  },

  getUserProgress: async (): Promise<{ userProgress: any[] }> => {
    return request('/api/files/user-progress');
  },

  uploadFile: async (fileData: {
    fileType: FileType;
    fileName: string;
    mimeType: string;
    base64Data?: string;
    textContent?: string;
  }): Promise<{ file: UploadedFile; message: string }> => {
    return request('/api/files/upload', {
      method: 'POST',
      body: JSON.stringify(fileData),
    });
  },

  updateFileData: async (fileId: string, extractedData: any[], extractedText?: string) => {
    return request(`/api/files/${fileId}/data`, {
      method: 'PUT',
      body: JSON.stringify({ extractedData, extractedText }),
    });
  },

  deleteFile: async (fileId: string) => {
    return request(`/api/files/${fileId}`, {
      method: 'DELETE',
    });
  },

  // Notifications
  getNotifications: async (): Promise<{ notifications: AppNotification[] }> => {
    return request('/api/notifications');
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
};
