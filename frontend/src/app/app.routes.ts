import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { ShellComponent } from './pages/shell/shell.component';
import { Profile } from './pages/profile/profile';
import { Explore } from './pages/explore/explore'; // Import direct
import { ImageDetail } from './pages/explore/image-detail/image-detail'; // Import direct

export const routes: Routes = [
  { path: '', component: LandingComponent, data: { animation: 'LandingPage' } },
  {
    path: 'home',
    component: ShellComponent,
    children: [
      { path: 'profile', component: Profile },
      { path: 'explore', component: Explore },
    ]
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
];