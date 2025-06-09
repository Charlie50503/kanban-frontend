import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { filter, switchMap } from 'rxjs';
import { KanbanTask } from 'src/app/api/v1/models';
import { TaskService } from 'src/app/api/v1/services';
import { AlertSnackbarService } from 'src/app/commons/shared/alert-snackbar/alert-snackbar.service';
import { ConfirmDialogService } from 'src/app/commons/shared/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-task-card',
  imports: [CommonModule],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
})
export class TaskCard {
  public task = input.required<KanbanTask>();
  public onTaskDeleted = output<void>();

  constructor(
    private tasksService: TaskService,
    private alertSnackbarService: AlertSnackbarService,
    private confirmDialogService: ConfirmDialogService,
  ) {}
  /** 取得優先級顏色 */
  protected getPriorityColor(priority:string): string {
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
  protected deleteTask(taskId: string): void {
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
          this.onTaskDeleted.emit();
          this.alertSnackbarService.onDeleteRequestSucceeded();
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          this.alertSnackbarService.onDeleteRequestFailed();
        },
      });
  }
}
