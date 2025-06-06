import {
  HttpInterceptorFn,
  HttpEvent,
  HttpResponse,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { switchMap, of } from 'rxjs';
import { TokenService } from '../services/token.service';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const exclusionRoutingList = ['/login'];
  const tokenService = inject(TokenService);

  req = requestClone(tokenService, req);

  return next(req).pipe(
    switchMap((event: HttpEvent<any>) => {
      if (!(event instanceof HttpResponse)) {
        return of(event);
      }
      // 除了 Login 以外使用共通的response判斷
      if (exclusionRoutingList.some((route) => event.url?.includes(route))) {
        return of(event);
      } else {
        // 做一些共通邏輯判斷
        // e.g. event.isSuccess==="Y"
        return of(event);
      }
    }),
  );
};

function requestClone(
  tokenService: TokenService,
  request: HttpRequest<unknown>,
) {
  // const commonHeaders: { [name: string]: string | string[] } = {
  //   'Cache-Control': 'no-cache, no-store, must-revalidate',
  //   Pragma: 'no-cache',
  //   Expires: '-1',
  //   'Content-Type': 'application/json; charset=UTF-8',
  //   /** 有關CORS的參數 */
  //   'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS, PATCH',
  //   'Access-Control-Max-Age': '86400',
  //   'Access-Control-Allow-Origin': '*',
  //   'Access-Control-Allow-Credentials': 'true',
  // };
  // let headers: { [name: string]: string | string[] } = { ...commonHeaders };
  let headers: { [name: string]: string | string[] } = {};
  const accessToken = tokenService.getAccessToken().getToken();

  if (accessToken) {
    // authWindows 請求時不能帶這個參數
    headers = { ...headers, Authorization: `Bearer ${accessToken}` };
  }

  return request.clone({
    setHeaders: headers,
    // withCredentials: true,
  });
}
