import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { ShellComponent } from './pages/shell/shell.component';
import { Profile } from './pages/profile/profile';
import { Explore } from './pages/explore/explore';
import { authGuard } from './guards/auth.guard';
import { profileGuard } from './guards/profile.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent, data: { animation: 'LandingPage' } },
  {
    path: 'home',
    component: ShellComponent,
    canActivate: [authGuard, profileGuard],
    children: [{ path: 'profile', component: Profile }, { path: 'explore', component: Explore }],
  },
  {
    path: 'sign-in',
    loadComponent: () => import('./pages/sign-in/sign-in.component').then((m) => m.SignInComponent),
    data: { animation: 'SignInPage' },
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./pages/sign-up/sign-up.component').then((m) => m.SignUpComponent),
    data: { animation: 'SignUpPage' },
  },
  {
    path: 'complete-profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/complete-profile/complete-profile.component').then(
        (m) => m.CompleteProfileComponent,
      ),
    data: { animation: 'CompleteProfilePage' },
  },
];
