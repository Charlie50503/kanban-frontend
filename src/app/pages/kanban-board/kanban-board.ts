import { AlertSnackbarService } from './../../commons/shared/alert-snackbar/alert-snackbar.service';
import { ProjectsService } from './../../api/v1/services/projects.service';
// src/app/kanban-board/kanban-board.component.ts
import { Component, computed, signal } from '@angular/core';
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
import { TaskCard } from './components/task-card/task-card';

@Component({
  selector: 'app-kanban-board',
  imports: [CommonModule, FormsModule, DragDropModule, TaskCard],
  templateUrl: './kanban-board.html',
  styleUrl: './kanban-board.scss',
})
export class KanbanBoard {
  /** 專案陣列 */
  protected projectsSignal = signal<Project[]>([]);

  protected sortedColumnsSignal = computed(() => {
    return this.currentProjectSignal()?.columns!.sort(
      (a, b) => a.order - b.order,
    );
  });

  /** 目前選中的專案 */
  protected currentProjectSignal = signal<Project | null>(null);

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
    return (
      this.sortedColumnsSignal()?.map((column) => `drop-list-${column.id}`) ||
      []
    );
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

  /** 專案管理 - 切換專案 */
  switchProject(projectId: string) {
    this.getProjectDetail(projectId);
  }

  /** 專案管理 - 顯示新增專案表單 */
  openCreateProjectDialog() {
    this.dialog
      .open(NewProjectDialog)
      .afterClosed()
      .subscribe((res) => {
        this.queryProjects();
      });
  }

  /** 專案管理 - 顯示編輯專案表單 */
  showEditProjectForm() {
    // TODO
    // this.editingProject = project;
    // this.newProject = { name: project.name, description: project.description };
    // this.showProjectForm = true;
  }

  // /** 專案管理 - 更新專案 */
  // updateProject() {
  //   if (!this.editingProject || !this.newProject.name?.trim()) return;

  //   this.projects = this.projects.map((p) =>
  //     p.id === this.editingProject!.id
  //       ? {
  //           ...p,
  //           name: this.newProject.name!,
  //           description: this.newProject.description || '',
  //         }
  //       : p,
  //   );

  //   if (this.currentProject.id === this.editingProject.id) {
  //     this.currentProject = {
  //       ...this.currentProject,
  //       name: this.newProject.name!,
  //       description: this.newProject.description || '',
  //     };
  //   }

  //   this.closeProjectForm();
  // }

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

  /** 任務管理 - 刪除任務 */
  deleteTask(taskId: string): void {
    this.confirmDialogService
      .onDeleteConfirm()
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        switchMap(() => this.tasksService.apiTasksIdDelete({ id: taskId })),
      )
      .subscribe({
        next: () => {
          // 從所有泳道中移除該任務
          this.sortedColumnsSignal()?.forEach((column) => {
            const taskIndex = column.tasks?.findIndex((t) => t.id === taskId);
            if (taskIndex !== undefined && taskIndex !== -1) {
              column.tasks?.splice(taskIndex, 1);
            }
          });
          this.alertSnackbarService.onDeleteRequestSucceeded();
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          this.alertSnackbarService.onDeleteRequestFailed();
        },
      });
  }

  protected initQueryProjects() {
    this.projectsService.apiProjectsGet().subscribe({
      next: (res) => {
        this.projectsSignal.set(res as Project[]);
        if (res.length > 0) {
          this.currentProjectSignal.set(res[0] as Project);
          this.getProjectDetail(res[0].id!);
        }
      },
      error: (error: any) => this.alertSnackbarService.onQueryRequestFailed(),
    });
  }

  protected queryProjects() {
    this.projectsService.apiProjectsGet().subscribe({
      next: (res) => {
        this.projectsSignal.set(res as Project[]);
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
  protected onTaskDeleted() {
    this.getProjectDetail(this.currentProjectSignal()!.id!);
  }
}
