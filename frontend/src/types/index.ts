export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Todo {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  tags: string[];
  dueDate?: string;
  completedAt?: string;
  user: string;
  position: number;
  isArchived: boolean;
  attachments: Array<{
    filename: string;
    url: string;
    uploadedAt: string;
  }>;
  notes?: string;
  isOverdue?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  highPriority: number;
  urgent: number;
  completionRate: number;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface TodoFilters {
  completed?: boolean;
  category?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  filters: TodoFilters;
  stats: TodoStats | null;
  categories: string[];
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  details?: any[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface CreateTodoData {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  tags?: string[];
  dueDate?: string;
  notes?: string;
}

export interface UpdateTodoData extends Partial<CreateTodoData> {}

export interface Theme {
  name: 'light' | 'dark';
  icon: string;
}

export interface Priority {
  value: 'low' | 'medium' | 'high' | 'urgent';
  label: string;
  color: string;
  bgColor: string;
}

export interface AdminStats {
  usersCount: number;
  adminsCount: number;
  todosCount: number;
}