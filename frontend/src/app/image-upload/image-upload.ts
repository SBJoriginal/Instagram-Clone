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
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { startWith, map } from 'rxjs/operators';
import { HashtagPipe } from '../pipes/hashtag.pipe';
import { MentionPipe } from '../pipes/mention.pipe';
import { FileSizePipe } from '../pipes/file-size.pipe';
import { ImageResponse } from '../services/image-upload.service';
import { UserService } from '../services/user.service';
import { ProfileService } from '../services/profile.service';
import { environment } from '../../environments/environment';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ImageCompressionService } from '../services/image-compression.service';
import { ImageFilterDialogComponent } from '../shared/components/image-filter-dialog/image-filter-dialog.component';

export interface ImageUploadData {
  file: File;
  description: string;
  hashtags: string;
  mentions: string;
}

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule,
    MatChipsModule,
    ImageFilterDialogComponent,
  ],
  templateUrl: './image-upload.html',
  styleUrl: './image-upload.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HashtagPipe, MentionPipe, FileSizePipe],
})
export class ImageUploadComponent implements OnInit {
  readonly editData = input<ImageResponse | null>(null);

  readonly uploadImage = output<ImageUploadData>();
  readonly cancelEdit = output<void>();

  protected readonly selectedFile = signal<File | null>(null);
  protected readonly previewUrl = signal<string | null>(null);
  protected readonly validationError = signal<string | null>(null);
  protected readonly allUsernames = signal<string[]>([]);
  protected readonly isCompressing = signal<boolean>(false);

  protected readonly selectedMentions = signal<string[]>([]);

  protected readonly separatorKeysCodes = [ENTER, COMMA, SPACE];

  private readonly userService = inject(UserService);
  private readonly profileService = inject(ProfileService);
  private readonly hashtagPipe = inject(HashtagPipe);
  private readonly mentionPipe = inject(MentionPipe);
  private readonly fileSizePipe = inject(FileSizePipe);
  private readonly compressionService = inject(ImageCompressionService);
  private readonly dialog = inject(MatDialog);

  private existingUsernames = new Set<string>();
  private currentUsername: string | null = null;

  protected readonly uploadForm = new FormGroup({
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.pattern(/^[^<>]*$/)], // Prevent angle brackets to avoid HTML injection
    }),
    hashtags: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.pattern(/^[a-zA-Z0-9#\s]*$/), // Only allow alpha-numeric, space, and #
      ],
    }),
    mentions: new FormControl('', {
      nonNullable: true,
      // Mentions are already controlled so this is a "fail-safe"
      validators: [Validators.pattern(/^(@[a-zA-Z0-9_\-.]+\s*)*$/)],
    }),
  });

  protected readonly mentionInputControl = new FormControl('');

  protected readonly filteredUsers$ = this.mentionInputControl.valueChanges.pipe(
    startWith(''),
    map((value) => this._filter(value || '')),
  );

  private _filter(value: string): string[] {
    const filterValue = value.replace('@', '').toLowerCase();
    return this.allUsernames().filter(
      (user) =>
        user.toLowerCase().includes(filterValue) &&
        user !== this.currentUsername &&
        !this.selectedMentions().includes(user),
    );
  }

  private _executeMentionAddition(username: string): void {
    if (username === this.currentUsername) {
      this.validationError.set('You cannot mention yourself.');
      this.mentionInputControl.setValue('');
      return;
    }

    if (username) {
      if (!this.selectedMentions().includes(username)) {
        this.selectedMentions.update((prev) => [...prev, username]);
        this.syncMentionsToForm();
        this.validationError.set(null);
      } else {
        this.validationError.set(`User @${username} is already mentioned.`);
      }
    }
    this.mentionInputControl.setValue('');
  }

  protected addMention(event: MatAutocompleteSelectedEvent, input: HTMLInputElement): void {
    this._executeMentionAddition(event.option.value);
    input.value = '';
  }

  protected removeMention(username: string): void {
    this.selectedMentions.update((prev) => prev.filter((u) => u !== username));
    this.syncMentionsToForm();
    this.validationError.set(null);
  }

  private syncMentionsToForm(): void {
    const mentionsString = this.selectedMentions()
      .map((u) => `@${u}`)
      .join(' ');
    this.uploadForm.controls.mentions.setValue(mentionsString);
  }

  protected onChipInputEnd(event: MatChipInputEvent): void {
    const value = (event.value || '').trim().replace('@', '');

    if (value) {
      const lowerValue = value.toLowerCase();

      if (lowerValue === this.currentUsername?.toLowerCase()) {
        this.validationError.set('You cannot mention yourself.');
      } else if (this.existingUsernames.has(lowerValue)) {
        const originalName = this.allUsernames().find((n) => n.toLowerCase() === lowerValue);
        this._executeMentionAddition(originalName || value);
      } else {
        this.validationError.set(`The user @${value} does not exist.`);
      }
    }

    event.chipInput!.clear();
  }

  protected readonly fileInfo = computed(() => {
    const file = this.selectedFile();
    if (!file) return null;
    return {
      name: file.name,
      size: this.fileSizePipe.transform(file.size),
      type: file.type,
    };
  });

  protected readonly formattedHashtags = computed(() => {
    return this.hashtagPipe.transform(this.uploadForm.controls.hashtags.value);
  });

  protected readonly formattedMentions = computed(() => {
    return this.mentionPipe.transform(this.uploadForm.controls.mentions.value);
  });

  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.currentUsername = profile?.userName || null;
      },
    });

    const data = this.editData();
    if (data) {
      this.uploadForm.patchValue({
        description: data.description || '',
        hashtags: data.hashtags || '',
        mentions: data.mentions || '',
      });

      if (data.mentions) {
        const names = data.mentions
          .split(/\s+/)
          .filter((m) => m.startsWith('@'))
          .map((m) => m.substring(1));
        this.selectedMentions.set(names);
      }

      if (data.filePath) {
        const filePath = data.filePath;
        const baseUrl = environment.apiUrl.replace('/api', '');
        this.previewUrl.set(filePath.startsWith('http') ? filePath : baseUrl + filePath);
      }
    }

    this.userService.getUsers().subscribe({
      next: (users) => {
        const names = users.map((u) => u.userName || '');
        this.allUsernames.set(names);
        this.existingUsernames = new Set(names.map((n) => n.toLowerCase()));
      },
      error: () => {
        this.existingUsernames = new Set<string>();
        this.allUsernames.set([]);
      },
    });
  }

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
    this.validationError.set(null);

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      this.validationError.set('Invalid file type. Please select a JPG, PNG, GIF, or WebP image.');
      this.clearFile();
      return;
    }

    if (file.size > this.MAX_FILE_SIZE) {
      this.validationError.set(
        `File size exceeds 5MB. Your file is ${this.fileSizePipe.transform(file.size)}.`,
      );
      this.clearFile();
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;

      const dialogRef = this.dialog.open(ImageFilterDialogComponent, {
        width: '900px',
        maxWidth: '95vw',
        maxHeight: '95vh',
        data: { imageUrl: url },
      });

      dialogRef.afterClosed().subscribe((editedBlob: Blob | undefined) => {
        if (editedBlob) {
          const editedFile = new File([editedBlob], file.name, { type: 'image/jpeg' });
          this.selectedFile.set(editedFile);
          this.previewUrl.set(URL.createObjectURL(editedFile));
        }
      });
    };
    reader.readAsDataURL(file);
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
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  protected onHashtagsBlur(): void {
    const control = this.uploadForm.controls.hashtags;
    if (control.value) {
      control.setValue(this.hashtagPipe.transform(control.value).join(' '));
    }
  }

  protected async onSubmit(): Promise<void> {
    const isEditMode = !!this.editData();
    let file = this.selectedFile();

    if (this.uploadForm.invalid) {
      if (this.uploadForm.controls.mentions.invalid) {
        this.validationError.set(
          'Invalid mention format. Mentions must start with @ and only contain letters, numbers, underscores, hyphens, and dots.',
        );
      } else if (this.uploadForm.controls.hashtags.invalid) {
        this.validationError.set(
          'Invalid hashtag format. Only letters, numbers, and # are allowed.',
        );
      } else {
        this.validationError.set('Please fix the errors in the form before saving.');
      }
      return;
    }

    if (!isEditMode && !file) {
      this.validationError.set('Please select an image file.');
      return;
    }

    const pendingMentionText = this.mentionInputControl.value?.trim();
    if (pendingMentionText) {
      const cleanedPending = pendingMentionText.replace(/^@/, '').toLowerCase();
      if (cleanedPending === this.currentUsername?.toLowerCase()) {
        this.validationError.set('You cannot mention yourself.');
      } else if (!this.existingUsernames.has(cleanedPending)) {
        this.validationError.set(
          `The user @${pendingMentionText.replace(/^@/, '')} does not exist.`,
        );
      } else {
        this.validationError.set(
          `Please complete adding the mention "${pendingMentionText}" by pressing Space, Enter, or Comma, or remove it before submitting.`,
        );
      }
      return;
    }

    // Compress file if in upload mode
    if (!isEditMode && file) {
      try {
        this.isCompressing.set(true);
        const compressedBlob = await this.compressionService.compressImage(file);
        // Ensure the filename ends in .jpg since we compressed it to image/jpeg
        const originalName = file.name;
        const lastDotIndex = originalName.lastIndexOf('.');
        const nameWithoutExtension =
          lastDotIndex !== -1 ? originalName.substring(0, lastDotIndex) : originalName;
        const newFileName = `${nameWithoutExtension}.jpg`;

        file = new File([compressedBlob], newFileName, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
      } catch (error) {
        console.error('Compression failed:', error);
        this.validationError.set('Failed to process image. Please try again.');
        this.isCompressing.set(false);
        return;
      } finally {
        this.isCompressing.set(false);
      }
    }

    const formValue = this.uploadForm.getRawValue();

    const uploadData: ImageUploadData = {
      file: file as File,
      description: formValue.description,
      hashtags: formValue.hashtags,
      mentions: formValue.mentions,
    };

    this.validationError.set(null);
    this.uploadImage.emit(uploadData);
  }
}
