import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const publicAuthGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('emp_access_token');
    const userProfile = localStorage.getItem('emp_user_profile');

    if (token && userProfile) {
      router.navigate(['/dashboard']);
      return false;
    }
  }

  return true;
};
