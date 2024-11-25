import { Component, OnInit, ViewChild } from '@angular/core';
import { PagosService } from '../../../firebase/pagos.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Publicacion } from '../../../models/publicacion.interface';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';

@Component({
  selector: 'app-pagos-pendientes',
  templateUrl: './pagos-pendientes.component.html',
  styleUrls: ['./pagos-pendientes.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  providers: [
    { provide: MatPaginatorIntl, useFactory: getSpanishPaginatorIntl },
  ],
})
export class PagosPendientesComponent implements OnInit {
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
  publicacionesPorEstado: { [key: string]: Publicacion[] } = {};
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private pagosService: PagosService, private router: Router) {}

  ngOnInit(): void {
    this.cargarPagosPendientesYFinalizados();
  }

  cargarPagosPendientesYFinalizados(): void {
    this.pagosService.getPagosPendientesYFinalizados().subscribe((publicaciones) => {
      const enCurso = publicaciones.filter((pub) => pub.estado === 'EN_CURSO');
      const finalizadas = publicaciones.filter((pub) => pub.estado === 'FINALIZADA');

      this.publicacionesPorEstado = {
        Todos: [...enCurso, ...finalizadas],
        EN_CURSO: enCurso,
        FINALIZADA: finalizadas,
      };

      this.dataSource.data = this.publicacionesPorEstado['Todos'];
      this.dataSource.paginator = this.paginator;
    });
  }

  filtrarPorEstado(event: MatSelectChange): void {
    const estado = event.value;
    this.dataSource.data = this.publicacionesPorEstado[estado] || [];
    this.paginator.firstPage(); // Reinicia la paginación al cambiar el filtro
  }

  intervenir(idPublicacion: string): void {
    this.router.navigate([`/admin/intervencion-pagos`, idPublicacion]);
  }
}

// Paginador en español
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
