import { AlertSnackbarService } from './../../../../commons/shared/alert-snackbar/alert-snackbar.service';
import { ColumnsService } from './../../../../api/v1/services/columns.service';
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Column } from 'src/app/api/v1/models';

export interface UpdateColumnDialogInput {
  projectId: string;
  column: Column;
}

@Component({
  selector: 'app-update-column-dialog',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './update-column-dialog.html',
  styleUrl: './update-column-dialog.scss',
})
export class UpdateColumnDialog {
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
    title: new FormControl(this.data.column.title, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    color: new FormControl(this.data.column.color, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor(
    public dialogRef: MatDialogRef<UpdateColumnDialog>,
    @Inject(MAT_DIALOG_DATA) public data: UpdateColumnDialogInput,
    private alertSnackbarService: AlertSnackbarService,
    private columnsService: ColumnsService,
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
      .apiColumnsIdPut({
        id: this.data.column.id!,
        body: {
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
