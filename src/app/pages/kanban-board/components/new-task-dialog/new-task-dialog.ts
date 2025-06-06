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

export interface NewTaskDialogInput {
  projectId: string;
  columnId: string;
}

@Component({
  selector: 'app-new-task-dialog',
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
  templateUrl: './new-task-dialog.html',
  styleUrl: './new-task-dialog.scss',
})
export class NewTaskDialog {
  protected formGroup = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    assignee: new FormControl('', {
      nonNullable: true,
    }),
    dueDate: new FormControl('', {
      nonNullable: true,
    }),
    priority: new FormControl<'low' | 'medium' | 'high'>('medium', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    tagsInput: new FormControl('', {
      nonNullable: true,
    }),
  });

  constructor(
    public dialogRef: MatDialogRef<NewTaskDialog>,
    @Inject(MAT_DIALOG_DATA) public data: NewTaskDialogInput,
    private tasksService: TasksService,
  ) {}

  protected onSubmit() {
    this.formGroup.markAllAsTouched();
    this.formGroup.updateValueAndValidity();
    if (this.formGroup.invalid) {
      return;
    }

    const values = this.formGroup.getRawValue();

    this.tasksService
      .apiProjectsProjectIdColumnsColumnIdTasksPost({
        projectId: this.data.projectId,
        columnId: this.data.columnId,
        body: {
          ...values,
          tags: values.tagsInput
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0),
        },
      })
      .subscribe();

    this.dialogRef.close(true);
  }

  protected onCancel() {
    this.dialogRef.close(false);
  }
}
