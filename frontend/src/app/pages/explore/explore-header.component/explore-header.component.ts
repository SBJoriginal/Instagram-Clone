import { Component, ChangeDetectionStrategy, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

export type SearchType = 'images' | 'users';
export type ImageFilter = 'description' | 'hashtag';

@Component({
  selector: 'app-explore-header',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonToggleModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule,
  ],
  templateUrl: './explore-header.component.html',
  styleUrl: './explore-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExploreHeaderComponent {
  searchTypeChange = output<SearchType>();
  imageFilterChange = output<{ filter: ImageFilter; query: string }>();

  protected searchQuery = '';
  protected readonly currentFilter = signal<ImageFilter>('description');

  protected onSearch(): void {
    let query = this.searchQuery;

    // if hashtag mode, add # before word if theres none
    if (this.currentFilter() === 'hashtag' && query) {
      // add # to each word if theres none
      const words = query.split(/\s+/).filter((w) => w.length > 0);
      query = words.map((word) => (word.startsWith('#') ? word : '#' + word)).join(' ');
      this.searchQuery = query;
    }

    this.imageFilterChange.emit({
      filter: this.currentFilter(),
      query: this.searchQuery,
    });
  }

  protected clearSearch(): void {
    this.searchQuery = '';
    this.onSearch();
  }

  protected onFilterChange(newFilter: ImageFilter): void {
    this.currentFilter.set(newFilter);
    this.searchQuery = '';
    this.onSearch();
  }

  protected onSearchTypeChange(type: SearchType): void {
    this.searchQuery = '';
    this.searchTypeChange.emit(type);
  }
}
