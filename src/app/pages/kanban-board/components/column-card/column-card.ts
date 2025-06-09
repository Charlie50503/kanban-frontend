import { Component, computed, input, output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { filter } from 'rxjs';
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

@Component({
  selector: 'app-column-card',
  imports: [CommonModule, DragDropModule, TaskCard],
  templateUrl: './column-card.html',
  styleUrl: './column-card.scss',
})
export class ColumnCard {
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
  constructor(
    private dialog: MatDialog,
    private projectsService: ProjectService,
    private alertSnackbarService: AlertSnackbarService,
    private confirmDialogService: ConfirmDialogService,
    private columnsService: ColumnService,
    private tasksService: TaskService,
  ) {}
  protected openAddTaskDialog(columnId: string) {
    this.dialog
      .open(NewTaskDialog, {
        data: { projectId: this.currentProject()!.id!, columnId },
      })
      .afterClosed()
      .pipe(filter((res) => !!res))
      .subscribe((result) => {
        // this.getProjectDetail(this.currentProject()!.id!);
        this.onProjectUpdated.emit();
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
          // this.getProjectDetail(this.currentProject()!.id!);
          this.onProjectUpdated.emit();
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
              // this.getProjectDetail(this.currentProjectSignal()!.id!);
              this.onProjectUpdated.emit();
            },
            error: (error: any) =>
              this.alertSnackbarService.onDeleteRequestFailed(),
          });
      });
  }

  /** 拖拽處理 */
  drop(event: CdkDragDrop<KanbanTask[] | null | undefined>) {
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

  /** 任務管理 - 顯示編輯任務表單 */
  protected openUpdateTaskDialog(task: KanbanTask) {
    const dialogRef = this.dialog.open(UpdateTaskDialog, {
      data: { task },
    });

    dialogRef
      .afterClosed()
      .pipe(filter((res) => !!res))
      .subscribe((result) => {
        this.onProjectUpdated.emit();
        // this.getProjectDetail(this.currentProjectSignal()!.id!);
      });
  }
}
