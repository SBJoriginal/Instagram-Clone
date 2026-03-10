import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProfileService } from '../services/profile.service';
import { catchError, map, of } from 'rxjs';

export const profileGuard: CanActivateFn = () => {
  const profileService = inject(ProfileService);
  const router = inject(Router);

  return profileService.getProfile().pipe(
    map((profile) => {
      if (profile) {
        // Profile exists (200 OK)
        return true;
      }

      // Profile not found (null from service), redirect to completion page
      return router.createUrlTree(['/complete-profile']);
    }),
    catchError(() => {
      // Other errors (e.g., 500), redirect to sign-in or error page
      return of(router.createUrlTree(['/sign-in']));
    }),
  );
};
