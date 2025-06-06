import { AlertSnackbarService } from './../../commons/shared/alert-snackbar/alert-snackbar.service';
import { ProjectsService } from './../../api/v1/services/projects.service';
// src/app/kanban-board/kanban-board.component.ts
import {
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NewProjectDialog } from './components/new-project-dialog/new-project-dialog';
import { Column, Project, Task } from 'src/app/api/v1/models';
import { NewColumnDialog } from './components/new-column-dialog/new-column-dialog';
import { UpdateColumnDialog } from './components/update-column-dialog/update-column-dialog';
import { ConfirmDialogService } from 'src/app/commons/shared/confirm-dialog/confirm-dialog.service';
import { filter, switchMap } from 'rxjs';
import { ColumnsService } from 'src/app/api/v1/services';
import { NewTaskDialog } from './components/new-task-dialog/new-task-dialog';
import { UpdateTaskDialog } from './components/update-task-dialog/update-task-dialog';
import { TasksService } from 'src/app/api/v1/services';

@Component({
  selector: 'app-kanban-board',
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './kanban-board.html',
  styleUrl: './kanban-board.scss',
})
export class KanbanBoard {
  private readonly cdr = inject(ChangeDetectorRef);
  /** 專案陣列 */
  protected projectsSignal = signal<Project[]>([]);

  protected sortedColumnsSignal = computed(() => {
    return this.currentProjectSignal()?.columns!.sort(
      (a, b) => a.order - b.order,
    );
  });
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
  protected currentProjectSignal = signal<Project | null>(null);

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
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-gray-500',
  ];

  /** 是否正在拖拽中 */
  isDragOver: boolean = false;

  constructor(
    private dialog: MatDialog,
    private projectsService: ProjectsService,
    private alertSnackbarService: AlertSnackbarService,
    private confirmDialogService: ConfirmDialogService,
    private columnsService: ColumnsService,
    private tasksService: TasksService,
  ) {
    this.initQueryProjects();
  }

  /** 產生唯一 ID */
  generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  /** 取得所有連接的拖放列表 ID */
  getConnectedDropLists(): string[] {
    return this.sortedColumnsSignal()?.map(
      (column) => `drop-list-${column.id}`,
    ) || [];
  }

  /** 追蹤任務 ID 以優化效能 */
  trackByTaskId(index: number, task: Task): string {
    return task.id!;
  }

  /** 拖拽處理 */
  drop(event: CdkDragDrop<Task[] | undefined>) {
    console.log(event);

    if (event.previousContainer === event.container) {
      // 在同一個泳道內移動
      moveItemInArray(
        event.container.data!,
        event.previousIndex,
        event.currentIndex,
      );
    } else {
      // 在不同泳道之間移動
      transferArrayItem(
        event.previousContainer.data!,
        event.container.data!,
        event.previousIndex,
        event.currentIndex,
      );

      // 獲取目標泳道 ID
      const targetColumnId = event.container.id.replace('drop-list-', '');
      const task = event.container.data![event.currentIndex];

      // 更新任務的泳道
      this.tasksService
        .apiTasksIdMovePatch({
          id: task.id!,
          body: {
            columnId: targetColumnId,
          },
        })
        .subscribe({
          next: () => {
            this.alertSnackbarService.onCustomSucceededMessage(
              '任務已移動到新的泳道',
            );
          },
          error: (error) => {
            this.alertSnackbarService.onCustomFailedMessage('移動任務失敗');
            // 如果 API 調用失敗，恢復原始狀態
            transferArrayItem(
              event.container.data!,
              event.previousContainer.data!,
              event.currentIndex,
              event.previousIndex,
            );
          },
        });
    }
  }

  /** 更新目前專案資料到專案陣列 */
  updateCurrentProject() {
    this.projects = this.projects.map((project) =>
      project.id === this.currentProject.id
        ? { ...this.currentProject }
        : project,
    );
    this.cdr.detectChanges();
  }

  /** 專案管理 - 切換專案 */
  switchProject(projectId: string) {
    // const project = this.projects.find((p) => p.id === projectId);
    // if (project) {
    //   this.currentProject = project;
    // }

    this.getProjectDetail(projectId);
  }

  /** 專案管理 - 顯示新增專案表單 */
  openCreateProjectDialog() {
    // this.showProjectForm = true;
    // this.editingProject = null;
    // this.newProject = { name: '', description: '' };
    this.dialog
      .open(NewProjectDialog)
      .afterClosed()
      .subscribe((res) => {
        this.queryProjects();
      });
  }

  /** 專案管理 - 顯示編輯專案表單 */
  showEditProjectForm() {
    // this.editingProject = project;
    // this.newProject = { name: project.name, description: project.description };
    // this.showProjectForm = true;
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
          tasks: [],
        },
        {
          id: this.generateId(),
          title: 'In Progress',
          color: 'bg-yellow-500',
          order: 2,
          tasks: [],
        },
        {
          id: this.generateId(),
          title: 'Done',
          color: 'bg-green-500',
          order: 3,
          tasks: [],
        },
      ],
    };

    this.projects.push(project);
    this.currentProject = project;
    this.closeProjectForm();
  }

  /** 專案管理 - 更新專案 */
  updateProject() {
    if (!this.editingProject || !this.newProject.name?.trim()) return;

    this.projects = this.projects.map((p) =>
      p.id === this.editingProject!.id
        ? {
            ...p,
            name: this.newProject.name!,
            description: this.newProject.description || '',
          }
        : p,
    );

    if (this.currentProject.id === this.editingProject.id) {
      this.currentProject = {
        ...this.currentProject,
        name: this.newProject.name!,
        description: this.newProject.description || '',
      };
    }

    this.closeProjectForm();
  }

  /** 專案管理 - 刪除專案 */
  deleteProject(projectId?: string) {
    if (projectId == null) return; // 至少保留一個專案
    this.confirmDialogService
      .onDeleteConfirm()
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        switchMap(() =>
          this.projectsService.apiProjectsIdDelete({ id: projectId }),
        ),
      )
      .subscribe({
        next: (res) => {
          this.alertSnackbarService.onDeleteRequestSucceeded();
          this.queryProjects();
        },
        error: (error: any) =>
          this.alertSnackbarService.onDeleteRequestFailed(),
      });
  }

  /** 專案管理 - 關閉專案表單 */
  closeProjectForm() {
    this.dialog
      .open(NewProjectDialog)
      .afterClosed()
      .subscribe((res) => {});
  }

  /** 泳道管理 - 顯示新增泳道表單 */
  openCreateColumnDialog() {
    if (!this.currentProjectSignal()) return;

    this.dialog
      .open(NewColumnDialog, {
        data: {
          projectId: this.currentProjectSignal()!.id!,
          columnSize: this.currentProjectSignal()!.columns!.length,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.getProjectDetail(this.currentProjectSignal()!.id!);
        }
      });
  }

  /** 泳道管理 - 顯示編輯泳道表單 */
  showEditColumnForm(column: Column) {
    if (!this.currentProjectSignal()) return;

    this.dialog
      .open(UpdateColumnDialog, {
        data: {
          projectId: this.currentProjectSignal()!.id!,
          column,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.getProjectDetail(this.currentProjectSignal()!.id!);
        }
      });
  }

  /** 泳道管理 - 建立泳道 */
  createColumn() {
    if (!this.newColumn.title?.trim()) return;

    const column: Column = {
      id: this.generateId(),
      title: this.newColumn.title,
      color: this.newColumn.color || 'bg-blue-500',
      order: this.currentProject.columns!.length + 1,
      tasks: [],
    };

    this.currentProject.columns!.push(column);
    this.updateCurrentProject();
    this.closeColumnForm();
  }

  /** 泳道管理 - 更新泳道 */
  updateColumn() {
    if (!this.editingColumn || !this.newColumn.title?.trim()) return;

    this.currentProject.columns = this.currentProject.columns!.map((col) =>
      col.id === this.editingColumn!.id
        ? { ...col, title: this.newColumn.title!, color: this.newColumn.color! }
        : col,
    );

    this.updateCurrentProject();
    this.closeColumnForm();
  }

  /** 泳道管理 - 刪除泳道 */
  deleteColumn(columnId: string) {
    this.confirmDialogService
      .onDeleteConfirm()
      .afterClosed()
      .pipe(filter((res) => !!res))
      .subscribe((res) => {
        this.columnsService
          .apiColumnsIdDelete({
            id: columnId,
          })
          .subscribe({
            next: (res) => {
              this.alertSnackbarService.onDeleteRequestSucceeded();
              this.getProjectDetail(this.currentProjectSignal()!.id!);
            },
            error: (error: any) =>
              this.alertSnackbarService.onDeleteRequestFailed(),
          });
      });
  }

  /** 泳道管理 - 關閉泳道表單 */
  closeColumnForm() {
    this.showColumnForm = false;
    this.editingColumn = null;
    this.newColumn = { title: '', color: 'bg-blue-500' };
  }

  /** 取得排序後的泳道 */
  getSortedColumns(): Column[] {
    return [...this.currentProject.columns!].sort((a, b) => a.order - b.order);
  }

  /** 任務管理 - 顯示新增任務表單 */
  openAddTaskDialog(columnId: string) {
    this.dialog
      .open(NewTaskDialog, {
        data: { projectId: this.currentProjectSignal()!.id!, columnId },
      })
      .afterClosed()
      .pipe(filter((res) => !!res))
      .subscribe((result) => {
        this.getProjectDetail(this.currentProjectSignal()!.id!);
      });
  }

  /** 任務管理 - 顯示編輯任務表單 */
  openUpdateTaskDialog(task: Task) {
    const dialogRef = this.dialog.open(UpdateTaskDialog, {
      data: { task },
    });

    dialogRef
      .afterClosed()
      .pipe(filter((res) => !!res))
      .subscribe((result) => {
        this.getProjectDetail(this.currentProjectSignal()!.id!);
      });
  }

  /** 任務管理 - 新增任務 */
  private addTask(columnId: string, taskData: Partial<Task>) {
    // this.tasksService
    //   .apiColumnsColumnIdTasksPost({
    //     columnId,
    //     body: taskData,
    //   })
    //   .subscribe({
    //     next: () => {
    //       this.getProjectDetail(this.currentProjectSignal()!.id!);
    //     },
    //     error: () => {
    //       this.alertSnackbarService.onAttachRequestFailed();
    //     },
    //   });
  }

  /** 任務管理 - 更新任務 */
  protected updateTask(taskId: string, taskData: Partial<Task>) {
    // this.tasksService
    //   .apiTasksIdPut({
    //     id: taskId,
    //     body: taskData,
    //   })
    //   .subscribe({
    //     next: () => {
    //       this.getProjectDetail(this.currentProjectSignal()!.id!);
    //     },
    //     error: () => {
    //       this.alertSnackbarService.onAttachRequestFailed();
    //     },
    //   });
  }

  protected dragTask(task: Task, columnId: string) {
    this.tasksService
      .apiTasksIdMovePatch({
        id: task.id!,
        body: {
          columnId: columnId,
        },
      })
      .subscribe({
        next: () => {
          this.getProjectDetail(this.currentProjectSignal()!.id!);
        },
        error: () => {
          this.alertSnackbarService.onAttachRequestFailed();
        },
      });
  }

  /** 任務管理 - 取消編輯 */
  cancelEdit() {
    this.editingTask = null;
    this.resetNewTask();
  }

  /** 任務管理 - 刪除任務 */
  deleteTask(taskId: string) {
    this.currentProject.columns = this.currentProject.columns!.map((col) => ({
      ...col,
      tasks: col.tasks!.filter((t) => t.id !== taskId),
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

  protected initQueryProjects() {
    this.projectsService.apiProjectsGet().subscribe({
      next: (res) => {
        this.projectsSignal.set(res as Project[]);
        if (res.length > 0) {
          this.currentProjectSignal.set(res[0] as Project);
        }
        // this.cdr.detectChanges();
      },
      error: (error: any) => this.alertSnackbarService.onQueryRequestFailed(),
    });
  }


  protected queryProjects() {
    this.projectsService.apiProjectsGet().subscribe({
      next: (res) => {
        this.projectsSignal.set(res as Project[]);
        // this.cdr.detectChanges();
      },
      error: (error: any) => this.alertSnackbarService.onQueryRequestFailed(),
    });
  }

  private getProjectDetail(id: string) {
    this.projectsService.apiProjectsIdGet({ id: id }).subscribe({
      next: (res) => {
        this.currentProjectSignal.set(res as Project);
      },
      error: (error: any) => this.alertSnackbarService.onQueryRequestFailed(),
    });
  }
}
