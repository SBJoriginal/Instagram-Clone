import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProfileService } from '../services/profile.service';
import { catchError, map, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

export const profileGuard: CanActivateFn = (route, state) => {
  const profileService = inject(ProfileService);
  const router = inject(Router);

  return profileService.getProfile().pipe(
    map(() => {
      // Profile exists (200 OK)
      return true;
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 404) {
        // Profile not found (404), redirect to completion page
        return of(router.createUrlTree(['/complete-profile']));
      }

      // Other errors (e.g., 401), let the auth guard or interceptor handle it,
      // or redirect to sign-in as a fallback
      return of(router.createUrlTree(['/sign-in']));
    }),
  );
};
