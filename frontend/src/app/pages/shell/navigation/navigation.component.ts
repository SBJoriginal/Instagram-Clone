import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button';
import { LogoComponent } from '../../../shared/ui/logo/logo.component';

@Component({
  selector: 'app-navigation',
  imports: [MatIcon, LogoComponent, MatButtonModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css',
})
export class NavigationComponent {

}
