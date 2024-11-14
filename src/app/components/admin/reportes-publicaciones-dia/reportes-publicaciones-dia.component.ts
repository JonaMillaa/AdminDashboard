// reportes-publicaciones-dia.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSelectChange } from '@angular/material/select';
import { Publicacion } from '../../../models/publicacion.interface';
import { PublicacionesDiaService } from '../../../firebase/publicaciones-dia.service';

import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core'; // Necesario para mat-option
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-reportes-publicaciones-dia',
  templateUrl: './reportes-publicaciones-dia.component.html',
  styleUrls: ['./reportes-publicaciones-dia.component.css'],
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSelectModule, MatOptionModule] // Agregar MatTableModule y MatSelectModule

})
export class ReportesPublicacionesDiaComponent implements OnInit {
  estados: string[] = ['Todos', 'AGENDADA', 'EN_CURSO', 'FINALIZADA', 'NO REALIZADA'];
  displayedColumns: string[] = ['titulo', 'nombreUsuario', 'apellidoUsuario', 'duracion', 'hora', 'formato', 'estado'];
  dataSource = new MatTableDataSource<Publicacion>();

  constructor(private publicacionesService: PublicacionesDiaService) {}

  ngOnInit(): void {
    this.cargarPublicaciones();
  }

  cargarPublicaciones(): void {
    this.publicacionesService.getTodasLasPublicacionesDelDia().subscribe(publicaciones => {
      this.dataSource.data = publicaciones;
    });
  }

  filtrarPorEstado(event: MatSelectChange): void {
    const estado = event.value;
    if (estado === 'Todos') {
      this.cargarPublicaciones();
    } else {
      this.dataSource.data = this.dataSource.data.filter(pub => pub.estado === estado);
    }
  }
}
