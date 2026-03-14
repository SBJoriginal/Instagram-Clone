import { Injectable, isDevMode } from '@angular/core';
import * as Sentry from '@sentry/angular';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

@Injectable({
  providedIn: 'root',
})
export class LogService {
  private level: LogLevel = isDevMode() ? LogLevel.DEBUG : LogLevel.INFO;

  debug(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.DEBUG) {
      if (isDevMode()) {
        console.log(`[DEBUG] ${message}`, ...args);
      }
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.INFO) {
      if (isDevMode()) {
        console.info(`[INFO] ${message}`, ...args);
      }
      Sentry.captureMessage(message, 'info');
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.WARN) {
      if (isDevMode()) {
        console.warn(`[WARN] ${message}`, ...args);
      }
      Sentry.captureMessage(message, 'warning');
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.ERROR) {
      if (isDevMode()) {
        console.error(`[ERROR] ${message}`, ...args);
      }
      Sentry.captureException(args.length > 0 ? args[0] : new Error(message));
    }
  }
}
