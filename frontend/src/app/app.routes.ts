import { Routes } from '@angular/router';
import { DeviceListComponent } from './features/devices/components/device-list.component';
import { DeviceDetailComponent } from './features/devices/components/device-detail.component';
import { TaskListComponent } from './features/tasks/components/task-list.component';

import { DashboardComponent } from './features/dashboard/components/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'devices', component: DeviceListComponent },
  { path: 'devices/:id', component: DeviceDetailComponent },
  { path: 'tasks', component: TaskListComponent },
];
