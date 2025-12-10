import { inject } from '@angular/core';
import { Router, CanActivateFn, CanActivateChildFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  }

  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  router.navigate(['/'], { queryParams: { error: 'admin_required' } });
  return false;
};

export const adminChildGuard: CanActivateChildFn = (route, state) => {
  return adminGuard(route, state);
};

export const userGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && !authService.isAdmin()) {
    return true;
  }

  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  router.navigate(['/admin'], { queryParams: { error: 'user_only_route' } });
  return false;
};

export const userChildGuard: CanActivateChildFn = (route, state) => {
  return userGuard(route, state);
};
