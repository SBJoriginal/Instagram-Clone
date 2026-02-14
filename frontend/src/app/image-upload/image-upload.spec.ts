import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageUploadComponent } from './image-upload';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { UserService } from '../services/user.service';
import { of } from 'rxjs';

describe('ImageUploadComponent', () => {
  let component: ImageUploadComponent;
  let fixture: ComponentFixture<ImageUploadComponent>;
  let mockUserService: any;

  beforeEach(async () => {
    mockUserService = {
      getUsers: () => of([{ userName: 'user' }, { userName: 'friend' }])
    };

    await TestBed.configureTestingModule({
      imports: [
        ImageUploadComponent, 
        ReactiveFormsModule, 
        BrowserAnimationsModule
      ],
      providers: [
        { provide: UserService, useValue: mockUserService },
        provideHttpClient()
      ]
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
    hashtagsInput.value = 'test value';
    hashtagsInput.dispatchEvent(new Event('input'));
    hashtagsInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(hashtagsInput.value).toBe('#test #value');
  });

  it('should add mentions as chips and update the hidden form control', () => {
    const mentionsInput = fixture.nativeElement.querySelector('input[placeholder="Type @ to mention..."]');
    
    mentionsInput.value = 'user';
    mentionsInput.dispatchEvent(new Event('input'));
    
    const event = new KeyboardEvent('keydown', {
      key: 'Enter'
    });
    mentionsInput.dispatchEvent(event);
    
    fixture.detectChanges();

    expect(component['selectedMentions']()).toContain('user');

    const hiddenControlValue = component['uploadForm'].controls.mentions.value;
    expect(hiddenControlValue).toBe('@user');
  });
});