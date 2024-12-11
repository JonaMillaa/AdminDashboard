import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
// Importaciones de componentes
import { LoginComponent } from './components/login/login.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { AuthGuard } from './guards/auth.guard';
import { PublicacionesComponent } from './components/admin/publicaciones/publicaciones.component';
import { ReportesComponent } from './components/admin/reportes/reportes.component';
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
import { HomeComponent } from './components/home/home.component';
import { CostosIngresosComponent } from './components/admin/costos-ingresos/costos-ingresos.component';
export const routes: Routes = [
  { path: '', component: HomeComponent }, // Ruta inicial para HomeComponent
  { path: 'login', component: LoginComponent },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard], // Protegido con AuthGuard
    children: [
      { path: 'soporte', component:SoporteComponent},
      { path: 'datos', component: DatosDelDiaComponent },
      { path: 'pruebas', component: PruebasComponent },
      { path: 'reportes-dia', component: ReportesDiaComponent },// Ruta para reportes del día en admin
      { path: 'contador-sesion', component: ContadorSesionComponent }, // Ruta para contador de inicio de sesión
      { path: 'usuarios', component: UsuariosComponent},
      { path: 'pagos-pendientes',component: PagosPendientesComponent},
      { path: 'reportes-publicaciones-dia' , component: ReportesPublicacionesDiaComponent},
      { path: 'intervencion-pagos/:id',component: IntervencionPagosComponent },
      { path: 'modificar-publicacion/:id',component: ModificarPublicacionComponent,},
      { path: 'pagos-pendientes', component: PagosPendientesComponent},
      { path: 'reportes-publicaciones-dia' , component: ReportesPublicacionesDiaComponent},
      { path: 'reportes', component: ReportesComponent },
      { path: 'publicaciones', component: PublicacionesComponent }, 
      { path: 'costos-ingresos', component: CostosIngresosComponent }, 

    ]
  },

  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];

export const appRouting = [provideRouter(routes)];
