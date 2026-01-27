import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'test-upload',
    loadComponent: () =>
      import('./pages/test-upload-page/test-upload-page.component').then((m) => m.TestUploadPage),
  },
];
