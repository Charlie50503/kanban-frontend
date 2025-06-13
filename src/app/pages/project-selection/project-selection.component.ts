import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ProjectService } from 'src/app/api/v1/services';
import { MatDialog } from '@angular/material/dialog';
import { NewProjectDialog } from '../kanban-board/components/new-project-dialog/new-project-dialog';
import { filter } from 'rxjs';

interface Project {
  id: string;
  name: string;
  description: string;
  lastModified: Date;
}

@Component({
  selector: 'app-project-selection',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <div class="project-selection-container">
      <header class="bg-white border-b border-gray-200 px-4 py-4">
        <h1 class="text-2xl font-semibold text-gray-900 mb-4">專案列表</h1>

        <div class="flex items-center gap-4 mb-4">
          <div class="search-bar flex-1 max-w-md">
            <mat-form-field class="w-full">
              <mat-icon matPrefix class="text-gray-400 mr-2">search</mat-icon>
              <input
                matInput
                placeholder="搜尋專案..."
                (keyup)="filterProjects($event)"
              />
            </mat-form-field>
          </div>

          <button
            mat-flat-button
            color="primary"
            class="create-project-btn"
            (click)="openNewProjectDialog()"
          >
            <mat-icon>add</mat-icon>
            建立新專案
          </button>
        </div>

        <div class="text-sm text-gray-500">
          共 {{ filteredProjects.length }} 個專案
        </div>
      </header>

      <div class="p-4 bg-gray-50 min-h-[calc(100vh-140px)]">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            *ngFor="let project of projectsSignal()"
            class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
            (click)="selectProject(project)"
          >
            <div class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-2">
                {{ project.name }}
              </h3>
              <p class="text-gray-600 mb-4">{{ project.description }}</p>
              <div
                class="flex items-center justify-between text-sm text-gray-400"
              >
                <span class="flex items-center">
                  <mat-icon class="text-base mr-1">schedule</mat-icon>
                  最後更新：{{
                    project.lastModified | date: 'yyyy/MM/dd HH:mm'
                  }}
                </span>
                <button
                  mat-icon-button
                  color="primary"
                  class="hover:bg-blue-50"
                >
                  <mat-icon>launch</mat-icon>
                </button>
              </div>
            </div>
          </div>

          <div
            class="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
            (click)="openNewProjectDialog()"
          >
            <div class="p-6 flex flex-col items-center justify-center h-full">
              <mat-icon class="text-xl text-gray-400 mb-2"
                >add_circle_outline</mat-icon
              >
              <h3 class="text-lg font-medium text-gray-600">建立新專案</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
        background-color: #f3f4f6;
      }

      .project-selection-container {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .create-project-btn {
        background-color: #10b981 !important;
        color: white !important;
      }

      .create-project-btn:hover {
        background-color: #059669 !important;
      }

      ::ng-deep {
        .mat-mdc-form-field {
          width: 100%;
        }

        .mat-mdc-form-field-flex {
          background-color: white !important;
          border-radius: 0.5rem !important;
        }

        .mat-mdc-text-field-wrapper {
          background-color: white !important;
          border-radius: 0.5rem !important;
        }

        .mat-mdc-form-field-underline {
          display: none;
        }
      }
    `,
  ],
})
export class ProjectSelectionComponent implements OnInit {
  projectsSignal = signal<Project[]>([]);
  filteredProjects: Project[] = [];

  constructor(
    private router: Router,
    private projectService: ProjectService,
    private dialog: MatDialog,
  ) {
    this.queryProjects()
  }

  ngOnInit() {
    // 這裡應該從服務獲取專案列表
    this.filteredProjects = [...this.projectsSignal()];
  }

  filterProjects(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredProjects = this.projectsSignal().filter(
      (project) =>
        project.name.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm),
    );
  }

  selectProject(project: Project) {
    this.router.navigate(['/kanban', project.id]);
  }


  private queryProjects() {
    this.projectService.apiProjectsGet$Json().subscribe({
      next: (res) => {
        this.projectsSignal.set(res as Project[]);
      },
      error: (error: any) => {
        alert(error);
      },
    });
  }

  /** 專案管理 - 顯示新增專案表單 */
  protected openNewProjectDialog() {
    this.dialog
      .open(NewProjectDialog)
      .afterClosed()
      .pipe(filter((res) => !!res))
      .subscribe(() => {
        this.queryProjects();
      });
  }
}
