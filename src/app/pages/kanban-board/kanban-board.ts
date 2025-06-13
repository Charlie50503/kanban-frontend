import { AlertSnackbarService } from './../../commons/shared/alert-snackbar/alert-snackbar.service';
// src/app/kanban-board/kanban-board.component.ts
import { Component, computed, signal, OnInit, OnDestroy } from '@angular/core';
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
import { filter, switchMap, Subscription, take } from 'rxjs';
import { UpdateProjectDialog } from './components/update-project-dialog/update-project-dialog';
import { ColumnCard } from './components/column-card/column-card';
import { ColumnService, ProjectService } from 'src/app/api/v1/services';
import { KanbanSocketService } from '../../services/kanban-socket.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-kanban-board',
  imports: [CommonModule, FormsModule, DragDropModule, ColumnCard],
  templateUrl: './kanban-board.html',
  styleUrl: './kanban-board.scss',
})
export class KanbanBoard implements OnInit, OnDestroy {
  /** 專案陣列 */
  protected projectsSignal = signal<Project[]>([]);

  /** 目前選中的專案 */
  protected currentProjectSignal = signal<Project | null>(null);

  /** WebSocket 連接狀態 */
  protected isConnectedSignal = signal<boolean>(false);

  protected sortedColumnsSignal = computed(() => {
    return this.currentProjectSignal()?.columns?.sort(
      (a, b) => a.order! - b.order!,
    );
  });

  private subscriptions: Subscription[] = [];
  private pendingProjectId: string | null = null;

  constructor(
    private dialog: MatDialog,
    private projectsService: ProjectService,
    private columnsService: ColumnService,
    private alertSnackbarService: AlertSnackbarService,
    private confirmDialogService: ConfirmDialogService,
    private kanbanSocketService: KanbanSocketService,
    private route: ActivatedRoute
  ) {
    this.initQueryProjects();
  }

  ngOnInit() {
    // 訂閱 WebSocket 連接狀態
    this.subscriptions.push(
      this.kanbanSocketService.onConnectionEstablished().subscribe(
        isConnected => {
          this.isConnectedSignal.set(isConnected);
          if (isConnected) {
            // 如果有待處理的專案 ID，在連接建立後立即加入群組
            if (this.pendingProjectId) {
              this.joinProjectGroup(this.pendingProjectId);
              this.pendingProjectId = null;
            } else if (this.currentProjectSignal()) {
              // 重新連接時自動加入專案群組
              this.joinProjectGroup(this.currentProjectSignal()!.id!);
            }
          }
        }
      )
    );

    // 訂閱 WebSocket 更新
    this.subscriptions.push(
      this.kanbanSocketService.onProjectUpdated().subscribe(project => {
        if (project?.id && project.id === this.currentProjectSignal()?.id) {
          // 直接更新專案資訊，而不是重新獲取
          this.currentProjectSignal.set(project);
        }
      })
    );

    // 加入專案群組
    this.route.params.subscribe(params => {
      const projectId = params['projectId'];
      if (projectId) {
        // 檢查連接狀態
        this.kanbanSocketService.onConnectionEstablished().pipe(
          take(1)
        ).subscribe(isConnected => {
          if (isConnected) {
            // 如果已經連接，直接加入群組
            this.joinProjectGroup(projectId);
          } else {
            // 如果尚未連接，將專案 ID 存起來等待連接建立
            this.pendingProjectId = projectId;
          }
        });
      }
    });
  }

  ngOnDestroy() {
    // 取消訂閱
    this.subscriptions.forEach(sub => sub.unsubscribe());

    // 離開專案群組
    if (this.currentProjectSignal()) {
      this.leaveProjectGroup(this.currentProjectSignal()!.id!);
    }
  }

  /** 加入專案群組 */
  private async joinProjectGroup(projectId: string) {
    const success = await this.kanbanSocketService.joinProjectGroup(projectId);
    if (!success) {
      alert('無法連接到即時更新服務，請稍後再試');
    }
  }

  /** 離開專案群組 */
  private async leaveProjectGroup(projectId: string) {
    const success = await this.kanbanSocketService.leaveProjectGroup(projectId);
    if (!success) {
      console.error('離開專案群組失敗');
    }
  }

  protected totalTasks = computed(() => {
    return this.currentProjectSignal()?.columns?.reduce(
      (total, column) => total + (column.tasks?.length || 0),
      0,
    );
  });

  /** 專案管理 - 切換專案 */
  protected async switchProject(projectId: string) {
    if (this.currentProjectSignal()) {
      await this.leaveProjectGroup(this.currentProjectSignal()!.id!);
    }
    await this.joinProjectGroup(projectId);
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
        // 不需要手動更新，等待 WebSocket 通知
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
          // 不需要手動更新，等待 WebSocket 通知
        },
        () => {
          this.alertSnackbarService.onCustomFailedMessage('更新泳道順序失敗');
        },
      );
  }

  protected initQueryProjects() {
    console.log("initQueryProjects");

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
    console.log("getProjectDetail", id);
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
    console.log("queryProjects");
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
          // 不需要手動更新，等待 WebSocket 通知
        }
      });
  }
}
