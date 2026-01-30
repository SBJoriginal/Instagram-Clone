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
    const hashtagsInput = fixture.nativeElement.querySelector('input[formControlName="hashtags"]');

    // Simulate user typing
    hashtagsInput.value = 'test value';
    hashtagsInput.dispatchEvent(new Event('input'));

    // Simulate blur event
    hashtagsInput.dispatchEvent(new Event('blur'));

    // Check input value (logic should have updated it)
    expect(hashtagsInput.value).toBe('#test #value');
  });

  it('should auto-format mentions on blur', () => {
    const mentionsInput = fixture.nativeElement.querySelector('input[formControlName="mentions"]');

    mentionsInput.value = 'user friend';
    mentionsInput.dispatchEvent(new Event('input'));

    mentionsInput.dispatchEvent(new Event('blur'));

    expect(mentionsInput.value).toBe('@user @friend');
  });
});
