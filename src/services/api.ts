const API_BASE_URL = '/api';

// Lấy token từ localStorage
const getAuthToken = () => {
  return localStorage.getItem('hrm_token');
};

// Tạo headers với authorization
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Generic API call function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    headers: getAuthHeaders(),
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API call failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  getCurrentUser: async () => {
    return apiCall('/auth/me');
  },

  logout: async () => {
    return apiCall('/auth/logout', { method: 'POST' });
  }
};

// Employee API
export const employeeAPI = {
  getAll: async (params?: { department?: string; status?: string; search?: string }) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return apiCall(`/employees${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: string) => {
    return apiCall(`/employees/${id}`);
  },

  create: async (employeeData: any) => {
    return apiCall('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData)
    });
  },

  update: async (id: string, employeeData: any) => {
    return apiCall(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData)
    });
  },

  delete: async (id: string) => {
    return apiCall(`/employees/${id}`, { method: 'DELETE' });
  }
};

// Attendance API
export const attendanceAPI = {
  checkIn: async (location: string, type: string = 'office') => {
    return apiCall('/attendance/checkin', {
      method: 'POST',
      body: JSON.stringify({ location, type })
    });
  },

  checkOut: async () => {
    return apiCall('/attendance/checkout', { method: 'POST' });
  },

  getHistory: async (params?: { startDate?: string; endDate?: string; employeeId?: string }) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return apiCall(`/attendance/history${queryString ? `?${queryString}` : ''}`);
  },

  getStats: async (params?: { month?: string; year?: string; employeeId?: string }) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return apiCall(`/attendance/stats${queryString ? `?${queryString}` : ''}`);
  }
};

// Leave API
export const leaveAPI = {
  create: async (leaveData: any) => {
    return apiCall('/leaves', {
      method: 'POST',
      body: JSON.stringify(leaveData)
    });
  },

  getAll: async (params?: { status?: string; type?: string; employeeId?: string }) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return apiCall(`/leaves${queryString ? `?${queryString}` : ''}`);
  },

  approve: async (id: string, status: 'approved' | 'rejected') => {
    return apiCall(`/leaves/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  getBalance: async (employeeId?: string) => {
    return apiCall(`/leaves/balance${employeeId ? `/${employeeId}` : ''}`);
  }
};

// Task API
export const taskAPI = {
  create: async (taskData: any) => {
    return apiCall('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  },

  getAll: async (params?: { status?: string; priority?: string; assignedTo?: string }) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return apiCall(`/tasks${queryString ? `?${queryString}` : ''}`);
  },

  updateProgress: async (id: string, progress: number) => {
    return apiCall(`/tasks/${id}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progress })
    });
  },

  updateStatus: async (id: string, status: string) => {
    return apiCall(`/tasks/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  addComment: async (id: string, comment: string) => {
    return apiCall(`/tasks/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment })
    });
  },

  getStats: async () => {
    return apiCall('/tasks/stats');
  }
};

// Asset API
export const assetAPI = {
  getAll: async (params?: { status?: string; type?: string; search?: string }) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return apiCall(`/assets${queryString ? `?${queryString}` : ''}`);
  },

  create: async (assetData: any) => {
    return apiCall('/assets', {
      method: 'POST',
      body: JSON.stringify(assetData)
    });
  },

  assign: async (id: string, employeeId: string) => {
    return apiCall(`/assets/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ employee_id: employeeId })
    });
  },

  return: async (id: string) => {
    return apiCall(`/assets/${id}/return`, { method: 'PUT' });
  },

  update: async (id: string, assetData: any) => {
    return apiCall(`/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(assetData)
    });
  },

  getStats: async () => {
    return apiCall('/assets/stats');
  }
};

// Report API
export const reportAPI = {
  create: async (reportData: any) => {
    return apiCall('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData)
    });
  },

  saveDraft: async (reportData: any) => {
    return apiCall('/reports/draft', {
      method: 'POST',
      body: JSON.stringify(reportData)
    });
  },

  getAll: async (params?: { status?: string; type?: string; employeeId?: string; startDate?: string; endDate?: string }) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return apiCall(`/reports${queryString ? `?${queryString}` : ''}`);
  },

  approve: async (id: string, status: 'approved' | 'rejected', feedback?: string) => {
    return apiCall(`/reports/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ status, feedback })
    });
  },

  getStats: async () => {
    return apiCall('/reports/stats');
  }
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    return apiCall('/dashboard/stats');
  },

  getRecentActivities: async () => {
    return apiCall('/dashboard/recent-activities');
  }
};