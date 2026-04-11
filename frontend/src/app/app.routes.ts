import { Routes } from '@angular/router';
import { DeviceListComponent } from './features/devices/components/device-list.component';
import { DeviceDetailComponent } from './features/devices/components/device-detail.component';
import { TaskListComponent } from './features/tasks/components/task-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'devices', pathMatch: 'full' },
  { path: 'devices', component: DeviceListComponent },
  { path: 'devices/:id', component: DeviceDetailComponent },
  { path: 'tasks', component: TaskListComponent },
];
