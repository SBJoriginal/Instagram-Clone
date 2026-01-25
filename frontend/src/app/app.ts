import { Component, signal } from '@angular/core';
import { Profil } from './profil/profil';

@Component({
  selector: 'app-root',
  imports: [Profil],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('frontend');
}
