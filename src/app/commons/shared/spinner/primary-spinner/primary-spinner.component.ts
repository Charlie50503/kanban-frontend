import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
} from '@angular/core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CommonModule } from '@angular/common';
import { PrimarySpinnerService } from './primary-spinner.service';
import { toSignal } from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-primary-spinner',
  templateUrl: './primary-spinner.component.html',
  styles: [],
  standalone: true,
  imports: [NgxSpinnerModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PrimarySpinnerComponent {
  constructor(private primarySpinnerService: PrimarySpinnerService) {}

  options = toSignal(this.primarySpinnerService.options$(), {
    initialValue: this.primarySpinnerService.getDefaultOptions(),
  });
}
