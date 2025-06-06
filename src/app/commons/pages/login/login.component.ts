import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../../core/services/user.service';
import { TokenService } from '../../../core/services/token.service';
// import { LoginService } from 'src/app/api/v1/services';
import { AlertDialogComponent } from 'src/app/commons/shared/alert-dialog/alert-dialog.component';
// import { UserInfo } from 'src/app/api/v1/models';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    MatButtonModule,
    CommonModule,
  ],
})
export class LoginComponent {
  // 設置密碼是否可以看的到
  public isLoginPasswordHide = true;

  public loginFormGroup = new FormGroup({
    userAccount: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor(
    // private loginService: LoginService,
    private router: Router,
    public dialogRef: MatDialog,
    private userService: UserService,
    private tokenService: TokenService,
    private route: ActivatedRoute,
  ) {
    if (!this.route.snapshot.queryParams['isDisabledAutoLogin']) {
      this.windowsLogin();
    }
  }

  // 登入
  public LoginUI() {
    // if (this.loginFormGroup.invalid) {
    //   this.loginFormGroup.markAllAsTouched();
    //   return;
    // }

    // this.loginService
    //   .loginAuthorizeUser$Json({
    //     body: this.loginFormGroup.getRawValue(),
    //   })
    //   .subscribe({
    //     next: (res) => this.handlingLoginSuccess(res),
    //     error: (error: any) => this.handlingLoginFailed(error),
    //   });
  }
  // windows登入
  public windowsLogin() {
    // this.tokenService.removeAllAccessToken();
    // this.loginService.loginWindowsLogin$Json({}).subscribe({
    //   next: (res) => this.handlingLoginSuccess(res),
    //   error: (error: any) => this.handlingLoginFailed(error),
    // });
  }

  private handlingLoginSuccess(res: any) {
    // 填入使用者資料
    this.userService.setUserInfo(res);
    // 設定token
    this.tokenService.getAccessToken().setToken(res.jwtToken!);
    // 跳轉頁面
    this.router.navigate(['/home/overview']);
  }

  private handlingLoginFailed(error: any) {
    console.log(error);

    this.dialogRef.open(AlertDialogComponent, {
      minWidth: '360px',
      disableClose: true,
      autoFocus: false,
      data: {
        fieldTypeName: 'loginerror',
        alertTitle: '登入失敗',
        alertContent: '登入帳號或密碼錯誤，請確認',
      },
    });
  }
}
