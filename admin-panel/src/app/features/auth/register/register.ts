import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService, RegisterRequest } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      organizationName: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    console.log('RegisterComponent: Form submitted, valid:', this.registerForm.valid);
    console.log('RegisterComponent: Form value:', this.registerForm.value);
    
    if (this.registerForm.valid) {
      this.isLoading = true;
      const { confirmPassword, ...userData } = this.registerForm.value;
      const registerData: RegisterRequest = userData;
      
      console.log('RegisterComponent: Sending registration data:', registerData);

      this.authService.register(registerData).subscribe({
        next: (response) => {
          console.log('RegisterComponent: Registration successful, response:', response);
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
          this.snackBar.open('Регистрация успешна!', 'Закрыть', {
            duration: 3000
          });
        },
        error: (error) => {
          console.error('RegisterComponent: Registration error:', error);
          this.isLoading = false;
          this.snackBar.open(
            error.error?.error || error.message || 'Ошибка регистрации',
            'Закрыть',
            { duration: 5000 }
          );
        }
      });
    } else {
      console.log('RegisterComponent: Form is invalid, errors:', this.registerForm.errors);
    }
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
