import { ErrorHandler, Injectable, isDevMode } from '@angular/core';
import * as Sentry from '@sentry/angular';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    Sentry.captureException(error);

    if (isDevMode()) {
      console.error(error);
    }
  }
}
