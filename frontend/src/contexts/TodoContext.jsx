import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useRef } from 'react';
import apiService from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const TodoContext = createContext(undefined);

const initialState = {
  todos: [],
  loading: false,
  error: null,
  filters: {},
  stats: null,
  categories: [],
};

const todoReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_TODOS':
      return { ...state, todos: action.payload };
    case 'ADD_TODO':
      return { ...state, todos: [action.payload, ...state.todos] };
    case 'UPDATE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo._id === action.payload._id ? action.payload : todo
        ),
      };
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo._id !== action.payload),
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'CLEAR_FILTERS':
      return { ...state, filters: {} };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    default:
      return state;
  }
};

export const TodoProvider = ({ children }) => {
  const [state, dispatch] = useReducer(todoReducer, initialState);
  const { isAuthenticated } = useAuth();
  // Track which todo IDs have already triggered a due reminder this session
  const notifiedRef = useRef(new Set());

  // Load previously notified IDs from session storage (once)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('notifiedTodoIds');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          notifiedRef.current = new Set(parsed);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const fetchTodos = useCallback(async (filters) => {
    if (!isAuthenticated) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const { todos } = await apiService.getTodos(filters);
      dispatch({ type: 'SET_TODOS', payload: todos });
    } catch (error) {
      const message = error?.response?.data?.error || 'Failed to fetch todos';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isAuthenticated]);

  const createTodo = async (data) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { todo } = await apiService.createTodo(data);
      dispatch({ type: 'ADD_TODO', payload: todo });
      toast.success('Todo created successfully!');
      // refresh stats so counts reflect the new todo
      fetchStats();
    } catch (error) {
      const message = error?.response?.data?.error || 'Failed to create todo';
      toast.error(message);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateTodo = async (id, data) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { todo } = await apiService.updateTodo(id, data);
      dispatch({ type: 'UPDATE_TODO', payload: todo });
      toast.success('Todo updated successfully!');
      // refresh stats as properties might affect derived stats
      fetchStats();
    } catch (error) {
      const message = error?.response?.data?.error || 'Failed to update todo';
      toast.error(message);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const toggleTodo = async (id) => {
    try {
      const { todo } = await apiService.toggleTodo(id);
      dispatch({ type: 'UPDATE_TODO', payload: todo });
      toast.success(todo.completed ? 'Todo completed!' : 'Todo marked as incomplete');
      // refresh stats to update completed/pending/overdue numbers
      fetchStats();
    } catch (error) {
      const message = error?.response?.data?.error || 'Failed to toggle todo';
      toast.error(message);
      throw error;
    }
  };

  const deleteTodo = async (id) => {
    try {
      await apiService.deleteTodo(id);
      dispatch({ type: 'DELETE_TODO', payload: id });
      toast.success('Todo deleted successfully!');
      // refresh stats after deletion
      fetchStats();
    } catch (error) {
      const message = error?.response?.data?.error || 'Failed to delete todo';
      toast.error(message);
      throw error;
    }
  };

  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const { stats } = await apiService.getTodoStats();
      dispatch({ type: 'SET_STATS', payload: stats });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, [isAuthenticated]);

  const fetchCategories = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const { categories } = await apiService.getCategories();
      dispatch({ type: 'SET_CATEGORIES', payload: categories });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, [isAuthenticated]);

  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const clearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' });
  };

  // Initial data fetch - only when authenticated
  // Fetch stats and categories once; todos are fetched by the filters-based effect below
  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchCategories();
    }
  }, [isAuthenticated, fetchStats, fetchCategories]);

  // Refetch todos whenever filters change
  useEffect(() => {
    if (isAuthenticated) {
      fetchTodos(state.filters);
    }
  }, [isAuthenticated, state.filters, fetchTodos]);

  // Compute notification list: overdue or due today & not completed
  const notifications = useMemo(() => {
    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return state.todos.filter(t => {
      if (!t.dueDate || t.completed) return false;
      const due = new Date(t.dueDate);
      return due <= endOfToday; // includes overdue and due today
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [state.todos]);

  const overdueCount = useMemo(() => notifications.filter(t => new Date(t.dueDate) < new Date() && !t.completed).length, [notifications]);
  const dueTodayCount = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return notifications.filter(t => {
      const d = new Date(t.dueDate);
      return d >= start && d <= end;
    }).length;
  }, [notifications]);

  // Periodically check and toast newly due tasks (overdue or due today)
  useEffect(() => {
    if (!isAuthenticated) return;

    const notify = () => {
      const now = new Date();
      const dueNow = state.todos.filter(t => {
        if (!t.dueDate || t.completed) return false;
        const due = new Date(t.dueDate);
        return due <= now; // already due
      });

      dueNow.forEach(t => {
        if (!notifiedRef.current.has(t._id)) {
          const dateStr = new Date(t.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
          const timeStr = new Date(t.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const overdue = new Date(t.dueDate) < now;
          toast(overdue ? `Task overdue: ${t.title} (was due ${dateStr} ${timeStr})` : `Task due: ${t.title} (due ${dateStr} ${timeStr})`, {
            icon: '⏰',
          });
          notifiedRef.current.add(t._id);
        }
      });

      // persist to session storage
      try {
        sessionStorage.setItem('notifiedTodoIds', JSON.stringify(Array.from(notifiedRef.current)));
      } catch (e) {
        // ignore
      }
    };

    // Run immediately and then every minute
    notify();
    const id = setInterval(notify, 60 * 1000);
    return () => clearInterval(id);
  }, [isAuthenticated, state.todos]);

  const value = {
    ...state,
    fetchTodos,
    createTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    fetchStats,
    fetchCategories,
    setFilters,
    clearFilters,
    // Notifications exposed to UI
    notifications,
    overdueCount,
    dueTodayCount,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
};