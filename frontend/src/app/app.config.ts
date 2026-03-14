import {
  ApplicationConfig,
  APP_INITIALIZER,
  ErrorHandler,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { IMAGE_CONFIG } from '@angular/common';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { Router, provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { GlobalErrorHandler } from './core/errors/global-error-handler';
import * as Sentry from '@sentry/angular';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },
    {
      provide: Sentry.TraceService,
      deps: [Router],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {
        /* Force initialization of Sentry.TraceService */
      },
      deps: [Sentry.TraceService],
      multi: true,
    },
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true,
        disableImageLazyLoadWarning: true,
      },
    },
  ],
};
