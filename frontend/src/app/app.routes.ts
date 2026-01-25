import { Routes } from '@angular/router';

import { LandingComponent } from './pages/landing/landing.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';

export const routes: Routes = [
  { path: '', component: LandingComponent, data: { animation: 'LandingPage' } },
  { path: 'sign-in', component: SignInComponent, data: { animation: 'SignInPage' } },
];
