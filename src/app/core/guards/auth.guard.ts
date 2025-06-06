import { catchError, of, switchMap, tap } from 'rxjs';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { LoginService } from 'src/app/api/v1/services';

export const authGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const loginService = inject(LoginService);
  const router = inject(Router);

  if (tokenService.getAccessToken().isTokenValid()) {
    return true;
  }
  // 要先清除JwtToken，不然 Windows 驗證不過
  tokenService.removeAllAccessToken();

  return loginService.loginWindowsLogin$Json({}).pipe(
    switchMap((res) => of(true)),
    catchError((err) => {
      router.navigate(['/login']);
      return of(false);
    }),
  );
};
