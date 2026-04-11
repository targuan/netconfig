import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DeviceService } from '../../../core/services/device.service';

@Component({
  selector: 'app-add-device-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule
  ],
  template: `
    <h2 mat-dialog-title>Add New Device</h2>
    <mat-dialog-content>
      <form [formGroup]="deviceForm" class="device-form">
        <mat-form-field appearance="outline">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="Edge-Router-01">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>IP Address</mat-label>
          <input matInput formControlName="ip_address" placeholder="192.168.1.1">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Vendor</mat-label>
          <input matInput formControlName="vendor" placeholder="Arista">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>NAPALM Driver</mat-label>
          <input matInput formControlName="napalm_driver" placeholder="eos">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Username</mat-label>
          <input matInput formControlName="username">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Password</mat-label>
          <input matInput type="password" formControlName="password">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" [disabled]="deviceForm.invalid" (click)="onSubmit()">Add Device</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .device-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 300px;
      padding-top: 10px;
    }
  `]
})
export class AddDeviceDialogComponent {
  private fb = inject(FormBuilder);
  private deviceService = inject(DeviceService);
  private dialogRef = inject(MatDialogRef<AddDeviceDialogComponent>);

  deviceForm = this.fb.group({
    name: ['', Validators.required],
    ip_address: ['', [Validators.required, Validators.pattern(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)]],
    vendor: ['', Validators.required],
    napalm_driver: ['', Validators.required],
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  onSubmit() {
    if (this.deviceForm.valid) {
      this.deviceService.createDevice(this.deviceForm.value as any).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Error creating device', err)
      });
    }
  }
}
