import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-back-arrow',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './back-arrow.component.html',
  styleUrl: './back-arrow.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackArrowComponent {}
