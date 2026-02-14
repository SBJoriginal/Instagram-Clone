import {
  Component,
  output,
  signal,
  computed,
  ChangeDetectionStrategy,
  input,
  OnInit,
  inject,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { startWith, map } from 'rxjs/operators';
import { HashtagPipe } from '../pipes/hashtag.pipe';
import { MentionPipe } from '../pipes/mention.pipe';
import { FileSizePipe } from '../pipes/file-size.pipe';
import { ImageResponse } from '../services/image-upload.service';
import { UserService } from '../services/user.service';
import { environment } from '../../environments/environment';

export interface ImageUploadData {
  file: File;
  description: string;
  hashtags: string;
  mentions: string;
}

@Component({
  selector: 'app-image-upload',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule,
  ],
  templateUrl: './image-upload.html',
  styleUrl: './image-upload.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploadComponent implements OnInit {
  // Inputs
  readonly editData = input<ImageResponse | null>(null);

  // Output event for upload data
  readonly uploadImage = output<ImageUploadData>();
  readonly cancelEdit = output<void>();

  // Signals for state management
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly previewUrl = signal<string | null>(null);
  protected readonly validationError = signal<string | null>(null);
  protected readonly allUsernames = signal<string[]>([]);

  private readonly userService = inject(UserService);
  private existingUsernames = new Set<string>();

  // Reactive form
  protected readonly uploadForm = new FormGroup({
    description: new FormControl('', { nonNullable: true }),
    hashtags: new FormControl('', { nonNullable: true }),
    mentions: new FormControl('', { nonNullable: true }),
  });

  // Observable for filtered suggestions
  protected readonly filteredUsers$ = this.uploadForm.controls.mentions.valueChanges.pipe(
    startWith(''),
    map((value) => this.filterUsers(value)),
  );

  private filterUsers(value: string): string[] {
    const words = value.split(/\s+/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('@')) {
      const filterValue = lastWord.substring(1).toLowerCase();
      return this.allUsernames().filter((name) => name.toLowerCase().includes(filterValue));
    }
    return [];
  }

  protected onUserSelected(username: string): void {
    const control = this.uploadForm.controls.mentions;
    const words = control.value.split(/\s+/);
    words.pop();
    words.push(`@${username}`);
    const newValue = words.join(' ') + ' ';
    control.setValue(newValue);
    this.validationError.set(null);
  }

  // Computed signal for file info display
  protected readonly fileInfo = computed(() => {
    const file = this.selectedFile();
    if (!file) return null;
    const fileSizePipe = new FileSizePipe();
    return {
      name: file.name,
      size: fileSizePipe.transform(file.size),
      type: file.type,
    };
  });

  // Computed signals for formatted tags
  protected readonly formattedHashtags = computed(() => {
    const hashtags = this.uploadForm.controls.hashtags.value;
    const hashtagPipe = new HashtagPipe();
    return hashtagPipe.transform(hashtags);
  });

  protected readonly formattedMentions = computed(() => {
    const mentions = this.uploadForm.controls.mentions.value;
    const mentionPipe = new MentionPipe();
    return mentionPipe.transform(mentions);
  });

  // File validation constants
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    this.validateAndSetFile(file);
  }

  protected onFileDropped(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    this.validateAndSetFile(file);
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  private validateAndSetFile(file: File): void {
    // Reset validation error
    this.validationError.set(null);

    // Validate file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      this.validationError.set('Invalid file type. Please select a JPG, PNG, GIF, or WebP image.');
      this.clearFile();
      return;
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      const fileSizePipe = new FileSizePipe();
      this.validationError.set(
        `File size exceeds 5MB. Your file is ${fileSizePipe.transform(file.size)}.`,
      );
      this.clearFile();
      return;
    }

    // Set file and create preview
    this.selectedFile.set(file);
    this.createPreview(file);
  }

  private createPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  private clearFile(): void {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
  }

  protected removeFile(): void {
    this.clearFile();
    this.validationError.set(null);
    // Reset file input
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  protected onHashtagsBlur(): void {
    const control = this.uploadForm.controls.hashtags;
    const value = control.value;
    if (!value) return;

    const formatted = new HashtagPipe().transform(value).join(' ');
    if (formatted !== value) {
      control.setValue(formatted);
    }
  }

  protected onMentionsBlur(): void {
    setTimeout(() => {
      const control = this.uploadForm.controls.mentions;
      const value = control.value;
      if (!value) return;

      const formatted = new MentionPipe().transform(value).join(' ');
      if (formatted !== value) {
        control.setValue(formatted);
      }

      // Validate mentions immediately after formatting
      const missing = this.validateMentionsString(control.value);
      if (missing.length > 0) {
        this.validationError.set(
          `The following mentioned users do not exist: ${missing.map((m) => '@' + m).join(', ')}`,
        );
      } else {
        this.validationError.set(null);
      }
    }, 200);
  }

  ngOnInit(): void {
    const data = this.editData();
    if (data) {
      this.uploadForm.patchValue({
        description: data.description || '',
        hashtags: data.hashtags || '',
        mentions: data.mentions || '',
      });
      // In edit mode, we don't necessarily have a File object, but we have a URL
      if (data.filePath) {
        const baseUrl = environment.apiUrl.replace('/api', '');
        this.previewUrl.set(baseUrl + data.filePath);
      }
    }

    // Load existing usernames for mention validation
    this.userService.getUsers().subscribe({
      next: (users) => {
        const names = users.map((u) => u.userName || '');
        this.allUsernames.set(names);
        this.existingUsernames = new Set(names.map((n) => n.toLowerCase()));
      },
      error: () => {
        // If user list can't be loaded, we conservatively clear the set
        this.existingUsernames = new Set<string>();
        this.allUsernames.set([]);
      },
    });
  }

  protected onSubmit(): void {
    const isEditMode = !!this.editData();
    const file = this.selectedFile();

    if (!isEditMode && !file) {
      this.validationError.set('Please select an image file.');
      return;
    }

    const formValue = this.uploadForm.getRawValue();
    const uploadData: ImageUploadData = {
      file: file as File, // In edit mode, file might be null if not changed
      description: formValue.description,
      hashtags: formValue.hashtags,
      mentions: formValue.mentions,
    };

    // Validate mentions against existing users
    const missing = this.validateMentionsString(uploadData.mentions);
    if (missing.length > 0) {
      this.validationError.set(
        `The following mentioned users do not exist: ${missing.map((m) => '@' + m).join(', ')}`,
      );
      return;
    }

    this.validationError.set(null);
    this.uploadImage.emit(uploadData);
  }
  //Search for @mentions in the string and validate against existing usernames
  private validateMentionsString(value: string): string[] {
    if (!value) return [];
    const mentionPipe = new MentionPipe();
    const mentions = mentionPipe.transform(value).map((m) => m.replace(/^@/, '').toLowerCase());
    const missing: string[] = [];
    for (const m of mentions) {
      if (!this.existingUsernames.has(m)) {
        missing.push(m);
      }
    }
    return missing;
  }
}
