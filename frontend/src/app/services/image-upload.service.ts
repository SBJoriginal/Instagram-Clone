import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ImageUploadData } from '../image-upload/image-upload';
import { Subject } from 'rxjs';

export interface ImageResponse {
  id: number;
  filePath: string;
  description: string;
  hashtags: string;
  mentions: string;
  userId: string;
  username?: string;
  createdAt: string;
  fileName?: string;
  contentType?: string;
  size?: number;
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
  private readonly apiUrl = `${environment.apiUrl}/images`;
  private imageCreatedSource = new Subject<void>();
  imageCreated$ = this.imageCreatedSource.asObservable();

  uploadImage(data: ImageUploadData): Observable<ImageResponse> {
    const formData = new FormData();
    formData.append('File', data.file);
    formData.append('Description', data.description);
    formData.append('Hashtags', data.hashtags);
    formData.append('Mentions', data.mentions);

    return this.http.post<ImageResponse>(this.apiUrl, formData);
  }

  notifyImageCreated() {
    this.imageCreatedSource.next();
  }

  getImages(page = 1, limit = 15): Observable<ImageResponse[]> {
    return this.http.get<ImageResponse[]>(this.apiUrl, {
      params: {
        page: page.toString(),
        limit: limit.toString(),
      },
    });
  }

  searchImages(
    filterType: 'description' | 'hashtag',
    query: string,
    page: number,
    pageSize: number,
  ): Observable<ImageResponse[]> {
    return this.http.get<ImageResponse[]>(`${this.apiUrl}/search`, {
      params: {
        filterType: filterType,
        query: query,
        page: page.toString(),
        pageSize: pageSize.toString(),
      },
    });
  }

  getMyImages(): Observable<ImageResponse[]> {
    return this.http.get<ImageResponse[]>(`${this.apiUrl}/my-images`);
  }

  getImagesByUserId(userId: string): Observable<ImageResponse[]> {
    return this.http.get<ImageResponse[]>(`${this.apiUrl}/user/${userId}`);
  }

  getImagesByUsername(username: string): Observable<ImageResponse[]> {
    return this.http.get<ImageResponse[]>(`${this.apiUrl}/username/${username}`);
  }

  getImageById(id: number): Observable<ImageResponse> {
    return this.http.get<ImageResponse>(`${this.apiUrl}/${id}`);
  }

  updateImage(id: number, data: ImageUpdateData): Observable<ImageResponse> {
    return this.http.put<ImageResponse>(`${this.apiUrl}/${id}`, data);
  }

  deleteImage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAutocomplete(filterType: 'description' | 'hashtag', query: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/autocomplete`, {
      params: {
        filterType: filterType,
        query: query,
      },
    });
  }
}
