import { AlertSnackbarService } from './../../commons/shared/alert-snackbar/alert-snackbar.service';
// src/app/kanban-board/kanban-board.component.ts
import { Component, computed, signal } from '@angular/core';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NewProjectDialog } from './components/new-project-dialog/new-project-dialog';
import { Project, Column } from 'src/app/api/v1/models';
import { NewColumnDialog } from './components/new-column-dialog/new-column-dialog';
import { ConfirmDialogService } from 'src/app/commons/shared/confirm-dialog/confirm-dialog.service';
import { filter, switchMap } from 'rxjs';
import { UpdateProjectDialog } from './components/update-project-dialog/update-project-dialog';
import { ColumnCard } from './components/column-card/column-card';
import { ColumnService, ProjectService } from 'src/app/api/v1/services';

@Component({
  selector: 'app-kanban-board',
  imports: [CommonModule, FormsModule, DragDropModule, ColumnCard],
  templateUrl: './kanban-board.html',
  styleUrl: './kanban-board.scss',
})
export class KanbanBoard {
  /** 專案陣列 */
  protected projectsSignal = signal<Project[]>([]);

  /** 目前選中的專案 */
  protected currentProjectSignal = signal<Project | null>(null);

  protected sortedColumnsSignal = computed(() => {
    return this.currentProjectSignal()?.columns?.sort(
      (a, b) => a.order! - b.order!,
    );
  });

  constructor(
    private dialog: MatDialog,
    private projectsService: ProjectService,
    private columnsService: ColumnService,
    private alertSnackbarService: AlertSnackbarService,
    private confirmDialogService: ConfirmDialogService,
  ) {
    this.initQueryProjects();
  }

  protected totalTasks = computed(() => {
    return this.currentProjectSignal()?.columns?.reduce(
      (total, column) => total + (column.tasks?.length || 0),
      0,
    );
  });

  /** 專案管理 - 切換專案 */
  protected switchProject(projectId: string) {
    this.getProjectDetail(projectId!);
  }

  /** 專案管理 - 顯示新增專案表單 */
  protected openNewProjectDialog() {
    this.dialog
      .open(NewProjectDialog)
      .afterClosed()
      .pipe(filter((res) => !!res))
      .subscribe(() => {
        this.initQueryProjects();
      });
  }

  /** 專案管理 - 顯示編輯專案表單 */
  protected openUpdateProjectDialog() {
    this.dialog
      .open(UpdateProjectDialog, {
        data: {
          project: this.currentProjectSignal(),
        },
      })
      .afterClosed()
      .pipe(filter((res) => !!res))
      .subscribe(() => {
        this.getProjectDetail(this.currentProjectSignal()!.id!);
        this.queryProjects();
      });
  }

  /** 專案管理 - 刪除專案 */
  protected deleteProject(projectId: string) {
    this.confirmDialogService
      .onDeleteConfirm()
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        switchMap(() =>
          this.projectsService.apiProjectsIdDelete({
            id: projectId,
          }),
        ),
      )
      .subscribe({
        next: () => {
          this.alertSnackbarService.onDeleteRequestSucceeded();
          this.initQueryProjects();
        },
        error: () => {
          this.alertSnackbarService.onDeleteRequestFailed();
        },
      });
  }

  /** 泳道管理 - 顯示新增泳道表單 */
  protected openNewColumnDialog() {
    if (!this.currentProjectSignal()) return;

    this.dialog
      .open(NewColumnDialog, {
        data: {
          projectId: this.currentProjectSignal()!.id!,
          columnSize: this.sortedColumnsSignal()?.length || 0,
        },
      })
      .afterClosed()
      .pipe(filter((res) => !!res))
      .subscribe(() => {
        this.getProjectDetail(this.currentProjectSignal()!.id!);
      });
  }

  /** 泳道拖曳處理 */
  protected onColumnDrop(event: CdkDragDrop<Column[]>) {
    if (!this.currentProjectSignal() || !this.sortedColumnsSignal()) return;

    const columns = [...this.sortedColumnsSignal()!];
    moveItemInArray(columns, event.previousIndex, event.currentIndex);

    this.columnsService
      .apiProjectsProjectIdColumnsReorderPatch({
        projectId: this.currentProjectSignal()!.id!,
        body: {
          columnIds: columns.map((column, index) => column.id!),
        },
      })
      .subscribe(
        () => {
          this.alertSnackbarService.onCustomSucceededMessage('泳道順序已更新');
          this.getProjectDetail(this.currentProjectSignal()!.id!);
        },
        () => {
          this.alertSnackbarService.onCustomFailedMessage('更新泳道順序失敗');
        },
      );
    // 更新泳道順序
    // const updatePromises = columns.map((column, index) => {
    //   return this.columnsService
    //     .apiColumnsIdPut({
    //       id: column.id!,
    //       body: { order: index },
    //     })
    //     .toPromise();
    // });

    // Promise.all(updatePromises)
    //   .then(() => {
    //     this.alertSnackbarService.onCustomSucceededMessage('泳道順序已更新');
    //     this.getProjectDetail(this.currentProjectSignal()!.id!);
    //   })
    //   .catch((error) => {
    //     console.error('更新泳道順序失敗:', error);
    //     this.alertSnackbarService.onCustomFailedMessage('更新泳道順序失敗');
    //   });
  }

  protected initQueryProjects() {
    this.projectsService.apiProjectsGet$Json().subscribe({
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

  protected getProjectDetail(id: string) {
    this.projectsService.apiProjectsIdGet$Json({ id: id }).subscribe({
      next: (res) => {
        this.currentProjectSignal.set(res);
      },
      error: () => {
        this.alertSnackbarService.onAttachRequestFailed();
      },
    });
  }

  private queryProjects() {
    this.projectsService.apiProjectsGet$Json().subscribe({
      next: (res) => {
        this.projectsSignal.set(res as Project[]);
      },
      error: (error: any) => this.alertSnackbarService.onQueryRequestFailed(),
    });
  }

  /** 泳道管理 - 顯示新增泳道表單 */
  protected openCreateColumnDialog() {
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
}
