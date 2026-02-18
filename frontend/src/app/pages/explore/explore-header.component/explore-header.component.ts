import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

export type SearchType = 'images' | 'users';
export type ImageFilter = 'description' | 'hashtag';

@Component({
  selector: 'app-explore-header',
  standalone: true,
  imports: [CommonModule, MatButtonToggleModule, MatInputModule, MatFormFieldModule, MatIconModule],
  templateUrl: './explore-header.component.html',
  styleUrl: './explore-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExploreHeaderComponent {
  searchTypeChange = output<SearchType>();
  imageFilterChange = output<ImageFilter>();
}
