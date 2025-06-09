import { AlertSnackbarService } from './../../../../commons/shared/alert-snackbar/alert-snackbar.service';
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ColumnService } from 'src/app/api/v1/services';

export interface NewColumnDialogInput {
  projectId: string;
  columnSize: number;
}

@Component({
  selector: 'app-new-column-dialog',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './new-column-dialog.html',
  styleUrl: './new-column-dialog.scss',
})
export class NewColumnDialog {
  protected colorOptions = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-gray-500',
    'bg-orange-500',
    'bg-teal-500',
  ];

  protected formGroup = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    color: new FormControl('bg-blue-500', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor(
    public dialogRef: MatDialogRef<NewColumnDialog>,
    @Inject(MAT_DIALOG_DATA) public data: NewColumnDialogInput,
    private alertSnackbarService: AlertSnackbarService,
    private columnsService: ColumnService,
  ) {}

  protected selectColor(color: string) {
    this.formGroup.patchValue({ color });
  }

  protected onSubmit() {
    this.formGroup.markAllAsTouched();
    this.formGroup.updateValueAndValidity();
    if (this.formGroup.invalid) {
      return;
    }
    this.columnsService
      .apiProjectsProjectIdColumnsPost$Json({
        projectId: this.data.projectId,
        body: {
          // order: this.data.columnSize,
          ...this.formGroup.getRawValue(),
        },
      })
      .subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: () => {
          this.alertSnackbarService.onAttachRequestFailed();
        },
      });
  }

  protected onCancel() {
    this.dialogRef.close(false);
  }
}
