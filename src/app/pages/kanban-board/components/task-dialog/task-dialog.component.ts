import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Task } from '../../intefaces/task.interface';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <h2 mat-dialog-title class="text-xl font-semibold mb-4">
      {{ data.isEdit ? '編輯任務' : '新增任務' }}
    </h2>

    <mat-dialog-content class="mat-typography">
      <div class="grid gap-4">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>任務標題</mat-label>
          <input matInput [(ngModel)]="task.title" placeholder="請輸入任務標題" required>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>任務描述</mat-label>
          <textarea matInput [(ngModel)]="task.description" placeholder="請輸入任務描述" rows="3"></textarea>
        </mat-form-field>

        <div class="grid grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>負責人</mat-label>
            <input matInput [(ngModel)]="task.assignee" placeholder="請輸入負責人">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>截止日期</mat-label>
            <input matInput [matDatepicker]="picker" [(ngModel)]="task.dueDate">
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>優先級</mat-label>
          <mat-select [(ngModel)]="task.priority">
            <mat-option value="low">低優先級</mat-option>
            <mat-option value="medium">中優先級</mat-option>
            <mat-option value="high">高優先級</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>標籤</mat-label>
          <input matInput [(ngModel)]="tagsInput" placeholder="使用逗號分隔多個標籤" (input)="onTagsInputChange($event)">
          <mat-hint>例如：前端, API, 設計</mat-hint>
        </mat-form-field>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="mt-4">
      <button mat-button (click)="onCancel()">取消</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!task.title">
        {{ data.isEdit ? '更新' : '新增' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class TaskDialogComponent {
  task: Partial<Task>;
  tagsInput: string = '';

  constructor(
    public dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      task?: Partial<Task>;
      columnId: string;
      isEdit: boolean;
    }
  ) {
    this.task = data.task
      ? { ...data.task }
      : {
          title: '',
          description: '',
          assignee: '',
          dueDate: '',
          priority: 'medium',
          tags: [],
        };
    this.tagsInput = this.task.tags?.join(', ') || '';
  }

  onTagsInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.task.tags = input.value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (!this.task.title?.trim()) return;
    this.dialogRef.close(this.task);
  }
}
