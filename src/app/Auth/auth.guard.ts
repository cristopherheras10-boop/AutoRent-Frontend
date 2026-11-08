import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServicio } from '../Servicios/auth-servicio';

// El panel /app está reservado al administrador. El cliente usa el catálogo único.
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthServicio);
  const router = inject(Router);
  if (!auth.autenticado()) return router.createUrlTree(['/login']);
  if (auth.esUser()) {
    const seccion = state.url.includes('/reservas') ? 'reservas' : state.url.includes('/pagos') ? 'pagos' : null;
    return router.createUrlTree(['/'], seccion ? {queryParams:{seccion}} : {});
  }
  return true;
};
