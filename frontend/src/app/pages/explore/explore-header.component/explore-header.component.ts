import { Component, ChangeDetectionStrategy, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { FormsModule } from '@angular/forms';
import { startWith, switchMap, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { ImageUploadService } from '../../../services/image-upload.service';

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
    MatAutocompleteModule,
    FormsModule,
  ],
  templateUrl: './explore-header.component.html',
  styleUrl: './explore-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExploreHeaderComponent {
  searchTypeChange = output<SearchType>();
  imageFilterChange = output<{ filter: ImageFilter; query: string }>();

  private readonly imageService = inject(ImageUploadService);

  protected searchQuery = '';
  protected readonly currentFilter = signal<ImageFilter>('description');

  protected onSearchInput(value: string): void {
    this.searchQuery = value;

    this.queryChange$.next(value);

    this.imageFilterChange.emit({
      filter: this.currentFilter(),
      query: value,
    });
  }

  protected onFinalSearch(): void {
    let query = this.searchQuery;

    if (this.currentFilter() === 'hashtag' && query) {
      const words = query.split(/\s+/).filter((w) => w.length > 0);
      query = words.map((word) => (word.startsWith('#') ? word : '#' + word)).join(' ');
      this.searchQuery = query;
    }

    this.imageFilterChange.emit({
      filter: this.currentFilter(),
      query: this.searchQuery,
    });
  }

  protected onSuggestionSelected(event: MatAutocompleteSelectedEvent): void {
    this.searchQuery = event.option.value;
    this.onFinalSearch();
  }

  private readonly queryChange$ = new Subject<string>();
  protected readonly filteredSuggestions$ = this.queryChange$.pipe(
    startWith(''),
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((value) => {
      if (!value || value.length < 2) return of([]);

      const cleanQuery =
        this.currentFilter() === 'hashtag' ? value.replace(/^#+/, '').trim() : value;

      if (!cleanQuery) return of([]);

      return this.imageService.getAutocomplete(this.currentFilter(), cleanQuery);
    }),
    map((suggestions) => suggestions.slice(0, 3)),
  );

  protected clearSearch(): void {
    this.searchQuery = '';
    this.queryChange$.next('');
    this.imageFilterChange.emit({
      filter: this.currentFilter(),
      query: '',
    });
  }

  protected onFilterChange(newFilter: ImageFilter): void {
    this.currentFilter.set(newFilter);
    this.searchQuery = '';
    this.queryChange$.next('');
    this.imageFilterChange.emit({
      filter: newFilter,
      query: '',
    });
  }

  protected onSearchTypeChange(type: SearchType): void {
    this.searchQuery = '';
    this.searchTypeChange.emit(type);
  }
}
