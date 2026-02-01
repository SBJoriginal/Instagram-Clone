import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageEditDialog } from './image-edit-dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { vi } from 'vitest';
import { ImageUploadComponent } from '../image-upload/image-upload';

describe('ImageEditDialog', () => {
  let component: ImageEditDialog;
  let fixture: ComponentFixture<ImageEditDialog>;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };
  const mockData = {
    id: 1,
    filePath: 'test.png',
    description: 'Test Desc',
    hashtags: '#test',
    mentions: '@test',
  };

  beforeEach(async () => {
    mockDialogRef = {
      close: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ImageEditDialog, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageEditDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with data', () => {
    expect(component['data']).toBe(mockData);
  });

  it('should close dialog on cancel event', () => {
    const uploadComponent = fixture.debugElement.query(
      By.directive(ImageUploadComponent),
    ).componentInstance;
    uploadComponent.cancelEdit.emit();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should close with data on uploadImage event', () => {
    const uploadComponent = fixture.debugElement.query(
      By.directive(ImageUploadComponent),
    ).componentInstance;
    const testUploadData = {
      file: null as unknown as File,
      description: 'New Desc',
      hashtags: '#test',
      mentions: '@test',
    };

    uploadComponent.uploadImage.emit(testUploadData);

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      description: 'New Desc',
      hashtags: '#test',
      mentions: '@test',
    });
  });
});
