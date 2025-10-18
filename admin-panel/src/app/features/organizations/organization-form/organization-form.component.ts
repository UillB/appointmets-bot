import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { OrganizationsService, Organization, CreateOrganizationRequest, UpdateOrganizationRequest } from '../../../core/services/organizations.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

export interface OrganizationFormData {
  isEdit: boolean;
  organization?: Organization;
}

@Component({
  selector: 'app-organization-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe
  ],
  templateUrl: './organization-form.component.html',
  styleUrls: ['./organization-form.component.scss']
})
export class OrganizationFormComponent implements OnInit {
  form: FormGroup;
  isEdit: boolean;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private organizationsService: OrganizationsService,
    private dialogRef: MatDialogRef<OrganizationFormComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: OrganizationFormData
  ) {
    this.isEdit = data.isEdit;
    this.form = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEdit && this.data.organization) {
      this.form.patchValue({
        name: this.data.organization.name,
        avatar: this.data.organization.avatar || ''
      });
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      avatar: ['']
    });
  }

  onSubmit(): void {
    if (this.form.valid && !this.isLoading) {
      this.isLoading = true;
      
      const formData = this.form.value;
      
      if (this.isEdit && this.data.organization) {
        // Update organization
        const updateData: UpdateOrganizationRequest = {
          name: formData.name,
          avatar: formData.avatar || undefined
        };
        
        this.organizationsService.updateOrganization(this.data.organization.id, updateData).subscribe({
          next: () => {
            this.snackBar.open('Organization updated successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Error updating organization:', error);
            this.snackBar.open('Error updating organization', 'Close', { duration: 3000 });
            this.isLoading = false;
          }
        });
      } else {
        // Create organization
        const createData: CreateOrganizationRequest = {
          name: formData.name,
          avatar: formData.avatar || undefined
        };
        
        this.organizationsService.createOrganization(createData).subscribe({
          next: () => {
            this.snackBar.open('Organization created successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Error creating organization:', error);
            this.snackBar.open('Error creating organization', 'Close', { duration: 3000 });
            this.isLoading = false;
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (field?.hasError('minlength')) {
      return `${fieldName} must be at least ${field.errors?.['minlength'].requiredLength} characters`;
    }
    if (field?.hasError('maxlength')) {
      return `${fieldName} must not exceed ${field.errors?.['maxlength'].requiredLength} characters`;
    }
    if (field?.hasError('url')) {
      return 'Please enter a valid URL';
    }
    return '';
  }
}
