import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  // 把當前網址當作 query param 帶去 login
  return router.createUrlTree(['/login'], {
    queryParams: { redirectTo: state.url }
  });
};
