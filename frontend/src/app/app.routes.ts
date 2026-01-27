import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { ShellComponent } from './pages/shell/shell.component';

export const routes: Routes = [
  { path: '', component: LandingComponent, data: { animation: 'LandingPage' } },
  { path: 'home', component: ShellComponent },
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
    path: 'test-upload',
    loadComponent: () =>
      import('./pages/test-upload-page/test-upload-page.component').then((m) => m.TestUploadPage),
  },
];
