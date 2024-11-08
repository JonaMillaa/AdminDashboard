// src/app/app-routing.module.ts

import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { ManagerLayoutComponent } from './components/manager-layout/manager-layout.component';
import { AuthGuard } from './guards/auth.guard';

import { DashboardComponent } from './components/manager/dashboard/dashboard.component';
import { UsuariosComponent } from './components/manager/usuarios/usuarios.component';
import { SoporteComponent } from './components/manager/soporte/soporte.component';
import { CalendarComponent } from './components/manager/calendar/calendar.component';
import { PublicacionesComponent } from './components/manager/publicaciones/publicaciones.component';
import { MonitoreoComponent } from './components/manager/monitoreo/monitoreo.component';
import { ReportesComponent } from './components/manager/reportes/reportes.component';
import { FacturacionComponent } from './components/manager/facturacion/facturacion.component';
import { NotificacionComponent } from './components/manager/notificacion/notificacion.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard], // Protegido con AuthGuard
    children: [
      { path: 'soporte', component: SoporteComponent }
    ]
  },

  {
    path: 'manager',
    component: ManagerLayoutComponent,
    canActivate: [AuthGuard], // Protegido con AuthGuard
    children: [
      { path: 'publicaciones', component: PublicacionesComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'monitoreo', component: MonitoreoComponent },
      { path: 'reportes', component: ReportesComponent }, 
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'notificacion', component: NotificacionComponent },
      { path: 'facturacion', component: FacturacionComponent },
      { path: 'calendario', component: CalendarComponent }
      ]
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

export const appRouting = [provideRouter(routes)];
