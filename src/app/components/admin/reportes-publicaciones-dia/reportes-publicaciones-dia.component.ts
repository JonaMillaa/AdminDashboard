import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { Publicacion } from '../../../models/publicacion.interface';
import { PublicacionesDiaService } from '../../../firebase/publicaciones-dia.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reportes-publicaciones-dia',
  templateUrl: './reportes-publicaciones-dia.component.html',
  styleUrls: ['./reportes-publicaciones-dia.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSelectModule,
    MatButtonModule,
    MatFormFieldModule,
    MatOptionModule,
  ],
  providers: [
    { provide: MatPaginatorIntl, useFactory: getSpanishPaginatorIntl },
  ],
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
  dataSource = new MatTableDataSource<Publicacion>([]);
  publicacionesPorEstado: { [key: string]: Publicacion[] } = {};

  @ViewChild(MatPaginator) paginator!: MatPaginator;

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
      this.dataSource.data = this.publicacionesPorEstado['Todos'];
      this.dataSource.paginator = this.paginator;
    });
  }

  filtrarPorEstado(event: MatSelectChange): void {
    const estado = event.value;
    this.dataSource.data = this.publicacionesPorEstado[estado] || [];
    this.paginator.firstPage(); // Reinicia a la primera página al filtrar
  }

  intervenir(idPublicacion: string): void {
    this.router.navigate(['/admin/intervencion-pagos', idPublicacion]);
  }
}

export function getSpanishPaginatorIntl(): MatPaginatorIntl {
  const paginatorIntl = new MatPaginatorIntl();
  paginatorIntl.itemsPerPageLabel = 'Elementos por página';
  paginatorIntl.nextPageLabel = 'Siguiente página';
  paginatorIntl.previousPageLabel = 'Página anterior';
  paginatorIntl.firstPageLabel = 'Primera página';
  paginatorIntl.lastPageLabel = 'Última página';
  paginatorIntl.getRangeLabel = (page, pageSize, length) => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }
    const startIndex = page * pageSize;
    const endIndex = Math.min(startIndex + pageSize, length);
    return `${startIndex + 1} - ${endIndex} de ${length}`;
  };
  return paginatorIntl;
}
