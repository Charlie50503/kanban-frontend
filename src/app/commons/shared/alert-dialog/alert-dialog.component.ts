import { CommonModule } from '@angular/common';
import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
export interface DialogData {
  fieldTypeName: string;
  alertTitle: string;
  alertContent: string;
}
@Component({
  selector: 'app-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.scss'],
  standalone: true,
  imports: [MatIconModule, MatDialogModule, CommonModule, MatButtonModule],
})
export class AlertDialogComponent implements OnInit {
  @Output() submitClicked = new EventEmitter<any>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public dialog: MatDialog,
    private aDialogRef: MatDialogRef<AlertDialogComponent>,
  ) {}

  ngOnInit(): void {}

  cf_onOkClick(): void {
    this.submitClicked.emit(true);
    this.aDialogRef.close(true);
  }
  cf_onNoClick(): void {
    this.submitClicked.emit(false);
    this.aDialogRef.close(false);
  }
}
