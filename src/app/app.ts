import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KanbanBoard } from './pages/kanban-board/kanban-board';
import { PrimarySpinnerService } from './commons/shared/spinner/primary-spinner/primary-spinner.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, KanbanBoard],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  constructor(private primarySpinnerService: PrimarySpinnerService) {}
  isLoading$ = this.primarySpinnerService.isLoading$();
  ngOnInit(): void {}
}
