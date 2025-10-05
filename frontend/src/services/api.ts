import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  Todo, 
  TodoStats, 
  LoginCredentials, 
  RegisterCredentials, 
  CreateTodoData, 
  UpdateTodoData,
  Pagination,
  AdminStats,
} from '../types';

// Ensure provided REACT_APP_API_URL includes '/api' suffix; append if missing.
// This avoids 404s when env is set to 'http://localhost:5000' instead of 'http://localhost:5000/api'.
const ensureApiBase = (url?: string) => {
  const fallback = 'http://localhost:5000/api';
  if (!url || url.trim() === '') return fallback;
  // If it already contains '/api' segment, use as is
  if (/\/api(\/|$)/.test(url)) return url;
  return url.endsWith('/') ? `${url}api` : `${url}/api`;
};

const API_BASE_URL = ensureApiBase(process.env.REACT_APP_API_URL);

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      // Prevent requests from hanging forever; surface an error so UI can recover
      timeout: 15000,
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
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
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(credentials: RegisterCredentials): Promise<{ user: User; token: string }> {
    const response: AxiosResponse<{ user: User; token: string; message: string }> = 
      await this.api.post('/auth/register', credentials);
    return response.data;
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response: AxiosResponse<{ user: User; token: string; message: string }> = 
      await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async googleLogin(idToken: string): Promise<{ user: User; token: string }> {
    const response: AxiosResponse<{ user: User; token: string; message?: string }> =
      await this.api.post('/auth/google', { idToken });
    return response.data;
  }

  async demoAdminLogin(): Promise<{ user: User; token: string }> {
    const response: AxiosResponse<{ user: User; token: string; message?: string }> =
      await this.api.post('/auth/demo-admin');
    return response.data;
  }

  async getProfile(): Promise<{ user: User }> {
    const response: AxiosResponse<{ user: User }> = await this.api.get('/auth/me');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<{ user: User; message: string }> {
    const response: AxiosResponse<{ user: User; message: string }> = 
      await this.api.put('/auth/profile', data);
    return response.data;
  }

  // Todo endpoints
  async getTodos(params?: {
    completed?: boolean;
    category?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ todos: Todo[]; pagination: Pagination }> {
    const response: AxiosResponse<{ todos: Todo[]; pagination: Pagination }> = 
      await this.api.get('/todos', { params });
    return response.data;
  }

  async getTodo(id: string): Promise<{ todo: Todo }> {
    const response: AxiosResponse<{ todo: Todo }> = await this.api.get(`/todos/${id}`);
    return response.data;
  }

  async createTodo(data: CreateTodoData): Promise<{ todo: Todo; message: string }> {
    const response: AxiosResponse<{ todo: Todo; message: string }> = 
      await this.api.post('/todos', data);
    return response.data;
  }

  async updateTodo(id: string, data: UpdateTodoData): Promise<{ todo: Todo; message: string }> {
    const response: AxiosResponse<{ todo: Todo; message: string }> = 
      await this.api.put(`/todos/${id}`, data);
    return response.data;
  }

  async toggleTodo(id: string): Promise<{ todo: Todo; message: string }> {
    const response: AxiosResponse<{ todo: Todo; message: string }> = 
      await this.api.patch(`/todos/${id}/toggle`);
    return response.data;
  }

  async deleteTodo(id: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = 
      await this.api.delete(`/todos/${id}`);
    return response.data;
  }

  async getTodoStats(): Promise<{ stats: TodoStats }> {
    const response: AxiosResponse<{ stats: TodoStats }> = 
      await this.api.get('/todos/stats/overview');
    return response.data;
  }

  async getTodoBreakdown(): Promise<{ breakdown: { priority: Record<string, number>; category: Record<string, number> } }> {
    const response: AxiosResponse<{ breakdown: { priority: Record<string, number>; category: Record<string, number> } }> =
      await this.api.get('/todos/stats/breakdown');
    return response.data;
  }

  async getTodoTrend(days = 14): Promise<{ trend: { date: string; count: number }[] }> {
    const response: AxiosResponse<{ trend: { date: string; count: number }[] }> =
      await this.api.get('/todos/stats/trend', { params: { days } });
    return response.data;
  }

  async getCategories(): Promise<{ categories: string[] }> {
    const response: AxiosResponse<{ categories: string[] }> = 
      await this.api.get('/todos/categories');
    return response.data;
  }

  // Admin endpoints
  async getAdminStats(): Promise<{ stats: AdminStats }> {
    const response: AxiosResponse<{ stats: AdminStats }> = 
      await this.api.get('/admin/stats');
    return response.data;
  }

  async getAllUsers(): Promise<{ users: User[] }> {
    const response: AxiosResponse<{ users: User[] }> = 
      await this.api.get('/admin/users');
    return response.data;
  }

  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<{ user: User; message: string }> {
    const response: AxiosResponse<{ user: User; message: string }> = 
      await this.api.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  }

  // Admin: Todos management
  async getAdminTodos(params?: {
    userId?: string;
    completed?: boolean;
    priority?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ todos: Todo[]; pagination: Pagination }> {
    const response: AxiosResponse<{ todos: Todo[]; pagination: Pagination }> =
      await this.api.get('/admin/todos', { params });
    return response.data;
  }

  async adminToggleTodo(id: string): Promise<{ todo: Todo; message: string }> {
    const response: AxiosResponse<{ todo: Todo; message: string }> =
      await this.api.patch(`/admin/todos/${id}/toggle`);
    return response.data;
  }

  async adminDeleteTodo(id: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> =
      await this.api.delete(`/admin/todos/${id}`);
    return response.data;
  }

  async getAdminAnalytics(): Promise<{ perUser: Array<{ userId: string; username: string; email: string; completed: number; pending: number; total: number }>; perPriority: Array<{ priority: string; completed: number; pending: number }> }> {
    const response: AxiosResponse<{ perUser: Array<{ userId: string; username: string; email: string; completed: number; pending: number; total: number }>; perPriority: Array<{ priority: string; completed: number; pending: number }> }> =
      await this.api.get('/admin/analytics');
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string; timestamp: string }> {
    const response: AxiosResponse<{ status: string; message: string; timestamp: string }> = 
      await this.api.get('/health');
    return response.data;
  }

}

export const apiService = new ApiService();
export default apiService; 