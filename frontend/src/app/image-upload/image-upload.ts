import { Component, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HashtagPipe } from '../pipes/hashtag.pipe';
import { MentionPipe } from '../pipes/mention.pipe';
import { FileSizePipe } from '../pipes/file-size.pipe';

export interface ImageUploadData {
  file: File;
  description: string;
  hashtags: string;
  mentions: string;
}

@Component({
  selector: 'app-image-upload',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './image-upload.html',
  styleUrl: './image-upload.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploadComponent {
  // Output event for upload data
  readonly uploadImage = output<ImageUploadData>();

  // Signals for state management
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly previewUrl = signal<string | null>(null);
  protected readonly validationError = signal<string | null>(null);

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

  // Reactive form
  protected readonly uploadForm = new FormGroup({
    description: new FormControl('', { nonNullable: true }),
    hashtags: new FormControl('', { nonNullable: true }),
    mentions: new FormControl('', { nonNullable: true }),
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
    const control = this.uploadForm.controls.mentions;
    const value = control.value;
    if (!value) return;

    const formatted = new MentionPipe().transform(value).join(' ');
    if (formatted !== value) {
      control.setValue(formatted);
    }
  }

  protected onSubmit(): void {
    const file = this.selectedFile();
    if (!file) {
      this.validationError.set('Please select an image file.');
      return;
    }

    const formValue = this.uploadForm.getRawValue();
    const uploadData: ImageUploadData = {
      file,
      description: formValue.description,
      hashtags: formValue.hashtags,
      mentions: formValue.mentions,
    };

    this.uploadImage.emit(uploadData);
  }
}
