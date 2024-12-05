import { FirebaseService } from './../../../firebase/firebase.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import e from 'express';

@Component({
  selector: 'app-publicaciones-por-estado',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    TimelineModule, 
    CardModule, 
    ButtonModule,
    DropdownModule
  ],
  templateUrl: './publicaciones-por-estado.component.html',
  styleUrls: ['./publicaciones-por-estado.component.css']
})
export class PublicacionesPorEstadoComponent implements OnInit {

  estados: string[] = [
    'ACEPTADO', 
    'REALIZADA', 
    'RECHAZADO'
  ];

  estadoSeleccionado: { name: string; value: string } | null = null; 
  publicaciones: any[] = []; // Publicaciones desde Firebase
  events: any[] = []; // Datos para la línea de tiempo
  estadosDropdown: any[] = []; // Opciones para el dropdown

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    // Inicializa las opciones del dropdown
    this.estadosDropdown = this.estados.map((estado) => ({ name: estado, value: estado }));
    this.cargarPublicaciones(null);
  }

  cargarPublicaciones(estado: string | null): void {

    if (!estado) {
      this.events = []; // Limpia el timeline si no hay selección
      return;
    }
  
    this.firebaseService.getPostulacionesConPublicaciones(estado).subscribe((data) => {
      this.publicaciones = data;
      this.events = this.publicaciones.map((postulacion) => ({
        status: `${postulacion.infoUsuario?.Nombre || 'N/A'} ${postulacion.infoUsuario?.Apellido || 'N/A'}`,
        date: postulacion.fecha_ayudantia,
        description: postulacion.descripcion,
        estado: postulacion.estado_postulacion,
        titulo: postulacion.titulo || 'N/A',
        color: this.getColorForEstadoPostulacion(postulacion.estado_postulacion),
        icon: this.getIconForEstadoPostulacion(postulacion.estado_postulacion),
      }));
    });
  }

  onEstadoChange(): void {
    const estado = this.estadoSeleccionado?.value || null; // Obtiene el valor o null
    this.cargarPublicaciones(estado);
  }
  
  
  
  getColorForEstadoPostulacion(estado: string): string {
    switch (estado) {
      case 'ACEPTADO': return '#66BB6A'; // Verde claro
      case 'REALIZADA': return '#29B6F6'; // Azul claro
      case 'RECHAZADO': return '#EF5350'; // Rojo
      default: return '#BDBDBD'; // Gris para estados desconocidos
    }
  }

  getIconForEstadoPostulacion(estado: string): string {
    switch (estado) {
      case 'ACEPTADO': return 'pi pi-check'; // Ícono de aprobado
      case 'REALIZADA': return 'pi pi-thumbs-up-fill'; // Ícono de calendario completado
      case 'RECHAZADO': return 'pi pi-times'; // Ícono de rechazo
      default: return 'pi pi-circle'; // Ícono por defecto
    }
  }

}
