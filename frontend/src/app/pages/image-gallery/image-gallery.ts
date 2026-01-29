import { Component, Input } from '@angular/core';
import { ImagePost } from '../../models/image.model';

@Component({
  selector: 'app-image-gallery',
  imports: [],
  templateUrl: './image-gallery.html',
  styleUrl: './image-gallery.css',
})
export class ImageGalleryComponent {
  @Input() images: ImagePost[] = [];

}
