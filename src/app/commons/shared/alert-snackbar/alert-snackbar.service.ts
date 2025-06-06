import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertSnackbarComponent } from './alert-snackbar.component';

export enum IAlertType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export class SnackbarData {
  constructor(
    public message: string,
    public action: IAlertType,
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class AlertSnackbarService {
  private readonly durationInSeconds = 2;
  constructor(private _snackBar: MatSnackBar) {}

  openSnackBar(data: SnackbarData, panelClass: string[]) {
    this._snackBar.openFromComponent(AlertSnackbarComponent, {
      data: data,
      duration: this.durationInSeconds * 1000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['alert-snack-bar', ...panelClass],
    });
  }
  onRequestFailedCustomMessage(errorMessage: string) {
    const data = new SnackbarData(errorMessage, IAlertType.ERROR);
    this.openSnackBar(data, ['error']);
  }
  onQueryRequestNotFound() {
    const data = new SnackbarData('查無資料', IAlertType.ERROR);
    this.openSnackBar(data, ['error']);
  }
  onQueryRequestSucceeded() {
    const data = new SnackbarData('查詢成功', IAlertType.SUCCESS);
    this.openSnackBar(data, ['success']);
  }
  onQueryRequestFailed() {
    const data = new SnackbarData('查詢失敗', IAlertType.ERROR);
    this.openSnackBar(data, ['error']);
  }
  onAttachRequestSucceeded() {
    const data = new SnackbarData('新增成功', IAlertType.SUCCESS);
    this.openSnackBar(data, ['success']);
  }
  onAttachRequestFailed() {
    const data = new SnackbarData('新增失敗', IAlertType.ERROR);
    this.openSnackBar(data, ['error']);
  }
  onUpdateRequestSucceeded() {
    const data = new SnackbarData('修改成功', IAlertType.SUCCESS);
    this.openSnackBar(data, ['success']);
  }
  onUpdateRequestFailed() {
    const data = new SnackbarData('修改失敗', IAlertType.ERROR);
    this.openSnackBar(data, ['error']);
  }
  onDeleteRequestSucceeded() {
    const data = new SnackbarData('刪除成功', IAlertType.SUCCESS);
    this.openSnackBar(data, ['success']);
  }
  onDeleteRequestFailed() {
    const data = new SnackbarData('刪除失敗', IAlertType.ERROR);
    this.openSnackBar(data, ['error']);
  }
  onWaringMessage() {
    const data = new SnackbarData('警告訊息', IAlertType.WARNING);
    this.openSnackBar(data, ['warning']);
  }

  onLoginMessageSucceeded() {
    const data = new SnackbarData('登入成功', IAlertType.SUCCESS);
    this.openSnackBar(data, ['success']);
  }

  onLoginMessageFailed() {
    const data = new SnackbarData('登入帳號或密碼驗證失敗', IAlertType.ERROR);
    this.openSnackBar(data, ['error']);
  }

  onCustomFailedMessage(errorMessage: string) {
    const data = new SnackbarData(errorMessage, IAlertType.ERROR);
    this.openSnackBar(data, ['error']);
  }

  onCustomSucceededMessage(successMessage: string) {
    const data = new SnackbarData(successMessage, IAlertType.SUCCESS);
    this.openSnackBar(data, ['success']);
  }

  onSaveRequestSucceeded() {
    const data = new SnackbarData('儲存成功', IAlertType.SUCCESS);
    this.openSnackBar(data, ['success']);
  }
  onSaveRequestFailed() {
    const data = new SnackbarData('儲存失敗', IAlertType.ERROR);
    this.openSnackBar(data, ['error']);
  }
}
