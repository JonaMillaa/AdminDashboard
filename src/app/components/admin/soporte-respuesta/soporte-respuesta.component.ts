import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Usuario } from '../../../models/usuario.model';
import { Reportes } from '../../../models/reportes';
import { RespuestaReporte } from '../../../models/respuesta-reporte';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { SoporteService } from '../../../firebase/soporte.service';

@Component({
  selector: 'app-soporte-respuesta',
  templateUrl: './soporte-respuesta.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule, // Asegúrate de incluir FormsModule aquí
  ],
  styleUrls: ['./soporte-respuesta.component.css'],
})
export class SoporteRespuestaComponent implements OnInit {
  respuesta: string = '';
  nuevoEstado: string;
  respuestas: RespuestaReporte[] = []; // Lista de respuestas del reporte.
  cargandoRespuestas = true; // Spinner para cargar respuestas.

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { reporte: Reportes; usuario: Usuario | null },
    private dialogRef: MatDialogRef<SoporteRespuestaComponent>,
    private soporteService: SoporteService
  ) {
    this.nuevoEstado = this.data.reporte.estado;
  }

  ngOnInit(): void {
    // Cargar respuestas del reporte.
    this.soporteService.getRespuestasPorReporte(this.data.reporte.id).subscribe({
      next: (respuestas) => {
        this.respuestas = respuestas;
        this.cargandoRespuestas = false;

        // Mostrar la respuesta existente (si hay).
        if (this.respuestas.length > 0) {
          this.respuesta = this.respuestas[0].respuesta; // Cargar la primera respuesta.
        }
      },
      error: (error) => {
        console.error('Error al cargar respuestas:', error);
        this.cargandoRespuestas = false;
      },
    });
  }

  // Función para formatear la fecha como dd-mm-yyyy
  formatFecha(fecha: Date): string {
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const año = fecha.getFullYear();
    return `${dia}-${mes}-${año}`;
  }

  enviarRespuesta(): void {
    // Verificar si la respuesta no está vacía
    if (!this.respuesta.trim()) {
      console.log('No se ha ingresado una respuesta');
      return; // Evitar enviar si la respuesta está vacía.
    }

    // Crear un objeto de tipo RespuestaReporte
    const respuestaReporte: RespuestaReporte = {
      reporte_id: this.data.reporte.id,
      respuesta: this.respuesta,
      estado_actualizado: this.nuevoEstado,
      fecha_respuesta: this.formatFecha(new Date()), // Usamos la función formatFecha
    };

    // Llamar a la función para guardar la respuesta en Firebase
    this.soporteService.guardarRespuesta(respuestaReporte).then(() => {
      console.log('Respuesta guardada correctamente');
      
      // También podemos actualizar el estado del reporte en la base de datos
      this.soporteService.actualizarEstadoReporte(this.data.reporte.id, this.nuevoEstado).then(() => {
        console.log('Estado actualizado correctamente');
      }).catch((error) => {
        console.error('Error al actualizar el estado:', error);
      });
      
      // Cerrar el dialog con los datos
      this.dialogRef.close({
        respuesta: this.respuesta,
        nuevoEstado: this.nuevoEstado,
      });
    }).catch((error) => {
      console.error('Error al guardar respuesta:', error);
    });
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }
}
