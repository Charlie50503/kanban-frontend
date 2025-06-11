import { Routes } from '@angular/router';
import { ProjectSelectionComponent } from './pages/project-selection/project-selection.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'projects',
    pathMatch: 'full'
  },
  {
    path: 'projects',
    component: ProjectSelectionComponent
  },
  {
    path: 'kanban/:projectId',
    loadComponent: () => import('./pages/kanban-board/kanban-board').then(c => c.KanbanBoard)
  }
];
