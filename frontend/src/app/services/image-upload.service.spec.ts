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
    };

    service.uploadImage(mockData).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:5266/api/images');
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTruthy();
    req.flush(mockResponse);
  });

  it('should get all images', () => {
    const mockImages: ImageResponse[] = [
      { id: 1, filePath: '/img1.png', description: 'desc1' },
      { id: 2, filePath: '/img2.png', description: 'desc2' },
    ];

    service.getImages().subscribe((images) => {
      expect(images.length).toBe(2);
      expect(images).toEqual(mockImages);
    });

    const req = httpMock.expectOne('http://localhost:5266/api/images');
    expect(req.request.method).toBe('GET');
    req.flush(mockImages);
  });
});
