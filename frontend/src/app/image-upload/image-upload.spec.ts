import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageUploadComponent } from './image-upload';
import { ReactiveFormsModule } from '@angular/forms';

describe('ImageUploadComponent', () => {
  let component: ImageUploadComponent;
  let fixture: ComponentFixture<ImageUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageUploadComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should invalidate form when no file is selected', () => {
    const submitBtn = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitBtn.disabled).toBeTruthy();
  });

  it('should auto-format hashtags on blur', () => {
    // Access the private/protected method by casting or just testing the effect on UI/Control
    // Since we can access the form control:
    const hashtagsControl = (component as any).uploadForm.controls.hashtags;
    hashtagsControl.setValue('test value');

    // Trigger blur manually or call the method
    (component as any).onHashtagsBlur();

    expect(hashtagsControl.value).toBe('#test #value');
  });

  it('should auto-format mentions on blur', () => {
    const mentionsControl = (component as any).uploadForm.controls.mentions;
    mentionsControl.setValue('user friend');

    (component as any).onMentionsBlur();

    expect(mentionsControl.value).toBe('@user @friend');
  });
});
