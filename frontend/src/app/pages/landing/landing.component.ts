import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { LogoComponent } from '../../shared/ui/logo/logo.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [MatButtonModule, LogoComponent, RouterLink, NgOptimizedImage],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
  private readonly router = inject(Router);

  protected onGoogleSignIn(): void {
    this.router.navigate(['/home']);
  }
}
