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
import { UserService } from '../../../services/user.service';

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
  userSearchChange = output<string>();

  private readonly imageService = inject(ImageUploadService);
  private readonly userService = inject(UserService);

  protected searchQuery = '';
  protected readonly currentFilter = signal<ImageFilter>('description');
  protected readonly currentSearchType = signal<SearchType>('images');

  protected onSearchInput(value: string): void {
    this.searchQuery = value;
    this.queryChange$.next(value);

    if (this.currentSearchType() === 'users') {
      this.userSearchChange.emit(value);
    } else {
      this.imageFilterChange.emit({
        filter: this.currentFilter(),
        query: value,
      });
    }
  }

  protected onFinalSearch(): void {
    let query = this.searchQuery;

    if (this.currentSearchType() === 'images' && this.currentFilter() === 'hashtag' && query) {
      const words = query.split(/\s+/).filter((w) => w.length > 0);
      query = words.map((word) => (word.startsWith('#') ? word : '#' + word)).join(' ');
      this.searchQuery = query;
    }

    if (this.currentSearchType() === 'users') {
      this.userSearchChange.emit(this.searchQuery);
    } else {
      this.imageFilterChange.emit({
        filter: this.currentFilter(),
        query: this.searchQuery,
      });
    }
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

      if (this.currentSearchType() === 'users') {
        return this.userService.getUsernameAutocomplete(value);
      } else {
        const cleanQuery =
          this.currentFilter() === 'hashtag' ? value.replace(/^#+/, '').trim() : value;
        if (!cleanQuery) return of([]);
        return this.imageService.getAutocomplete(this.currentFilter(), cleanQuery);
      }
    }),
    map((suggestions) => suggestions.slice(0, 5)),
  );

  protected clearSearch(): void {
    this.searchQuery = '';
    this.queryChange$.next('');

    if (this.currentSearchType() === 'users') {
      this.userSearchChange.emit('');
    } else {
      this.imageFilterChange.emit({
        filter: this.currentFilter(),
        query: '',
      });
    }
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
    this.currentSearchType.set(type);
    this.searchQuery = '';
    this.queryChange$.next('');
    this.imageFilterChange.emit({
      filter: this.currentFilter(),
      query: '',
    });

    this.userSearchChange.emit('');
    this.searchTypeChange.emit(type);
  }
}
