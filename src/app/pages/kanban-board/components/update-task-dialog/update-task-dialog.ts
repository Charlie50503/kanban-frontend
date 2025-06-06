import { TasksService } from './../../../../api/v1/services/tasks.service';
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
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
import { idText } from 'typescript';

export interface UpdateTaskDialogInput {
  task: Task;
}

@Component({
  selector: 'app-update-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './update-task-dialog.html',
  styleUrl: './update-task-dialog.scss',
})
export class UpdateTaskDialog {
  protected formGroup = new FormGroup({
    id: new FormControl(this.data.task.id, {
      nonNullable: true,
    }),
    title: new FormControl(this.data.task.title, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl(this.data.task.description, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    assignee: new FormControl(this.data.task.assignee, {
      nonNullable: true,
    }),
    dueDate: new FormControl(this.data.task.dueDate, {
      nonNullable: true,
    }),
    priority: new FormControl<'low' | 'medium' | 'high'>(
      this.data.task.priority,
      {
        nonNullable: true,
        validators: [Validators.required],
      },
    ),
    tagsInput: new FormControl(this.data.task.tags?.join(', ') || '', {
      nonNullable: true,
    }),
  });

  constructor(
    public dialogRef: MatDialogRef<UpdateTaskDialog>,
    @Inject(MAT_DIALOG_DATA) public data: UpdateTaskDialogInput,
    private tasksService: TasksService,
  ) {
    this.formGroup.setValue({
      id: this.data.task.id!,
      title: this.data.task.title!,
      description: this.data.task.description!,
      assignee: this.data.task.assignee!,
      dueDate: this.data.task.dueDate!,
      priority: this.data.task.priority!,
      tagsInput: this.data.task.tags?.join(', ') || '',
    });
  }

  protected onSubmit() {
    this.formGroup.markAllAsTouched();
    this.formGroup.updateValueAndValidity();
    if (this.formGroup.invalid) {
      return;
    }

    const values = this.formGroup.getRawValue();

    this.tasksService
      .apiTasksIdPut({
        id: this.data.task.id!,
        body: {
          ...values,
          tags: values.tagsInput
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0),
        },
      })
      .subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: () => {
          this.dialogRef.close(false);
        },
      });
  }

  protected onCancel() {
    this.dialogRef.close(false);
  }
}
