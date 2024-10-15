import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';

import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { AyudantiasComponent } from './components/ayudantias/ayudantias.component';
import { SolicitudesComponent } from './components/solicitudes/solicitudes.component';
import { EstadisticasComponent } from './components/estadisticas/estadisticas.component';
import { SoporteComponent } from './components/soporte/soporte.component';
import { CalendarComponent } from './components/calendar/calendar.component';


export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent, // Todas las rutas tendrán este layout
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'ayudantias', component: AyudantiasComponent },
      { path: 'solicitudes', component: SolicitudesComponent },
      { path: 'estadisticas', component: EstadisticasComponent },
      { path: 'soporte', component: SoporteComponent },
      { path: 'calendario', component: CalendarComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];

// Exportar el provider de rutas para main.ts
export const appRouting = [provideRouter(routes)];
