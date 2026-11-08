import { CanActivateFn } from '@angular/router';
// Registro y acceso siempre deben poder abrirse para cambiar de cuenta.
export const inicioGuard: CanActivateFn = () => true;
