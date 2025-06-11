import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

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
    MatInputModule
  ],
  template: `
    <div class="project-selection-container">
      <header class="bg-white border-b border-gray-200 px-4 py-4">
        <h1 class="text-2xl font-semibold text-gray-900 mb-4">專案列表</h1>

        <div class="flex items-center gap-4 mb-4">
          <div class="search-bar flex-1 max-w-md">
            <mat-form-field class="w-full">
              <mat-icon matPrefix class="text-gray-400 mr-2">search</mat-icon>
              <input matInput placeholder="搜尋專案..." (keyup)="filterProjects($event)">
            </mat-form-field>
          </div>

          <button mat-flat-button color="primary" class="create-project-btn" (click)="createNewProject()">
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
          <div *ngFor="let project of filteredProjects"
               class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
               (click)="selectProject(project)">
            <div class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ project.name }}</h3>
              <p class="text-gray-600 mb-4">{{ project.description }}</p>
              <div class="flex items-center justify-between text-sm text-gray-400">
                <span class="flex items-center">
                  <mat-icon class="text-base mr-1">schedule</mat-icon>
                  最後更新：{{ project.lastModified | date:'yyyy/MM/dd HH:mm' }}
                </span>
                <button mat-icon-button color="primary" class="hover:bg-blue-50">
                  <mat-icon>launch</mat-icon>
                </button>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
               (click)="createNewProject()">
            <div class="p-6 flex flex-col items-center justify-center h-full">
              <mat-icon class="text-xl text-gray-400 mb-2">add_circle_outline</mat-icon>
              <h3 class="text-lg font-medium text-gray-600">建立新專案</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
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
      background-color: #10B981 !important;
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
  `]
})
export class ProjectSelectionComponent implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    // 這裡應該從服務獲取專案列表
    this.projects = this.getMockProjects();
    this.filteredProjects = [...this.projects];
  }

  filterProjects(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredProjects = this.projects.filter(project =>
      project.name.toLowerCase().includes(searchTerm) ||
      project.description.toLowerCase().includes(searchTerm)
    );
  }

  selectProject(project: Project) {
    this.router.navigate(['/kanban', project.id]);
  }

  createNewProject() {
    // 實作建立新專案的邏輯
  }

  private getMockProjects(): Project[] {
    return [
      {
        id: '1',
        name: '行銷活動管理',
        description: '2024年第一季行銷活動規劃與執行追蹤',
        lastModified: new Date('2024-01-15')
      },
      {
        id: '2',
        name: '產品開發專案',
        description: '新一代產品功能開發與測試',
        lastModified: new Date('2024-01-14')
      },
      {
        id: '3',
        name: '客戶服務優化',
        description: '提升客戶服務品質與回應速度',
        lastModified: new Date('2024-01-13')
      }
    ];
  }
}
