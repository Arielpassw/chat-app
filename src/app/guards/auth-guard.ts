import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);

  try {
    const sesion = await auth.obtenerSesion();

    if (sesion) {
      return true;
    }

    return router.createUrlTree(['/login']);
  } catch (error) {
    console.error('Error verificando la sesión:', error);
    return router.createUrlTree(['/login']);
  }
};