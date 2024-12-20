import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Reportes } from '../../../models/reportes';
import { SoporteRespuestaComponent } from '../soporte-respuesta/soporte-respuesta.component';
import { SoporteService } from '../../../firebase/soporte.service';
import { CommonModule } from '@angular/common';


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
  reportesPorEstado: { [key: string]: Reportes[] } = {};
  estadoSeleccionado: string = 'Todos'; // Estado seleccionado por defecto

  reportesSinResolver : number = 0;
  reportesResueltos : number = 0;
  reportesPorResolver : number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('estadoSelect', { static: true }) estadoSelect!: MatSelect;  // Cambié aquí

  constructor(private soporteService: SoporteService, private dialog: MatDialog) {}




  ngOnInit(): void {
    this.obtenerReportes();
    this.obtenerMetricas(); 
    this.obtenerMetricasPorResolver();
    this.obtenerMetricasResueltas()
  }  
  filtrarPorEstadoDirecto(estado: string): void {
    this.estadoSeleccionado = estado; // Actualiza el estado seleccionado
    this.dataSource.filter = estado.trim().toLowerCase(); // Aplica el filtro a la tabla
    this.paginator.firstPage(); // Reinicia a la primera página
  }

  obtenerReportes(): void {
    this.soporteService.getReportes().subscribe((reportes) => {
      this.dataSource.data = reportes;
      this.dataSource.paginator = this.paginator;
  
      // Agrupa los reportes por estado
      this.reportesPorEstado = reportes.reduce<{ [key: string]: Reportes[] }>((acc, reporte) => {
        if (!acc[reporte.estado]) {
          acc[reporte.estado] = []; // Inicializa el array si no existe
        }
        acc[reporte.estado].push(reporte); // Agrega el reporte al estado correspondiente
        return acc;
      }, {});
  
      // Configura el filtro personalizado
      this.dataSource.filterPredicate = (data: Reportes, filter: string) =>
        data.estado.toLowerCase().includes(filter);
    });
  }
   
  verTodasPublicaciones(): void {
    this.estadoSeleccionado = 'Todos'; // Actualiza el estado seleccionado
    this.dataSource.filter = ''; // Limpia el filtro para mostrar todos los datos
    this.paginator.firstPage(); // Reinicia la paginación
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
    this.estadoSeleccionado = filtro; // Actualiza el estado seleccionado
    this.dataSource.filter = filtro.trim().toLowerCase(); // Aplica el filtro a la tabla
    this.paginator.firstPage(); // Reinicia a la primera página
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
