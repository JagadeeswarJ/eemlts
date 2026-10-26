import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CurrentUser, Role } from '../models/auth.models';

export const roleGuard = (allowedRoles: Role[]): CanActivateFn => {
  return (route, state) => {
    const router = inject(Router);

    if (typeof window !== 'undefined') {
      const userProfileJson = localStorage.getItem('emp_user_profile');
      if (userProfileJson) {
        try {
          const user: CurrentUser = JSON.parse(userProfileJson);
          if (allowedRoles.includes(user.role)) {
            return true;
          }
        } catch {
          // ignore parsing error
        }
      }
    }

    router.navigate(['/unauthorized']);
    return false;
  };
};
