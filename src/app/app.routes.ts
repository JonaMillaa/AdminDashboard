import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';

// Importaciones de componentes
import { LoginComponent } from './components/login/login.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { ManagerLayoutComponent } from './components/manager-layout/manager-layout.component';
import { AuthGuard } from './guards/auth.guard';
import { DashboardComponent } from './components/manager/dashboard/dashboard.component';
import { UsersComponent } from './components/manager/users/users.component';
//import { SoporteComponent } from './components/manager/soporte/soporte.component';
import { CalendarComponent } from './components/manager/calendar/calendar.component';
import { PublicacionesComponent } from './components/manager/publicaciones/publicaciones.component';
import { MonitoreoComponent } from './components/manager/monitoreo/monitoreo.component';
import { ReportesComponent } from './components/manager/reportes/reportes.component';
import { FacturacionComponent } from './components/manager/facturacion/facturacion.component';
import { PublicacionesPorEstadoComponent } from './components/manager/publicaciones-por-estado/publicaciones-por-estado.component';
import { DatosDelDiaComponent } from './components/admin/datos-del-dia/datos-del-dia.component';
import { PruebasComponent } from './components/admin/pruebas/pruebas.component';
import { ReportesDiaComponent } from './components/admin/reportes-dia/reportes-dia.component'; // Importación de ReportesDiaComponent
import { ContadorSesionComponent} from './components/admin/contador-sesion/contador-sesion.component';
import { UsuariosComponent } from './components/admin/usuarios/usuarios.component';
import { PagosPendientesComponent } from './components/admin/pagos-pendientes/pagos-pendientes.component'; // Importación del componente
import { ReportesPublicacionesDiaComponent } from './components/admin/reportes-publicaciones-dia/reportes-publicaciones-dia.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard], // Protegido con AuthGuard
    children: [
    
      //{ path: 'soporte', component: SoporteComponent },
      { path: 'datos', component: DatosDelDiaComponent },
      { path: 'pruebas', component: PruebasComponent },
      { path: 'reportes-dia', component: ReportesDiaComponent },// Ruta para reportes del día en admin
      { path: 'contador-sesion', component: ContadorSesionComponent }, // Ruta para contador de inicio de sesión
      {path: 'usuarios', component: UsuariosComponent},
      {path: 'pagos-pendientes', component: PagosPendientesComponent},
      {path: 'reportes-publicaciones-dia' , component: ReportesPublicacionesDiaComponent}
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
      { path: 'users', component: UsersComponent },
      { path: 'publicacion-por-estado', component: PublicacionesPorEstadoComponent },
      { path: 'facturacion', component: FacturacionComponent },
      { path: 'calendario', component: CalendarComponent }
      ]
  },
   
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

export const appRouting = [provideRouter(routes)];
