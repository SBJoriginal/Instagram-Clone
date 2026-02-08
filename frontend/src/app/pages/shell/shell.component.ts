import { ChangeDetectionStrategy, Component, ViewChild, signal, inject } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './navigation/navigation.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatToolbarModule,
    NavigationComponent,
    RouterOutlet,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  isMobile = signal(false);

  private breakpointObserver = inject(BreakpointObserver);

  constructor() {
    this.breakpointObserver.observe(['(max-width: 1350px)']).subscribe((result) => {
      this.isMobile.set(result.matches);
    });
  }
}
