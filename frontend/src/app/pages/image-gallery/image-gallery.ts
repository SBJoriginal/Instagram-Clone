import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ImagePost } from '../../models/image.model';

@Component({
  selector: 'app-image-gallery',
  imports: [MatCardModule],
  templateUrl: './image-gallery.html',
  styleUrl: './image-gallery.css',
})
export class ImageGalleryComponent {
  @Input() images: ImagePost[] = [];
}
