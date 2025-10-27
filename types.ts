export type Theme = 'light' | 'dark';

export type Page = 'home' | 'chat' | 'projects' | 'search' | 'profile';

export type Language = 'en' | 'ta';

export type ToastType = 'success' | 'info' | 'error';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: 'Education' | 'Work' | 'Research' | 'Other' | '';
  timestamp: string;
  deadline: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Active' | 'Completed' | 'Archived';
  isPinned: boolean;
  chatHistory: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  lang?: Language;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate: string;
}

export interface Note {
  id: string;
  text: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  type: 'project' | 'task' | 'general';
  link?: Page;
  contextId?: string;
}