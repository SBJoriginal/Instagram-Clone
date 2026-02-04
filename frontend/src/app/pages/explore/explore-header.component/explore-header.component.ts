import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-explore-header',
  standalone: true,
  template: `
    <header class="explore-header">
      <h1>Explore</h1>
    </header>
  `,
  styles: [`
    .explore-header {
      padding: 20px;
      border-bottom: 1px solid #dbdbdb;
      text-align: center;
      background: white;
    }
    h1 { margin: 0; font-size: 1.5rem; font-weight: 600; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExploreHeaderComponent { }