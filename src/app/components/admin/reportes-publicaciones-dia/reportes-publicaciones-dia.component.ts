import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSelectChange } from '@angular/material/select';
import { Publicacion } from '../../../models/publicacion.interface';
import { PublicacionesDiaService } from '../../../firebase/publicaciones-dia.service';
import { Router } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reportes-publicaciones-dia',
  templateUrl: './reportes-publicaciones-dia.component.html',
  styleUrls: ['./reportes-publicaciones-dia.component.css'],
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSelectModule, MatOptionModule],
})
export class ReportesPublicacionesDiaComponent implements OnInit {
  estados: string[] = ['Todos', 'AGENDADA', 'EN_CURSO', 'FINALIZADA', 'NO REALIZADA'];
  displayedColumns: string[] = [
    'titulo',
    'nombreUsuario',
    'apellidoUsuario',
    'duracion',
    'hora',
    'formato',
    'estado',
    'acciones',
  ];
  dataSource = new MatTableDataSource<Publicacion>();
  publicacionesPorEstado: { [key: string]: Publicacion[] } = {}; // Para almacenar datos por estado

  constructor(
    private publicacionesService: PublicacionesDiaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPublicaciones();
  }

  cargarPublicaciones(): void {
    this.publicacionesService.getPublicacionesPorEstadoDelDia().subscribe((resultado) => {
      this.publicacionesPorEstado = {
        Todos: [
          ...resultado.agendadas,
          ...resultado.enCurso,
          ...resultado.finalizadas,
          ...resultado.noRealizadas,
        ],
        AGENDADA: resultado.agendadas,
        EN_CURSO: resultado.enCurso,
        FINALIZADA: resultado.finalizadas,
        NO_REALIZADA: resultado.noRealizadas,
      };

      this.dataSource.data = this.publicacionesPorEstado['Todos']; // Mostrar todas inicialmente
    });
  }

  filtrarPorEstado(event: MatSelectChange): void {
    const estado = event.value;
    this.dataSource.data = this.publicacionesPorEstado[estado] || [];
  }

  intervenir(idPublicacion: string): void {
    this.router.navigate(['/admin/intervencion-pagos', idPublicacion]);
  }
}
