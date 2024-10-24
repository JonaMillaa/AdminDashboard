
import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';

import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { SoporteComponent } from './components/soporte/soporte.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { PublicacionesComponent } from './components/publicaciones/publicaciones.component';
import { MonitoreoComponent } from './components/monitoreo/monitoreo.component';
import { ReportesComponent } from './components/reportes/reportes.component';
import { FacturacionComponent } from './components/facturacion/facturacion.component';
import { NotificacionComponent } from './components/notificacion/notificacion.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent, // Todas las rutas tendrán este layout
    children: [
      { path: 'publicaciones', component: PublicacionesComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'notificacion', component: NotificacionComponent },
      { path: 'monitoreo', component: MonitoreoComponent },
      { path: 'reportes', component: ReportesComponent },
      { path: 'facturacion', component: FacturacionComponent },
      { path: 'soporte', component: SoporteComponent },
      { path: 'calendario', component: CalendarComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];

// Exportar el provider de rutas para main.ts
export const appRouting = [provideRouter(routes)];
