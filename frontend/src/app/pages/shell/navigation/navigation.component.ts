import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LogoComponent } from '../../../shared/ui/logo/logo.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navigation',
  imports: [MatIconModule, LogoComponent, MatButtonModule, RouterLink],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css',
})
export class NavigationComponent {}
