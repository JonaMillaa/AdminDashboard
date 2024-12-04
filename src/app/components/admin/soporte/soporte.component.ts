import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Reportes } from '../../../models/reportes';
import { SoporteRespuestaComponent } from '../soporte-respuesta/soporte-respuesta.component';
import { SoporteService } from '../../../firebase/soporte.service';
import { CommonModule } from '@angular/common';

import {SoporteModuloComponent} from '../soporte-modulo/soporte-modulo.component'

@Component({
  selector: 'app-soporte',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    SoporteRespuestaComponent,
    SoporteModuloComponent

  ],
  templateUrl: './soporte.component.html',
  styleUrls: ['./soporte.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useFactory: getSpanishPaginatorIntl },
  ],
})
export class SoporteComponent implements OnInit {
  displayedColumns: string[] = ['categoria', 'subCategoria', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<Reportes>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private soporteService: SoporteService, private dialog: MatDialog, ) {}
  reportesSinResolver : number = 0;
  reportesResueltos : number = 0;
  reportesPorResolver : number = 0;

  ngOnInit(): void {
    this.obtenerReportes();
    this.obtenerMetricas();
    this.obtenerMetricasPorResolver();
    this.obtenerMetricasResueltas()
  }

  obtenerReportes(): void {
    this.soporteService.getReportes().subscribe((reportes) => {
      console.log('soy reportes' , reportes)
      this.dataSource.data = reportes;
      this.dataSource.paginator = this.paginator;
    });
  }
  abrirDialogo(estado : string) {
    this.dialog.open(SoporteModuloComponent, {
      width: '800px', // Ancho del diálogo
      data : {estado}
    });
  }

  obtenerMetricas(): void {

    this.soporteService.getCollectionQuery<any>('Reportes', 'estado', 'en curso').subscribe( (res: any) => {
      this.reportesSinResolver = res.length
      console.log(this.reportesSinResolver)
    })
  }

  obtenerMetricasResueltas(): void {

    this.soporteService.getCollectionQuery<any>('Reportes', 'estado', 'resuelto').subscribe( (res: any) => {
      this.reportesResueltos = res.length
      console.log(this.reportesSinResolver)
    })
  }
  obtenerMetricasPorResolver(): void {

    this.soporteService.getCollectionQuery<any>('Reportes', 'estado', 'por resolver').subscribe( (res: any) => {
      this.reportesPorResolver = res.length
      console.log(this.reportesSinResolver)
    })
  }


  aplicarFiltro(filtro: string): void {
    this.dataSource.filter = filtro.trim().toLowerCase();
  }

  verDetalleReporte(reporte: Reportes): void {
    this.soporteService.getUsuarioPorID(reporte.id_usuario).subscribe((usuario) => {
      this.dialog.open(SoporteRespuestaComponent, {
        width: '650px',
        height: '515px',
        data: { reporte, usuario },
      });
    });
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
