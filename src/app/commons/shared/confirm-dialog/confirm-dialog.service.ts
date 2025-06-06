import { Injectable } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { ConfirmDialog, ConfirmDialogData } from "./confirm-dialog";

@Injectable({
  providedIn: "root",
})
export class ConfirmDialogService {
  constructor(public Dialog: MatDialog) {}

  onDeleteConfirm() {
    const data: ConfirmDialogData = {
      title: "確定刪除",
      content: "即將刪除資料，刪除後將無法回復！",
    };
    return this.Dialog.open(ConfirmDialog, {
      data: data,
    });
  }

  onSubmitConfirm() {
    const data: ConfirmDialogData = {
      title: "確認送出",
      content: "即將送出資料，送出後將無法修改！",
    };
    return this.Dialog.open(ConfirmDialog, {
      data: data,
    });
  }
}
