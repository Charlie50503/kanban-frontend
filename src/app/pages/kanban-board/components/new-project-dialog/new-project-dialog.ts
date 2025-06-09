import { AlertSnackbarService } from './../../../../commons/shared/alert-snackbar/alert-snackbar.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ProjectService } from 'src/app/api/v1/services';

@Component({
  selector: 'app-new-project-dialog',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './new-project-dialog.html',
  styleUrl: './new-project-dialog.scss',
})
export class NewProjectDialog {
  protected formGroup = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor(
    public dialogRef: MatDialogRef<NewProjectDialog>,
    private alertSnackbarService: AlertSnackbarService,
    private projectsService: ProjectService,
  ) {}
  protected onSubmit() {
    this.formGroup.markAllAsTouched();
    this.formGroup.updateValueAndValidity();
    if (this.formGroup.invalid) {
      return;
    }
    this.projectsService
      .apiProjectsPost$Json({ body: this.formGroup.getRawValue() })
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
