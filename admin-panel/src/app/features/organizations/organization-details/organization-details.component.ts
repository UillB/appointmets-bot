import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil } from 'rxjs';

import { OrganizationsService, Organization } from '../../../core/services/organizations.service';
import { AuthService } from '../../../core/services/auth';
import { OrganizationFormComponent } from '../organization-form/organization-form.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-organization-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatDividerModule,
    TranslatePipe
  ],
  templateUrl: './organization-details.component.html',
  styleUrls: ['./organization-details.component.scss']
})
export class OrganizationDetailsComponent implements OnInit, OnDestroy {
  organization: Organization | null = null;
  isSuperAdmin = false;
  isLoading = true;
  isNew = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private organizationsService: OrganizationsService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isNew = this.route.snapshot.data['isNew'] || false;
    
    if (this.isNew) {
      this.handleNewOrganization();
    } else {
      this.loadOrganization();
    }

    // Subscribe to super admin status
    this.organizationsService.isSuperAdmin$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isSuperAdmin => {
        this.isSuperAdmin = isSuperAdmin;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private handleNewOrganization(): void {
    if (!this.isSuperAdmin) {
      this.snackBar.open('Only super admins can create organizations', 'Close', { duration: 3000 });
      this.router.navigate(['/organizations']);
      return;
    }

    this.openCreateDialog();
  }

  private loadOrganization(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/organizations']);
      return;
    }

    this.isLoading = true;
    this.organizationsService.getOrganization(+id).subscribe({
      next: (organization) => {
        this.organization = organization;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading organization:', error);
        this.snackBar.open('Error loading organization', 'Close', { duration: 3000 });
        this.router.navigate(['/organizations']);
      }
    });
  }

  onEdit(): void {
    if (!this.organization) return;

    const dialogRef = this.dialog.open(OrganizationFormComponent, {
      width: '500px',
      data: { 
        isEdit: true, 
        organization: this.organization 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadOrganization();
      }
    });
  }

  onDelete(): void {
    if (!this.organization || !this.isSuperAdmin) {
      this.snackBar.open('Only super admins can delete organizations', 'Close', { duration: 3000 });
      return;
    }

    if (confirm(`Are you sure you want to delete "${this.organization.name}"? This action cannot be undone.`)) {
      this.organizationsService.deleteOrganization(this.organization.id).subscribe({
        next: () => {
          this.snackBar.open('Organization deleted successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/organizations']);
        },
        error: (error) => {
          console.error('Error deleting organization:', error);
          this.snackBar.open('Error deleting organization', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/organizations']);
  }

  private openCreateDialog(): void {
    const dialogRef = this.dialog.open(OrganizationFormComponent, {
      width: '500px',
      data: { isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['/organizations']);
      } else {
        this.router.navigate(['/organizations']);
      }
    });
  }

  getAvatarUrl(organization: Organization): string {
    if (organization.avatar) {
      return organization.avatar;
    }
    // Generate placeholder avatar
    const initials = organization.name.split(' ').map(word => word[0]).join('').toUpperCase();
    return `https://via.placeholder.com/120x120/667eea/ffffff?text=${initials}`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getUserRoleBadgeClass(role: string): string {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'role-super-admin';
      case 'OWNER':
        return 'role-owner';
      case 'MANAGER':
        return 'role-manager';
      default:
        return 'role-default';
    }
  }
}
