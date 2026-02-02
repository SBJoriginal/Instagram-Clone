import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ImageUploadData } from '../image-upload/image-upload';

export interface ImageResponse {
  id: number;
  filePath: string;
  description: string;
  hashtags: string;
  mentions: string;
}

export interface ImageUpdateData {
  description: string;
  hashtags: string;
  mentions: string;
}

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  private readonly http = inject(HttpClient);
  // In a real app, this should be in an environment file
  private readonly apiUrl = 'http://localhost:5266/api/images';

  uploadImage(data: ImageUploadData): Observable<ImageResponse> {
    const formData = new FormData();
    formData.append('File', data.file);
    formData.append('Description', data.description);
    formData.append('Hashtags', data.hashtags);
    formData.append('Mentions', data.mentions);

    return this.http.post<ImageResponse>(this.apiUrl, formData);
  }

  getImages(): Observable<ImageResponse[]> {
    return this.http.get<ImageResponse[]>(this.apiUrl);
  }

  updateImage(id: number, data: ImageUpdateData): Observable<ImageResponse> {
    return this.http.put<ImageResponse>(`${this.apiUrl}/${id}`, data);
  }

  deleteImage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
