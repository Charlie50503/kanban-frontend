import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  importProvidersFrom,
  LOCALE_ID,
  provideZoneChangeDetection,

} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { spinnerInterceptor } from './core/interceptors/spinner.interceptor';
import { apiInterceptor } from './core/interceptors/api.interceptor';
import { JwtModule } from '@auth0/angular-jwt';
import { NgxSpinnerModule } from 'ngx-spinner';
// import { ApiModule as ApiModuleV1 } from 'src/app/api/v1/api.module';
// 引入繁體中文語言數據
import localeZhTw from '@angular/common/locales/zh-Hant';
import { DatePipe, registerLocaleData } from '@angular/common';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { environment } from '../environments/environment';
function tokenGetter() {
  return localStorage.getItem(environment.tokenName.access);
}

// formatDate 函數需要,註冊繁體中文語言數據
registerLocaleData(localeZhTw);

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom([
      // ApiModuleV1.forRoot({ rootUrl: environment.apiUrl }),
      JwtModule.forRoot({
        config: {
          tokenGetter,
          allowedDomains: [environment.domain],
        },
      }),
      NgxSpinnerModule,
    ]),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([apiInterceptor, spinnerInterceptor])),
    { provide: MAT_DATE_LOCALE, useValue: 'zh-Hant' },
    { provide: LOCALE_ID, useValue: 'zh-Hant' }, // 設定為臺灣中文
    DatePipe,
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAnimations(),
  ],
};
