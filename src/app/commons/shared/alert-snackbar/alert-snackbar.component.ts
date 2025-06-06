import { Component, Inject } from '@angular/core';
import { MatSnackBar, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { IAlertType } from './alert-snackbar.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-alert-snackbar',
  templateUrl: './alert-snackbar.component.html',
  styleUrls: ['./alert-snackbar.component.scss'],
  standalone: true,
  imports: [MatSnackBarModule, MatIconModule, CommonModule],
})
export class AlertSnackbarComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: any,
    private _snackBar: MatSnackBar,
  ) {}

  get actionType() {
    return IAlertType;
  }

  onClose() {
    this._snackBar.dismiss();
  }
}
