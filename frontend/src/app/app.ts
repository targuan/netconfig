import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { TaskService } from './core/services/task.service';
import { map, timer, switchMap, shareReplay } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule
  ],
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button (click)="sidenav.toggle()">
        <mat-icon>menu</mat-icon>
      </button>
      <span>NetConfig Manager POC</span>
      <span class="spacer"></span>
      <button mat-icon-button routerLink="/tasks">
        <mat-icon [matBadge]="pendingTasksCount$ | async" matBadgeColor="warn" [matBadgeHidden]="(pendingTasksCount$ | async) === 0">
          assignment
        </mat-icon>
      </button>
    </mat-toolbar>

    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #sidenav mode="side" opened class="sidenav">
        <mat-nav-list>
          <a mat-list-item routerLink="/devices" routerLinkActive="active-link">
            <mat-icon matListItemIcon>router</mat-icon>
            <span matListItemTitle>Devices</span>
          </a>
          <a mat-list-item routerLink="/tasks" routerLinkActive="active-link">
            <mat-icon matListItemIcon>assignment</mat-icon>
            <span matListItemTitle>Tasks</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content>
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: calc(100vh - 64px);
    }
    .sidenav {
      width: 200px;
      background: #fafafa;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .content {
      padding: 20px;
    }
    .active-link {
      background: rgba(0, 0, 0, 0.04);
      color: #3f51b5;
    }
  `]
})
export class AppComponent {
  private taskService = inject(TaskService);

  pendingTasksCount$ = timer(0, 5000).pipe(
    switchMap(() => this.taskService.getTasks()),
    map(tasks => tasks.filter(t => ['pending_approval', 'approved', 'queued', 'running'].includes(t.status)).length),
    shareReplay(1)
  );
}
