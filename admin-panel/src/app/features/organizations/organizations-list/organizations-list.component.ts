import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';

import { OrganizationsService, Organization } from '../../../core/services/organizations.service';
import { AuthService } from '../../../core/services/auth';
import { OrganizationFormComponent } from '../organization-form/organization-form.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-organizations-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe
  ],
  templateUrl: './organizations-list.component.html',
  styleUrls: ['./organizations-list.component.scss']
})
export class OrganizationsListComponent implements OnInit, OnDestroy {
  organizations: Organization[] = [];
  isSuperAdmin = false;
  isLoading = true;
  displayedColumns: string[] = ['avatar', 'name', 'users', 'services', 'createdAt', 'actions'];
  
  private destroy$ = new Subject<void>();

  constructor(
    private organizationsService: OrganizationsService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadOrganizations();
    
    // Subscribe to organizations changes
    this.organizationsService.organizations$
      .pipe(takeUntil(this.destroy$))
      .subscribe(organizations => {
        this.organizations = organizations;
      });

    // Subscribe to super admin status
    this.organizationsService.isSuperAdmin$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isSuperAdmin => {
        this.isSuperAdmin = isSuperAdmin;
        // Update displayed columns based on permissions
        if (!isSuperAdmin) {
          this.displayedColumns = ['avatar', 'name', 'users', 'services', 'actions'];
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrganizations(): void {
    this.isLoading = true;
    this.organizationsService.getOrganizations().subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading organizations:', error);
        this.snackBar.open('Error loading organizations', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onCreateOrganization(): void {
    if (!this.isSuperAdmin) {
      this.snackBar.open('Only super admins can create organizations', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(OrganizationFormComponent, {
      width: '500px',
      data: { isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadOrganizations();
      }
    });
  }

  onEditOrganization(organization: Organization): void {
    const dialogRef = this.dialog.open(OrganizationFormComponent, {
      width: '500px',
      data: { 
        isEdit: true, 
        organization 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadOrganizations();
      }
    });
  }

  onViewOrganization(organization: Organization): void {
    this.router.navigate(['/organizations', organization.id]);
  }

  onDeleteOrganization(organization: Organization): void {
    if (!this.isSuperAdmin) {
      this.snackBar.open('Only super admins can delete organizations', 'Close', { duration: 3000 });
      return;
    }

    if (confirm(`Are you sure you want to delete "${organization.name}"? This action cannot be undone.`)) {
      this.organizationsService.deleteOrganization(organization.id).subscribe({
        next: () => {
          this.snackBar.open('Organization deleted successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting organization:', error);
          this.snackBar.open('Error deleting organization', 'Close', { duration: 3000 });
        }
      });
    }
  }

  getAvatarUrl(organization: Organization): string {
    if (organization.avatar) {
      return organization.avatar;
    }
    // Generate placeholder avatar
    const initials = organization.name.split(' ').map(word => word[0]).join('').toUpperCase();
    return `https://via.placeholder.com/40x40/667eea/ffffff?text=${initials}`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
