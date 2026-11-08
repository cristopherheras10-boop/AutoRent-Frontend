import { Routes } from '@angular/router';
import { authGuard } from './Auth/auth.guard';
import { adminGuard } from './Auth/rol.guard';
import { inicioGuard } from './Auth/inicio.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./Paginas/publicas/inicio/inicio').then(m => m.Inicio) },
  { path: 'login', canActivate: [inicioGuard], loadComponent: () => import('./Paginas/publicas/login/login').then(m => m.Login) },
  { path: 'registro', canActivate: [inicioGuard], loadComponent: () => import('./Paginas/publicas/registro/registro').then(m => m.Registro) },
  { path: 'verificar', canActivate: [inicioGuard], loadComponent: () => import('./Paginas/publicas/verificar/verificar').then(m => m.Verificar) },
  {
    path: 'app', canActivate: [authGuard],
    loadComponent: () => import('./Paginas/privadas/layout/layout').then(m => m.Layout),
    children: [
      { path: 'dashboard', loadComponent: () => import('./Paginas/privadas/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'categorias', canActivate: [adminGuard], loadComponent: () => import('./Paginas/privadas/categorias/categorias').then(m => m.Categorias) },
      { path: 'vehiculos', loadComponent: () => import('./Paginas/privadas/vehiculos/vehiculos').then(m => m.Vehiculos) },
      { path: 'reservas', loadComponent: () => import('./Paginas/privadas/reservas/reservas').then(m => m.Reservas) },
      { path: 'pagos', loadComponent: () => import('./Paginas/privadas/pagos/pagos').then(m => m.Pagos) },
      { path: 'mantenimientos', canActivate: [adminGuard], loadComponent: () => import('./Paginas/privadas/mantenimientos/mantenimientos').then(m => m.Mantenimientos) },
      { path: 'usuarios', canActivate: [adminGuard], loadComponent: () => import('./Paginas/privadas/usuarios/usuarios').then(m => m.Usuarios) },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: '' }
];
