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
  templateUrl: './add-device-dialog.component.html',
  styleUrl: './add-device-dialog.component.scss'
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
