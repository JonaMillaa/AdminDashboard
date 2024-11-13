import { Component, OnInit } from '@angular/core';
import { PagosService } from '../../../firebase/pagos.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Publicacion } from '../../../models/publicacion.interface';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-pagos-pendientes',
  templateUrl: './pagos-pendientes.component.html',
  styleUrls: ['./pagos-pendientes.component.css'],
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule],
})
export class PagosPendientesComponent implements OnInit {
  displayedColumns: string[] = ['titulo', 'nombreUsuario', 'apellidoUsuario', 'duracion', 'hora', 'formato', 'estado'];
  pagosPendientesDataSource = new MatTableDataSource<Publicacion>();
  pagosFinalizadosDataSource = new MatTableDataSource<Publicacion>();

  pagosPendientesCount: number = 0;
  pagosFinalizadosCount: number = 0;

  tablaActual: 'pendientes' | 'finalizados' = 'pendientes';

  constructor(private publicacionesService: PagosService) {}

  ngOnInit(): void {
    this.cargarPagosPendientesYFinalizados();
  }

  cargarPagosPendientesYFinalizados(): void {
    this.publicacionesService.getPagosPendientesYFinalizados().subscribe((publicaciones) => {
      const pagosPendientes = publicaciones.filter(pub => pub.estado === 'EN_CURSO');
      const pagosFinalizados = publicaciones.filter(pub => pub.estado === 'FINALIZADA');

      this.pagosPendientesDataSource.data = pagosPendientes;
      this.pagosFinalizadosDataSource.data = pagosFinalizados;

      this.pagosPendientesCount = pagosPendientes.length;
      this.pagosFinalizadosCount = pagosFinalizados.length;
    });
  }

  mostrarTabla(tipo: 'pendientes' | 'finalizados'): void {
    this.tablaActual = tipo;
  }
}
