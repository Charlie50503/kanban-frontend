import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  content: string;
}
@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styleUrls: ['./confirm-dialog.scss'],
  standalone: true,
  imports: [MatDialogModule, MatIconModule, MatButtonModule],
})
export class ConfirmDialog {
  @Output() submitClicked = new EventEmitter<any>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
    public dialog: MatDialog,
    private aDialogRef: MatDialogRef<ConfirmDialog>,
  ) {}

  ngOnInit(): void {}

  onSubmit(): void {
    this.submitClicked.emit(true);
    this.aDialogRef.close(true);
  }
  onClose(): void {
    this.submitClicked.emit(false);
    this.aDialogRef.close(false);
  }
}
