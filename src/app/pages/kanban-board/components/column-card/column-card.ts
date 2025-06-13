import { Component, computed, input, output, OnInit, OnDestroy, WritableSignal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { filter, Subscription } from 'rxjs';
import {
  ProjectService,
  ColumnService,
  TaskService,
} from 'src/app/api/v1/services';
import { AlertSnackbarService } from 'src/app/commons/shared/alert-snackbar/alert-snackbar.service';
import { ConfirmDialogService } from 'src/app/commons/shared/confirm-dialog/confirm-dialog.service';
import { NewTaskDialog } from '../new-task-dialog/new-task-dialog';
import { Column, Project, KanbanTask } from 'src/app/api/v1/models';
import { UpdateColumnDialog } from '../update-column-dialog/update-column-dialog';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { UpdateTaskDialog } from '../update-task-dialog/update-task-dialog';
import { TaskCard } from '../task-card/task-card';
import { KanbanSocketService } from '../../../../services/kanban-socket.service';

@Component({
  selector: 'app-column-card',
  imports: [CommonModule, DragDropModule, TaskCard],
  templateUrl: './column-card.html',
  styleUrl: './column-card.scss',
})
export class ColumnCard implements OnInit, OnDestroy {
  public currentProject = input.required<Project>();
  public currentColumn = input.required<Column>();
  protected sortedColumnsSignal = computed(() => {
    return this.currentProject()?.columns!.sort((a, b) => a.order! - b.order!);
  });

  protected connectedDropLists = computed(() => {
    return (
      this.sortedColumnsSignal()?.map((column) => `drop-list-${column.id}`) ||
      []
    );
  });
  /** 是否正在拖拽中 */
  isDragOver: boolean = false;
  public onProjectUpdated = output<void>();

  private subscriptions: Subscription[] = [];

  constructor(
    private dialog: MatDialog,
    private projectsService: ProjectService,
    private alertSnackbarService: AlertSnackbarService,
    private confirmDialogService: ConfirmDialogService,
    private columnsService: ColumnService,
    private tasksService: TaskService,
    private kanbanSocketService: KanbanSocketService
  ) {}

  ngOnInit() {
    // 移除所有 WebSocket 訂閱，因為我們已經在 kanban-board.ts 中處理了所有更新
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  protected openAddTaskDialog(columnId: string) {
    this.dialog
      .open(NewTaskDialog, {
        data: { projectId: this.currentProject()!.id!, columnId },
      })
      .afterClosed()
      .pipe(filter((res) => !!res))
      .subscribe((result) => {
        // 不需要手動更新，等待 WebSocket 通知
      });
  }

  /** 泳道管理 - 顯示編輯泳道表單 */
  protected showEditColumnForm(column: Column) {
    if (!this.currentProject()) return;

    this.dialog
      .open(UpdateColumnDialog, {
        data: {
          projectId: this.currentProject()!.id!,
          column,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          // 不需要手動更新，等待 WebSocket 通知
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
              // 不需要手動更新，等待 WebSocket 通知
            },
            error: (error: any) =>
              this.alertSnackbarService.onDeleteRequestFailed(),
          });
      });
  }

  /** 拖拽處理 */
  drop(event: CdkDragDrop<KanbanTask[] | null | undefined>) {
    if (!event.container.data || !event.previousContainer.data) return;

    const task = event.previousContainer.data[event.previousIndex];
    const targetColumnId = event.container.id.replace('drop-list-', '');

    if (event.previousContainer === event.container) {
      // 在同一個泳道內移動
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    } else {
      // 在不同泳道之間移動
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }

    // 更新任務的泳道
    this.tasksService
      .apiTasksIdMovePatch({
        id: task.id!,
        body: {
          columnId: targetColumnId,
          newIndex: event.currentIndex
        },
      })
      .subscribe({
        error: (error) => {
          this.alertSnackbarService.onCustomFailedMessage('移動任務失敗');
          // 如果 API 調用失敗，恢復原始狀態
          if (event.previousContainer === event.container) {
            moveItemInArray(
              event.container.data!,
              event.currentIndex,
              event.previousIndex
            );
          } else {
            transferArrayItem(
              event.container.data!,
              event.previousContainer.data!,
              event.currentIndex,
              event.previousIndex,
            );
          }
        },
      });
  }

  /** 任務管理 - 顯示編輯任務表單 */
  protected openUpdateTaskDialog(task: KanbanTask) {
    const dialogRef = this.dialog.open(UpdateTaskDialog, {
      data: { task },
    });

    dialogRef
      .afterClosed()
      .pipe(filter((res) => !!res))
      .subscribe((result) => {
        // 不需要手動更新，等待 WebSocket 通知
      });
  }
}
