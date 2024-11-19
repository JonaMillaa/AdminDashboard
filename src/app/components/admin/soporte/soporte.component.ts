import { Component, OnInit } from '@angular/core';
import { SoporteService } from '../../../firebase/soporte.service';
import { Usuario } from '../../../models/usuario.model';
import { Reportes } from '../../../models/reportes';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-soporte',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './soporte.component.html',
  styleUrl: './soporte.component.css'
})
export class SoporteComponent implements OnInit {
  reportes: Reportes[] = [];
  reporteSeleccionado: Reportes | null = null;
  usuarioReporte: Usuario | null = null; // Nuevo: para almacenar datos del usuario asociado
  respuesta: string = '';
  nuevoEstado: string = '';
  filtroEstado: string = 'Todos';
  filteredReportes: Reportes[] = [];

  constructor(private soporteService: SoporteService ) {}

  ngOnInit(): void {
    this.obtenerReportes();
  }

  // Obtener todos los reportes
  obtenerReportes(): void {
    this.soporteService.getReportes().subscribe((reportes) => {
      this.reportes = reportes;
      this.filteredReportes = reportes;
    });
  }

  // Ver detalles de un reporte y obtener el usuario asociado
  verDetalleReporte(reporte: Reportes): void {
    this.reporteSeleccionado = reporte;
    this.nuevoEstado = reporte.estado; // Inicializamos con el estado actual

    // Obtener la informaciÃ³n del usuario usando el ID del reporte
    this.soporteService.getUsuarioPorID(reporte.id_usuario).subscribe((usuario) => {
      if (usuario) {
        this.usuarioReporte = usuario;
      }
    });
  }

  // Filtrar reportes por estado
  aplicarFiltro(): void {
    if (this.filtroEstado === 'Todos') {
      this.filteredReportes = this.reportes;
    } else {
      this.filteredReportes = this.reportes.filter(
        (reporte) => reporte.estado === this.filtroEstado
      );
    }
  }

  // Responder y actualizar el estado del reporte
  responderReporte(): void {
    if (this.reporteSeleccionado) {
      const nuevaRespuesta = {
        reporte_id: this.reporteSeleccionado.id,
        respuesta: this.respuesta,
        estado_actualizado: this.nuevoEstado,
        fecha_respuesta: new Date().toISOString(),
      };

      this.soporteService.guardarRespuesta(nuevaRespuesta).then(() => {
        this.soporteService
          .actualizarEstadoReporte(this.reporteSeleccionado!.id, this.nuevoEstado)
          .then(() => {
            this.respuesta = '';
            this.reporteSeleccionado = null;
            this.usuarioReporte = null; // Resetear el usuario asociado
            this.obtenerReportes(); // Actualizar la lista de reportes
          });
      });
    }
  }
}

