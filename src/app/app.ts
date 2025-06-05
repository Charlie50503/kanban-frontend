import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KanbanBoard } from './pages/kanban-board/kanban-board';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,KanbanBoard],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'kanban-project';
}
