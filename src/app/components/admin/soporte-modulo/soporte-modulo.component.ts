import { Component,  Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {SoporteService} from './../../../firebase/soporte.service'
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Reportes } from '../../../models/reportes';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { SoporteRespuestaComponent } from '../soporte-respuesta/soporte-respuesta.component';

@Component({
  selector: 'app-soporte-modulo',
  standalone: true,
  imports: [MatTableModule,MatPaginatorModule, SoporteRespuestaComponent],
  templateUrl: './soporte-modulo.component.html',
  styleUrl: './soporte-modulo.component.css',
  providers: [
    { provide: MatPaginatorIntl, useFactory: getSpanishPaginatorIntl },
  ],
})
export class SoporteModuloComponent {
  displayedColumns: string[] = ['categoria', 'subCategoria', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<Reportes>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
    // Aquí recibimos los datos pasados al abrir el diálogo
    constructor(@Inject(MAT_DIALOG_DATA) public data: { estado: string }, private serviceSoporte : SoporteService, private dialog: MatDialog)  {
      console.log('Estado recibido:', data.estado);
    }

    ngOnInit(): void {
      this.llenarTabla()

    }

    llenarTabla(){
      if(this.data.estado == 'por resolver'){
        this.serviceSoporte.getCollectionQuery('Reportes', 'estado', this.data.estado ).subscribe((res : any) => {
          this.dataSource.data = res;
          this.dataSource.paginator = this.paginator;

        })


      }else if(this.data.estado == 'en curso'){
        this.serviceSoporte.getCollectionQuery('Reportes', 'estado', this.data.estado ).subscribe((res : any) => {
          console.log('soy res soporte por en curso ->' , res)
          this.dataSource.data = res;
          this.dataSource.paginator = this.paginator;

        })

      }else{
        this.serviceSoporte.getCollectionQuery('Reportes', 'estado', this.data.estado ).subscribe((res : any) => {
          this.dataSource.data = res;
          this.dataSource.paginator = this.paginator;

        })

      }

    }

    verDetalleReporte(reporte: Reportes): void {
      this.serviceSoporte.getUsuarioPorID(reporte.id_usuario).subscribe((usuario) => {
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
