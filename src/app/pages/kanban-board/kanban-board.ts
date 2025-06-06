import { AlertSnackbarService } from './../../commons/shared/alert-snackbar/alert-snackbar.service';
import { ProjectsService } from './../../api/v1/services/projects.service';
// src/app/kanban-board/kanban-board.component.ts
import { Component, computed, signal } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NewProjectDialog } from './components/new-project-dialog/new-project-dialog';
import { Project } from 'src/app/api/v1/models';
import { NewColumnDialog } from './components/new-column-dialog/new-column-dialog';
import { ConfirmDialogService } from 'src/app/commons/shared/confirm-dialog/confirm-dialog.service';
import { filter, switchMap } from 'rxjs';
import { UpdateProjectDialog } from './components/update-project-dialog/update-project-dialog';
import { ColumnCard } from './components/column-card/column-card';

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
    return this.currentProjectSignal()?.columns!.sort(
      (a, b) => a.order - b.order,
    );
  });

  constructor(
    private dialog: MatDialog,
    private projectsService: ProjectsService,
    private alertSnackbarService: AlertSnackbarService,
    private confirmDialogService: ConfirmDialogService,
  ) {
    this.initQueryProjects();
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
  openUpdateProjectDialog() {
    // TODO
    this.dialog
      .open(UpdateProjectDialog, {
        data: {
          project: this.currentProjectSignal(),
        },
      })
      .afterClosed()
      .pipe(filter((res) => !!res))
      .subscribe((res) => {
        this.queryProjects();
        this.getProjectDetail(this.currentProjectSignal()!.id!);
      });
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

  protected getProjectDetail(id: string) {
    this.projectsService.apiProjectsIdGet({ id: id }).subscribe({
      next: (res) => {
        this.currentProjectSignal.set(res as Project);
      },
      error: (error: any) => this.alertSnackbarService.onQueryRequestFailed(),
    });
  }
}
