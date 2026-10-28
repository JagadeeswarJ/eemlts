import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('emp_access_token');
    if (token) {
      return true;
    }
  }

  router.navigate(['/sign-in'], { queryParams: { returnUrl: state.url } });
  return false;
};
