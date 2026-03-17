import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageCompressionService {
  private readonly MAX_WIDTH = 1920;
  private readonly MAX_HEIGHT = 1920;
  private readonly QUALITY = 0.8;

  async compressImage(file: File): Promise<Blob> {
    const img = await this.loadImage(file);
    const { width, height } = this.calculateDimensions(img.width, img.height);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    ctx.drawImage(img, 0, 0, width, height);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas toBlob failed'));
          }
        },
        'image/jpeg',
        this.QUALITY,
      );
    });
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private calculateDimensions(width: number, height: number): { width: number; height: number } {
    if (width <= this.MAX_WIDTH && height <= this.MAX_HEIGHT) {
      return { width, height };
    }

    const ratio = Math.min(this.MAX_WIDTH / width, this.MAX_HEIGHT / height);
    return {
      width: Math.floor(width * ratio),
      height: Math.floor(height * ratio),
    };
  }
}
