import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mention',
  standalone: true,
})
export class MentionPipe implements PipeTransform {
  transform(value: string): string[] {
    if (!value) return [];

    // Split by spaces and filter out empty strings
    return value
      .split(/\s+/)
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .map((tag) => {
        // Add @ if not present
        return tag.startsWith('@') ? tag : `@${tag}`;
      })
      .filter((tag) => tag.length > 1); // Remove standalone @
  }
}
