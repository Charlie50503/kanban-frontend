import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { PrimarySpinnerService } from 'src/app/commons/shared/spinner/primary-spinner/primary-spinner.service';
import { SecondarySpinnerService } from 'src/app/commons/shared/spinner/secondary-spinner/secondary-spinner.service';

export const spinnerInterceptor: HttpInterceptorFn = (req, next) => {
  const primarySpinnerService = inject(PrimarySpinnerService);
  // const secondarySpinnerService = inject(SecondarySpinnerService);

  // 首頁不顯示loading
  // if (req.url.includes('/CRMS000/GetList')) { return next(req); }
  primarySpinnerService.open();
  // secondarySpinnerService.open();

  return next(req).pipe(finalize(() => primarySpinnerService.close()));
  // return next(req).pipe(finalize(() => secondarySpinnerService.close()));
};
