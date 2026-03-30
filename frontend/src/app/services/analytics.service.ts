import { Injectable } from '@angular/core';

declare let gtag: Function;

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  trackPageView(url: string): void {
    gtag('event', 'page_view', { page_path: url });
  }

  trackEvent(eventName: string, params?: Record<string, unknown>): void {
    gtag('event', eventName, params);
  }
}
