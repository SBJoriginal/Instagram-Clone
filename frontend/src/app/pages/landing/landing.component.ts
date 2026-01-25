import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [MatButtonModule],
    templateUrl: './landing.component.html',
    styleUrl: './landing.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent { }
