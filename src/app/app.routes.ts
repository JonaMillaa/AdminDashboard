
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

export const routes: Routes = [
  // Ruta de login sin LayoutComponent
 
  // Rutas protegidas con layout
  {
    path: '',
    component: LayoutComponent,
       children: [
      { path: 'admin-layout', component: AdminLayoutComponent },
      { path: 'manager-layout', component: ManagerLayoutComponent },
      { path: 'publicaciones', component: PublicacionesComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'notificacion', component: NotificacionComponent },
      { path: 'monitoreo', component: MonitoreoComponent },
      { path: 'reportes', component: ReportesComponent },
      { path: 'facturacion', component: FacturacionComponent },
      { path: 'soporte', component: SoporteComponent },
      { path: 'calendario', component: CalendarComponent }
    ]
  },

  // Redirección para rutas no encontradas
  { path: '**', redirectTo: 'login' }
];