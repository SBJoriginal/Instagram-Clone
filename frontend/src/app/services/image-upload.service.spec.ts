import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ImageUploadService, ImageResponse } from './image-upload.service';
import { ImageUploadData } from '../image-upload/image-upload';
import { provideHttpClient } from '@angular/common/http';

describe('ImageUploadService', () => {
  let service: ImageUploadService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ImageUploadService],
    });
    service = TestBed.inject(ImageUploadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should upload an image', () => {
    const file = new File([''], 'test.png', { type: 'image/png' });
    const mockData: ImageUploadData = {
      file: file,
      description: 'Test Description',
      hashtags: '#test',
      mentions: '@user',
    };

    const mockResponse: ImageResponse = {
      id: 1,
      filePath: '/uploads/test.png',
      description: 'Test Description',
      hashtags: '#test',
      mentions: '@user',
      userId: 'test-user',
      createdAt: new Date().toISOString(),
      reactionCount: 0,
      hasReacted: false,
      commentCount: 0,
      profilePictureUrl: '',
    };

    service.uploadImage(mockData).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    // L'upload ne contient pas de paramètres de pagination
    const req = httpMock.expectOne('http://localhost:8081/api/images');
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTruthy();
    req.flush(mockResponse);
  });

  it('should get all images', () => {
    const mockImages: ImageResponse[] = [
      {
        id: 1,
        filePath: '/img1.png',
        description: 'desc1',
        hashtags: '',
        mentions: '',
        userId: 'user1',
        createdAt: new Date().toISOString(),
        reactionCount: 0,
        hasReacted: false,
        commentCount: 0,
      },
      {
        id: 2,
        filePath: '/img2.png',
        description: 'desc2',
        hashtags: '',
        mentions: '',
        userId: 'user2',
        createdAt: new Date().toISOString(),
        reactionCount: 0,
        hasReacted: false,
        commentCount: 0,
      },
    ];

    service.getImages().subscribe((images) => {
      expect(images.length).toBe(2);
      expect(images).toEqual(mockImages);
    });

    // On ajoute ici les paramètres de pagination par défaut (1 et 15)
    const req = httpMock.expectOne('http://localhost:8081/api/images?page=1&limit=15');
    expect(req.request.method).toBe('GET');
    req.flush(mockImages);
  });

  it('should update an image', () => {
    const updateData = {
      description: 'Updated Desc',
      hashtags: '#updated',
      mentions: '@updated',
    };
    const mockResponse: ImageResponse = {
      id: 1,
      filePath: '/img1.png',
      description: 'Updated Desc',
      hashtags: '#updated',
      mentions: '@updated',
      userId: 'test-user',
      createdAt: new Date().toISOString(),
      reactionCount: 0,
      hasReacted: false,
      commentCount: 0,
      profilePictureUrl: '',
    };

    service.updateImage(1, updateData).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8081/api/images/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateData);
    req.flush(mockResponse);
  });

  it('should delete an image', () => {
    service.deleteImage(1).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne('http://localhost:8081/api/images/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
