import { Injectable } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { SecondarySpinnerComponent } from './secondary-spinner.component';

@Injectable({
  providedIn: 'root',
})
export class SecondarySpinnerService {
  progressSpinner!: MatDialogRef<SecondarySpinnerComponent>;
  constructor(private dialog: MatDialog) {}

  open() {
    if (this.progressSpinner && this.progressSpinner.componentInstance) {
      return;
    }
    this.progressSpinner = this.dialog.open(SecondarySpinnerComponent, {
      width: '90%',
      maxWidth: '200px',
      disableClose: true,
      restoreFocus: false,
    });
  }

  close() {
    if (this.progressSpinner) {
      setTimeout(() => {
        this.progressSpinner.close();
      }, 100);
    }
  }
}
