import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ImageResponse } from '../services/image-upload.service';

@Component({
  selector: 'app-image-detail',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule],
  templateUrl: './image-detail.html',
  styleUrl: './image-detail.css',
})
export class ImageDetail {
  readonly image = inject<ImageResponse>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<ImageDetail>);
}
