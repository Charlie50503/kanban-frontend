// src/app/kanban-board/interfaces/task.interface.ts
export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

export interface Column {
  id: string;
  title: string;
  color: string;
  order: number;
  tasks: Task[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  columns: Column[];
}