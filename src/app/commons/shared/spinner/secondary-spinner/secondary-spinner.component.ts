import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-secondary-spinner',
  templateUrl: './secondary-spinner.component.html',
  styleUrl: './secondary-spinner.component.scss',
  standalone: true,
  imports: [MatProgressSpinnerModule],
})
export class SecondarySpinnerComponent {}
