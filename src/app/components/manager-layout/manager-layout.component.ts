import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FirebaseService } from '../../firebase/firebase.service';

@Component({
  selector: 'app-manager-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    RouterModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIcon
  ],
  templateUrl: './manager-layout.component.html',
  styleUrl: './manager-layout.component.css'
})
export class ManagerLayoutComponent {
  public activeItem: string = ''; // Variable para almacenar el ítem activo

  constructor(private authService: FirebaseService) {}

  opened = true;
  logout() {
    this.authService.logout();
  }
    ngOnInit(): void {
    // Establecer el elemento activo según la ruta actual
    const currentRoute = window.location.pathname;
    this.activeItem = this.getActiveItemFromRoute(currentRoute);
  }

  setActiveItem(item: string): void {
    this.activeItem = item; // Actualizar el elemento activo
  }

  private getActiveItemFromRoute(route: string): string {
    // Mapear rutas a nombres de elementos activos
    if (route.includes('publicaciones')) return 'publicaciones';
    if (route.includes('monitoreo')) return 'monitoreo';
    if (route.includes('reportes')) return 'reportes';
    if (route.includes('users')) return 'users';
    if (route.includes('usuarios-app')) return 'usuarios-app';
    if (route.includes('facturacion')) return 'facturacion';
    if (route.includes('publicacion-por-estado')) return 'publicacion-por-estado';
    if (route.includes('calendario')) return 'calendario';
    if (route.includes('reportes-users')) return 'reportes-users';
    if (route.includes('calificaciones')) return 'calificaciones';
    if (route.includes('estudiantes')) return 'reportes-users';
    if (route.includes('tutores')) return 'estudiantes';
    if (route.includes('ingresos')) return 'ingresos';
    if (route.includes('soporte-gestion')) return 'soporte-gestion';
    return ''; // Ruta desconocida
  }

}
