import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { ImageUploadService, ImageResponse } from '../../services/image-upload.service';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { MatDialog } from '@angular/material/dialog';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockImageService: {
    getImages: ReturnType<typeof vi.fn>;
    deleteImage: ReturnType<typeof vi.fn>;
    updateImage: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockImageService = {
      getImages: vi
        .fn()
        .mockReturnValue(of([{ id: 1, filePath: '/uploads/test.png', description: 'Test' }])),
      deleteImage: vi.fn().mockReturnValue(of(void 0)),
      updateImage: vi.fn().mockReturnValue(of({})),
    };

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ImageUploadService, useValue: mockImageService },
        {
          provide: MatDialog,
          useValue: {
            open: vi.fn().mockReturnValue({ afterClosed: () => of(true) }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch images on init', () => {
    expect(mockImageService.getImages).toHaveBeenCalled();
  });

  it('should delete image', () => {
    const image = { id: 1, filePath: 'path', description: 'desc' } as ImageResponse;

    // Mock confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.deleteImage(image);

    expect(mockImageService.deleteImage).toHaveBeenCalledWith(1);
  });
});
