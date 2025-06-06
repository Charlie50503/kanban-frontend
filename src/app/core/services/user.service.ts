import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { UserInfo } from 'src/app/api/v1/models';

export interface LoginPage {
  isShowITDepPage?: boolean;
  isShowGMOfficePage?: boolean;
  isShowDemandDepPage?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _userInfo!: UserInfo;

  constructor(public dialog: MatDialog) {}

  public setUserInfo(userInfo: UserInfo) {
    this._userInfo = userInfo;
  }
  public getUserInfo() {
    return this._userInfo;
  }
}
