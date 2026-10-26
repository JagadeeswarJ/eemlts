import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const token = typeof window !== 'undefined' ? localStorage.getItem('emp_access_token') : null;

  let headers = req.headers;
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  const modifiedReq = req.clone({
    headers,
    withCredentials: true,
  });

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 1. Handle HTTP 401 Unauthorized (Expired or Invalid Session)
      if (error.status === 401) {
        // Do not redirect if already on sign-in or performing login/forgot-password
        const isAuthRequest =
          req.url.includes('/api/v1/auth/login') || req.url.includes('/api/v1/auth/forgot-password');
        if (!isAuthRequest) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('emp_access_token');
            localStorage.removeItem('emp_user_profile');
          }

          const currentUrl = router.url;
          if (!currentUrl.includes('/sign-in')) {
            const isSafeInternal = currentUrl.startsWith('/') && !currentUrl.startsWith('//');
            const returnUrl = isSafeInternal ? currentUrl : '/dashboard';
            router.navigate(['/sign-in'], { queryParams: { returnUrl } });
          }
        }
        return throwError(() => error);
      }

      // 2. Handle HTTP 403 Forbidden (Insufficient Privileges)
      // Per architectural standards, 403 does NOT destroy the valid user session.
      // Individual API 403 responses are handled by the corresponding feature effect/service
      // and do NOT globally force-redirect the application away from the current page.
      if (error.status === 403) {
        return throwError(() => error);
      }

      // 3. Handle HTTP 504 Gateway Timeout (or 502/503 Service Unavailable)
      // Per architectural standards, 504 does NOT invalidate session or redirect to /unauthorized or /sign-in.
      // We sanitize and attach a user-friendly message for presentation by feature effects:
      // "Some dashboard information is temporarily unavailable. Please try again."
      if (error.status === 504 || error.status === 502 || error.status === 503) {
        const sanitizedError = new HttpErrorResponse({
          error: {
            message: 'Some dashboard information is temporarily unavailable. Please try again.',
            success: false,
            status: error.status,
          },
          status: error.status,
          statusText: error.statusText,
          url: error.url ?? undefined,
          headers: error.headers,
        });
        return throwError(() => sanitizedError);
      }

      return throwError(() => error);
    })
  );
};
