// src/app/kanban-board/kanban-board.component.ts
import { Component } from '@angular/core';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Project, Task, Column } from './intefaces/task.interface';

@Component({
  selector: 'app-kanban-board',
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
  ],
  templateUrl: './kanban-board.html',
  styleUrl: './kanban-board.scss',
})
export class KanbanBoard {
   /** 專案陣列 */
   projects: Project[] = [
    {
      id: 'project-1',
      name: '網站重構專案',
      description: '公司官網的全面重構與優化',
      createdAt: '2025-06-01',
      columns: [
        {
          id: 'todo',
          title: 'To Do',
          color: 'bg-blue-500',
          order: 1,
          tasks: [
            {
              id: '1',
              title: '設計用戶界面',
              description: '創建主要頁面的 wireframe 和設計稿',
              assignee: 'Alice',
              dueDate: '2025-06-10',
              priority: 'high',
              tags: ['設計', 'UI/UX'],
            },
            {
              id: '2',
              title: '建立資料庫結構',
              description: '設計並實作項目所需的資料庫表結構',
              assignee: 'Bob',
              dueDate: '2025-06-12',
              priority: 'medium',
              tags: ['後端', '資料庫'],
            },
          ],
        },
        {
          id: 'inprogress',
          title: 'In Progress',
          color: 'bg-yellow-500',
          order: 2,
          tasks: [
            {
              id: '3',
              title: 'API 開發',
              description: '實作用戶認證和基本 CRUD API',
              assignee: 'Charlie',
              dueDate: '2025-06-15',
              priority: 'high',
              tags: ['後端', 'API'],
            },
          ],
        },
        {
          id: 'review',
          title: 'Review',
          color: 'bg-purple-500',
          order: 3,
          tasks: [
            {
              id: '4',
              title: '前端元件開發',
              description: '完成可重用的 React 元件庫',
              assignee: 'David',
              dueDate: '2025-06-08',
              priority: 'medium',
              tags: ['前端', 'React'],
            },
          ],
        },
        {
          id: 'done',
          title: 'Done',
          color: 'bg-green-500',
          order: 4,
          tasks: [
            {
              id: '5',
              title: '項目規劃',
              description: '完成項目需求分析和技術選型',
              assignee: 'Eve',
              dueDate: '2025-06-05',
              priority: 'low',
              tags: ['規劃', '分析'],
            },
          ],
        },
      ],
    },
    {
      id: 'project-2',
      name: '行動應用開發',
      description: 'iOS 和 Android 應用程式開發',
      createdAt: '2025-06-03',
      columns: [
        {
          id: 'backlog',
          title: 'Backlog',
          color: 'bg-gray-500',
          order: 1,
          tasks: [
            {
              id: '6',
              title: '需求分析',
              description: '收集和分析用戶需求',
              assignee: 'Frank',
              dueDate: '2025-06-20',
              priority: 'high',
              tags: ['分析', '需求'],
            },
          ],
        },
        {
          id: 'development',
          title: 'Development',
          color: 'bg-orange-500',
          order: 2,
          tasks: [],
        },
        {
          id: 'testing',
          title: 'Testing',
          color: 'bg-red-500',
          order: 3,
          tasks: [],
        },
      ],
    },
  ];

  /** 目前選中的專案 */
  currentProject: Project = this.projects[0];

  /** 目前正在哪個欄位顯示「新增任務表單」 */
  showAddTaskColumn: string | null = null;

  /** 目前正在編輯的任務 */
  editingTask: Task | null = null;

  /** 顯示專案表單 */
  showProjectForm: boolean = false;

  /** 顯示泳道表單 */
  showColumnForm: boolean = false;

  /** 正在編輯的專案 */
  editingProject: Project | null = null;

  /** 正在編輯的泳道 */
  editingColumn: Column | null = null;

  /** 用來在新增/編輯表單綁定資料的臨時物件 */
  newTask: Partial<Task> = {
    title: '',
    description: '',
    assignee: '',
    dueDate: '',
    priority: 'medium',
    tags: [],
  };

  /** 新專案表單資料 */
  newProject: Partial<Project> = {
    name: '',
    description: '',
  };

  /** 新泳道表單資料 */
  newColumn: Partial<Column> = {
    title: '',
    color: 'bg-blue-500',
  };

  /** 用於標籤輸入的字串 */
  tagsInputValue: string = '';

  /** 顏色選項 */
  colorOptions: string[] = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500',
    'bg-teal-500', 'bg-gray-500'
  ];

  /** 產生唯一 ID */
  generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  /** 拖拽處理 */
  drop(event: CdkDragDrop<Task[]>, columnId: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    // 更新專案資料
    this.updateCurrentProject();
  }

  /** 更新目前專案資料到專案陣列 */
  updateCurrentProject() {
    this.projects = this.projects.map(project =>
      project.id === this.currentProject.id ? { ...this.currentProject } : project
    );
  }

  /** 專案管理 - 切換專案 */
  switchProject(projectId: string) {
    const project = this.projects.find(p => p.id === projectId);
    if (project) {
      this.currentProject = project;
    }
  }

  /** 專案管理 - 顯示新增專案表單 */
  showCreateProjectForm() {
    this.showProjectForm = true;
    this.editingProject = null;
    this.newProject = { name: '', description: '' };
  }

  /** 專案管理 - 顯示編輯專案表單 */
  showEditProjectForm(project: Project) {
    this.editingProject = project;
    this.newProject = { name: project.name, description: project.description };
    this.showProjectForm = true;
  }

  /** 專案管理 - 建立專案 */
  createProject() {
    if (!this.newProject.name?.trim()) return;

    const project: Project = {
      id: this.generateId(),
      name: this.newProject.name,
      description: this.newProject.description || '',
      createdAt: new Date().toISOString().split('T')[0],
      columns: [
        {
          id: this.generateId(),
          title: 'To Do',
          color: 'bg-blue-500',
          order: 1,
          tasks: []
        },
        {
          id: this.generateId(),
          title: 'In Progress',
          color: 'bg-yellow-500',
          order: 2,
          tasks: []
        },
        {
          id: this.generateId(),
          title: 'Done',
          color: 'bg-green-500',
          order: 3,
          tasks: []
        }
      ]
    };

    this.projects.push(project);
    this.currentProject = project;
    this.closeProjectForm();
  }

  /** 專案管理 - 更新專案 */
  updateProject() {
    if (!this.editingProject || !this.newProject.name?.trim()) return;

    this.projects = this.projects.map(p =>
      p.id === this.editingProject!.id
        ? { ...p, name: this.newProject.name!, description: this.newProject.description || '' }
        : p
    );

    if (this.currentProject.id === this.editingProject.id) {
      this.currentProject = {
        ...this.currentProject,
        name: this.newProject.name!,
        description: this.newProject.description || ''
      };
    }

    this.closeProjectForm();
  }

  /** 專案管理 - 刪除專案 */
  deleteProject(projectId: string) {
    if (this.projects.length <= 1) return; // 至少保留一個專案

    this.projects = this.projects.filter(p => p.id !== projectId);

    if (this.currentProject.id === projectId) {
      this.currentProject = this.projects[0];
    }
  }

  /** 專案管理 - 關閉專案表單 */
  closeProjectForm() {
    this.showProjectForm = false;
    this.editingProject = null;
    this.newProject = { name: '', description: '' };
  }

  /** 泳道管理 - 顯示新增泳道表單 */
  showCreateColumnForm() {
    this.showColumnForm = true;
    this.editingColumn = null;
    this.newColumn = { title: '', color: 'bg-blue-500' };
  }

  /** 泳道管理 - 顯示編輯泳道表單 */
  showEditColumnForm(column: Column) {
    this.editingColumn = column;
    this.newColumn = { title: column.title, color: column.color };
    this.showColumnForm = true;
  }

  /** 泳道管理 - 建立泳道 */
  createColumn() {
    if (!this.newColumn.title?.trim()) return;

    const column: Column = {
      id: this.generateId(),
      title: this.newColumn.title,
      color: this.newColumn.color || 'bg-blue-500',
      order: this.currentProject.columns.length + 1,
      tasks: []
    };

    this.currentProject.columns.push(column);
    this.updateCurrentProject();
    this.closeColumnForm();
  }

  /** 泳道管理 - 更新泳道 */
  updateColumn() {
    if (!this.editingColumn || !this.newColumn.title?.trim()) return;

    this.currentProject.columns = this.currentProject.columns.map(col =>
      col.id === this.editingColumn!.id
        ? { ...col, title: this.newColumn.title!, color: this.newColumn.color! }
        : col
    );

    this.updateCurrentProject();
    this.closeColumnForm();
  }

  /** 泳道管理 - 刪除泳道 */
  deleteColumn(columnId: string) {
    if (this.currentProject.columns.length <= 1) return; // 至少保留一個泳道

    this.currentProject.columns = this.currentProject.columns.filter(col => col.id !== columnId);
    this.updateCurrentProject();
  }

  /** 泳道管理 - 關閉泳道表單 */
  closeColumnForm() {
    this.showColumnForm = false;
    this.editingColumn = null;
    this.newColumn = { title: '', color: 'bg-blue-500' };
  }

  /** 取得排序後的泳道 */
  getSortedColumns(): Column[] {
    return [...this.currentProject.columns].sort((a, b) => a.order - b.order);
  }

  /** 任務管理 - 顯示新增任務表單 */
  showAddForm(columnId: string) {
    this.showAddTaskColumn = columnId;
    this.resetNewTask();
  }

  /** 任務管理 - 重設新任務表單 */
  resetNewTask() {
    this.newTask = {
      title: '',
      description: '',
      assignee: '',
      dueDate: '',
      priority: 'medium',
      tags: [],
    };
    this.tagsInputValue = '';
  }

  /** 任務管理 - 處理標籤輸入變更 */
  onTagsInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.tagsInputValue = target.value;
    this.newTask.tags = target.value
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0);
  }

  /** 任務管理 - 新增任務 */
  addTask(columnId: string) {
    if (!this.newTask.title?.trim()) return;

    const task: Task = {
      id: this.generateId(),
      title: this.newTask.title!.trim(),
      description: this.newTask.description || '',
      assignee: this.newTask.assignee || '',
      dueDate: this.newTask.dueDate || '',
      priority: (this.newTask.priority as 'low' | 'medium' | 'high') || 'medium',
      tags: this.newTask.tags ? [...this.newTask.tags] : [],
    };

    this.currentProject.columns = this.currentProject.columns.map((col) =>
      col.id === columnId ? { ...col, tasks: [...col.tasks, task] } : col
    );

    this.updateCurrentProject();
    this.showAddTaskColumn = null;
    this.resetNewTask();
  }

  /** 任務管理 - 編輯任務 */
  editTask(task: Task) {
    this.editingTask = { ...task };
    this.newTask = { ...task };
    this.tagsInputValue = task.tags?.join(', ') || '';
  }

  /** 任務管理 - 更新任務 */
  updateTask() {
    if (!this.editingTask || !this.newTask.title?.trim()) return;

    this.currentProject.columns = this.currentProject.columns.map((col) => ({
      ...col,
      tasks: col.tasks.map((t) =>
        t.id === this.editingTask!.id
          ? {
              ...t,
              title: this.newTask.title!.trim(),
              description: this.newTask.description || '',
              assignee: this.newTask.assignee || '',
              dueDate: this.newTask.dueDate || '',
              priority: (this.newTask.priority as 'low' | 'medium' | 'high') || 'medium',
              tags: this.newTask.tags ? [...this.newTask.tags] : [],
            }
          : t
      ),
    }));

    this.updateCurrentProject();
    this.cancelEdit();
  }

  /** 任務管理 - 取消編輯 */
  cancelEdit() {
    this.editingTask = null;
    this.resetNewTask();
  }

  /** 任務管理 - 刪除任務 */
  deleteTask(taskId: string) {
    this.currentProject.columns = this.currentProject.columns.map((col) => ({
      ...col,
      tasks: col.tasks.filter((t) => t.id !== taskId),
    }));

    this.updateCurrentProject();
  }

  /** 取得優先級顏色 */
  getPriorityColor(priority: 'low' | 'medium' | 'high'): string {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  /** 格式化日期 */
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('zh-TW');
  }
}
