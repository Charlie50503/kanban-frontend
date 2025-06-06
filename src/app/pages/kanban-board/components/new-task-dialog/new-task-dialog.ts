import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Task } from 'src/app/api/v1/models';

export interface NewTaskDialogInput {
  columnId: string;
}
@Component({
  selector: 'app-new-task-dialog',
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
    ReactiveFormsModule,
  ],
  templateUrl: './new-task-dialog.html',
  styleUrl: './new-task-dialog.scss',
})
export class NewTaskDialog {
  task: Partial<Task> = {
    title: '',
    description: '',
    assignee: '',
    dueDate: '',
    priority: 'medium',
    tags: [],
  };
  tagsInput: string = '';

  constructor(
    public dialogRef: MatDialogRef<NewTaskDialog>,
    @Inject(MAT_DIALOG_DATA) public data: NewTaskDialogInput,
  ) {}

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
