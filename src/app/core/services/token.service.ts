import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../environments/environment';
/**
 * 這個 services 主要設定 token
 *
 * @export
 * @class TokenService
 */
@Injectable({
  providedIn: 'root',
})
export class TokenService {
  // 一般使用者
  private accessToken = new Token(this.jwtHelper, environment.tokenName.access);
  constructor(private jwtHelper: JwtHelperService) {}

  public removeAllAccessToken() {
    this.accessToken.removeToken();
  }

  public resetAccessToken(token: string) {
    this.accessToken.setToken(token);
  }

  public getAccessToken() {
    return this.accessToken;
  }
}

class Token {
  constructor(
    private jwtHelper: JwtHelperService,
    private token: string,
  ) {}

  /**
   * 檢查 Token 是否存在且未過期
   *
   * @returns boolean 表示 token 是否存在且有效
   */
  public isTokenValid(): boolean {
    let jwtStr = this.getToken();
    // 首先檢查 token 是否存在
    if (jwtStr) {
      // 如果 token 存在，檢查是否過期
      return !this.jwtHelper.isTokenExpired(jwtStr);
    } else {
      // 如果 token 不存在，則返回 false
      return false;
    }
  }

  public removeToken() {
    if (this.getToken()) {
      localStorage.removeItem(this.token);
    }
  }

  public setToken(value: string | null) {
    if (value) {
      localStorage.setItem(this.token, value);
    } else {
      throw Error('沒找到 token !');
    }
  }

  public getToken() {
    return localStorage.getItem(this.token) || '';
  }
}
