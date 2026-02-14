import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageUploadComponent } from './image-upload';
import { ReactiveFormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { UserService } from '../services/user.service';
import { of } from 'rxjs';
import { User } from '../models/user.model';
import { MatChipInputEvent } from '@angular/material/chips';

describe('ImageUploadComponent', () => {
  let component: ImageUploadComponent;
  let fixture: ComponentFixture<ImageUploadComponent>;

  const mockUserService: Partial<UserService> = {
    getUsers: () => of([{ userName: 'user' }, { userName: 'friend' }] as User[]),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageUploadComponent, ReactiveFormsModule],
      providers: [
        { provide: UserService, useValue: mockUserService },
        provideHttpClient(),
        provideAnimations(),
      ],
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
    const hashtagsInput = fixture.nativeElement.querySelector(
      'input[formControlName="hashtags"]',
    ) as HTMLInputElement;
    hashtagsInput.value = 'test value';
    hashtagsInput.dispatchEvent(new Event('input'));
    hashtagsInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(hashtagsInput.value).toBe('#test #value');
  });

  it('should add mentions as chips and update the hidden form control', () => {
    const mentionsInput = fixture.nativeElement.querySelector(
      'input[placeholder="Type @ to mention..."]',
    ) as HTMLInputElement;

    expect(mentionsInput).toBeTruthy();

    mentionsInput.value = 'user';
    mentionsInput.dispatchEvent(new Event('input'));

    const chipInputEvent = {
      value: 'user',
      input: mentionsInput,
      chipInput: {
        clear: () => {
          mentionsInput.value = '';
        },
      },
    } as MatChipInputEvent;

    component['onChipInputEnd'](chipInputEvent);

    fixture.detectChanges();

    expect(component['selectedMentions']()).toContain('user');

    const hiddenControlValue = component['uploadForm'].controls.mentions.value;
    expect(hiddenControlValue).toBe('@user');
  });
});
