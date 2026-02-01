import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTags',
})
export class FormatTagsPipe implements PipeTransform {
  /**
   * Format tags by trimming, lowercasing, and removing duplicates
   * @param value - Comma or space-separated tag string
   * @param prefix - Optional prefix (# or @)
   * @returns Formatted string with unique tags
   */
  transform(value: string, prefix: '#' | '@' = '#'): string {
    if (!value) return '';

    // Split by spaces or commas, trim, and lowercase
    const tags = value
      .split(/[\s,]+/)
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0)
      .map((tag) => {
        // Remove existing prefix if present
        const cleanTag = tag.replace(/^[@#]/, '');
        return cleanTag ? `${prefix}${cleanTag}` : '';
      })
      .filter((tag) => tag.length > 1);

    // Remove duplicates
    const uniqueTags = [...new Set(tags)];

    return uniqueTags.join(' ');
  }
}
