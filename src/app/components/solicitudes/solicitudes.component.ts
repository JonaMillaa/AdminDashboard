import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [MatTableModule, MatSelectModule],
  templateUrl: './solicitudes.component.html',
  styleUrl: './solicitudes.component.css'
})
export class SolicitudesComponent {

  solicitudes = [
    { id: 1, nombre: 'Juan Pérez', estado: 'Pendiente' },
    { id: 2, nombre: 'Ana López', estado: 'Aceptada' },
  ];

  cambiarEstado(solicitud: any, nuevoEstado: string) {
    solicitud.estado = nuevoEstado;
  }

}
