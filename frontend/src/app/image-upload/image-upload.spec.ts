import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageUploadComponent } from './image-upload';
import { ReactiveFormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { UserService } from '../services/user.service';
import { ProfileService } from '../services/profile.service';
import { of } from 'rxjs';
import { User } from '../models/user.model';
import { MatChipInputEvent } from '@angular/material/chips';
import { HashtagPipe } from '../pipes/hashtag.pipe';
import { MentionPipe } from '../pipes/mention.pipe';
import { FileSizePipe } from '../pipes/file-size.pipe';
import { ProfileResponse } from '../models/auth.models';

describe('ImageUploadComponent', () => {
  let component: ImageUploadComponent;
  let fixture: ComponentFixture<ImageUploadComponent>;

  const mockUserService: Partial<UserService> = {
    getUsers: () => of([{ userName: 'user' }, { userName: 'friend' }] as User[]),
  };

  const mockProfileService: Partial<ProfileService> = {
    getProfile: () => of({ userName: 'mySelf' } as ProfileResponse),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageUploadComponent, ReactiveFormsModule],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: ProfileService, useValue: mockProfileService },
        HashtagPipe,
        MentionPipe,
        FileSizePipe,
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

  it('should have invalid form when no file is selected', () => {
    expect(component['selectedFile']()).toBeNull();
  });

  it('should auto-format hashtags on blur', () => {
    const hashtagsControl = component['uploadForm'].controls.hashtags;
    hashtagsControl.setValue('test value');

    component['onHashtagsBlur']();
    fixture.detectChanges();

    expect(hashtagsControl.value).toBe('#test #value');
  });

  it('should add mentions as chips and update the form control', () => {
    const chipInputEvent = {
      value: 'friend',
      chipInput: {
        clear: () => {
          // No-op for testing
        },
      },
    } as unknown as MatChipInputEvent;

    component['onChipInputEnd'](chipInputEvent);
    fixture.detectChanges();

    expect(component['selectedMentions']()).toContain('friend');
    expect(component['uploadForm'].controls.mentions.value).toBe('@friend');
  });

  it('should show error when mentioning yourself', () => {
    const chipInputEvent = {
      value: 'mySelf',
      chipInput: {
        clear: () => {
          // No-op for testing
        },
      },
    } as unknown as MatChipInputEvent;

    component['onChipInputEnd'](chipInputEvent);
    fixture.detectChanges();

    expect(component['validationError']()).toBe('You cannot mention yourself.');
  });
});
