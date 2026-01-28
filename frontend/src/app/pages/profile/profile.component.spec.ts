import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { ImageUploadService } from '../../services/image-upload.service';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockImageService: { getImages: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockImageService = {
      getImages: vi
        .fn()
        .mockReturnValue(of([{ id: 1, filePath: '/uploads/test.png', description: 'Test' }])),
    };

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ImageUploadService, useValue: mockImageService },
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
});
