import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Project } from '../../intefaces/task.interface';
import { ProjectsService } from 'src/app/api/v1/services';

@Component({
  selector: 'app-update-project-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './update-project-dialog.html',
  styleUrl: './update-project-dialog.scss',
})
export class UpdateProjectDialog {
  private readonly dialogRef = inject(MatDialogRef<UpdateProjectDialog>);
  private readonly projectsService = inject(ProjectsService);

  /** 表單群組 */
  protected formGroup = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl('', {
      nonNullable: true,
    }),
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: { project: Project }) {
    // 初始化表單值
    this.formGroup.patchValue({
      name: data.project.name,
      description: data.project.description,
    });
  }

  /** 提交表單 */
  protected onSubmit(): void {
    if (this.formGroup.valid) {
      const values = this.formGroup.getRawValue();
      this.projectsService
        .apiProjectsIdPut({
          id: this.data.project.id!,
          body: values,
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
  }

  /** 取消 */
  protected onCancel(): void {
    this.dialogRef.close(false);
  }
}
