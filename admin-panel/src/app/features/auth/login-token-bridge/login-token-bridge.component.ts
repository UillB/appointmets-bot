import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login-token-bridge',
  template: ''
})
export class LoginTokenBridgeComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    this.route.queryParamMap.subscribe(params => {
      const token = params.get('token');
      if (token) {
        // Bridge: store access token and continue to dashboard
        localStorage.setItem('access_token', token);
        // refresh token is unknown here; keep flow simple
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }
}


