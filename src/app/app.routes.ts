import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
// Importaciones de componentes
import { LoginComponent } from './components/login/login.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { ManagerLayoutComponent } from './components/manager-layout/manager-layout.component';
import { AuthGuard } from './guards/auth.guard';
import { DashboardComponent } from './components/manager/dashboard/dashboard.component';
import { UsersComponent } from './components/manager/users/users.component';
import { CalendarComponent } from './components/manager/calendar/calendar.component';
import { PublicacionesComponent } from './components/manager/publicaciones/publicaciones.component';
import { MonitoreoComponent } from './components/manager/monitoreo/monitoreo.component';
import { ReportesComponent } from './components/manager/reportes/reportes.component';
import { PublicacionesPorEstadoComponent } from './components/manager/publicaciones-por-estado/publicaciones-por-estado.component';
import { DatosDelDiaComponent } from './components/admin/datos-del-dia/datos-del-dia.component';
import { PruebasComponent } from './components/admin/pruebas/pruebas.component';
import { ReportesDiaComponent } from './components/admin/reportes-dia/reportes-dia.component'; // Importación de ReportesDiaComponent
import { ContadorSesionComponent} from './components/admin/contador-sesion/contador-sesion.component';
import { UsuariosComponent } from './components/admin/usuarios/usuarios.component';
import { PagosPendientesComponent } from './components/admin/pagos-pendientes/pagos-pendientes.component'; // Importación del componente
import { ReportesPublicacionesDiaComponent } from './components/admin/reportes-publicaciones-dia/reportes-publicaciones-dia.component';
import { SoporteComponent } from './components/admin/soporte/soporte.component';
import { IntervencionPagosComponent } from './components/admin/intervencion-pagos/intervencion-pagos.component';
import { ModificarPublicacionComponent } from './components/admin/modificar-publicacion/modificar-publicacion.component';
import { ReportesUsersComponent } from './components/manager/reportes-users/reportes-users.component';
import { UsuariosAppComponent } from './components/manager/usuarios-app/usuarios-app.component';
import { HomeComponent } from './components/home/home.component';
import { IngresosComponent } from './components/manager/ingresos/ingresos.component';
import { SoporteGestionComponent } from './components/manager/soporte-gestion/soporte-gestion.component';
import { EstudiantesComponent } from './components/manager/estudiantes/estudiantes.component';
import { TutoresComponent } from './components/manager/tutores/tutores.component';
import { CalificacionesComponent } from './components/manager/calificaciones/calificaciones.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Ruta inicial para HomeComponent
  { path: 'login', component: LoginComponent },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard], // Protegido con AuthGuard
    children: [

      { path: 'soporte', component:SoporteComponent},

      //{ path: 'soporte', component: SoporteComponent },

      { path: 'datos', component: DatosDelDiaComponent },
      { path: 'pruebas', component: PruebasComponent },
      { path: 'reportes-dia', component: ReportesDiaComponent },// Ruta para reportes del día en admin
      { path: 'contador-sesion', component: ContadorSesionComponent }, // Ruta para contador de inicio de sesión
      {path: 'usuarios', component: UsuariosComponent},

      {path: 'pagos-pendientes', // ruta para el componente de pagos pendientes
      component: PagosPendientesComponent},
      {path: 'reportes-publicaciones-dia' , component: ReportesPublicacionesDiaComponent},
      {
        path: 'intervencion-pagos/:id',
        component: IntervencionPagosComponent // Ruta dinámica para el componente de intervención
      },
      {
        path: 'modificar-publicacion/:id',
        component: ModificarPublicacionComponent,
      },

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
      { path: 'ingresos', component: IngresosComponent },
      { path: 'soporte-gestion', component: SoporteGestionComponent },
      { path: 'estudiantes', component: EstudiantesComponent },
      { path: 'tutores', component: TutoresComponent },
      { path: 'calificaciones', component: CalificacionesComponent },
      { path: 'monitoreo', component: MonitoreoComponent },
      { path: 'reportes', component: ReportesComponent },
      { path: 'users', component: UsersComponent },
      { path: 'usuarios-app', component: UsuariosAppComponent },
      { path: 'publicacion-por-estado', component: PublicacionesPorEstadoComponent },
      { path: 'calendario', component: CalendarComponent },
      { path: 'reportes-users', component: ReportesUsersComponent },
      ]
  },

  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];

export const appRouting = [provideRouter(routes)];
