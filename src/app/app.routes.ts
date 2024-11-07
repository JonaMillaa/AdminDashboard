
import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';

import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/manager/dashboard/dashboard.component';
import { UsuariosComponent } from './components/manager/usuarios/usuarios.component';
import { SoporteComponent } from './components/manager/soporte/soporte.component';
import { CalendarComponent } from './components/manager/calendar/calendar.component';
import { PublicacionesComponent } from './components/manager/publicaciones/publicaciones.component';
import { MonitoreoComponent } from './components/manager/monitoreo/monitoreo.component';
import { ReportesComponent } from './components/manager/reportes/reportes.component';
import { FacturacionComponent } from './components/manager/facturacion/facturacion.component';
import { NotificacionComponent } from './components/manager/notificacion/notificacion.component';

import { AdminLayoutComponent } from '../app/components/admin-layout/admin-layout.component';
import { ManagerLayoutComponent } from '../app/components/manager-layout/manager-layout.component';
import { LoginComponent } from './components/login/login.component';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent, // Todas las rutas tendrán este layout
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'admin-layout', component: AdminLayoutComponent, canActivate: [RoleGuard] },
      { path: 'manager-layout', component: ManagerLayoutComponent, canActivate: [RoleGuard] },
      { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirige a /login por defecto
      { path: '**', redirectTo: 'login' }, // Redirige cualquier otra ruta a /login
      { path: 'publicaciones', component: PublicacionesComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'notificacion', component: NotificacionComponent },
      { path: 'monitoreo', component: MonitoreoComponent },
      { path: 'reportes', component: ReportesComponent },
      { path: 'facturacion', component: FacturacionComponent },
      { path: 'soporte', component: SoporteComponent },
      { path: 'calendario', component: CalendarComponent },
      // { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      // { path: '**', redirectTo: 'dashboard' }
    ]
  }
];

// Exportar el provider de rutas para main.ts
export const appRouting = [provideRouter(routes)];
