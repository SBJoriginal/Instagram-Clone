import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { LogoComponent } from '../../../shared/ui/logo/logo.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ImageUploadDialog } from '../../../image-upload-dialog/image-upload-dialog';
import { ImageUploadService, ImageResponse } from '../../../services/image-upload.service';
import { ImageUploadData } from '../../../image-upload/image-upload';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navigation',
  imports: [
    MatIconModule,
    LogoComponent,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    MatListModule,
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css',
})
export class NavigationComponent {
  private dialog = inject(MatDialog);
  private uploadService = inject(ImageUploadService);
  private authService = inject(AuthService); // Inject AuthService

  logout() {
    this.authService.logout();
  }

  openCreateDialog() {
  const dialogRef = this.dialog.open(ImageUploadDialog);

  dialogRef.afterClosed().subscribe((result: ImageResponse | undefined) => {
    if (result) {
      console.log('Upload déjà complété avec succès par le dialogue:', result);
    }
  });
}
}
