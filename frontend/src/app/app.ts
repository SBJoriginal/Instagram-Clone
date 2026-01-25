import { Component, inject } from '@angular/core';
import { ChildrenOutletContexts, RouterOutlet } from '@angular/router';
import { routeTransition } from './app.animations';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  animations: [routeTransition],
})
export class App {
  private readonly contexts = inject(ChildrenOutletContexts);

  protected getRouteAnimationData(): string {
    return (
      this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'] ??
      this.contexts.getContext('primary')?.route?.snapshot?.url
    );
  }
}
