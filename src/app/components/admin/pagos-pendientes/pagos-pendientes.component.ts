import { Component, OnInit } from '@angular/core';
import { PagosService } from '../../../firebase/pagos.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Publicacion } from '../../../models/publicacion.interface';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pagos-pendientes',
  templateUrl: './pagos-pendientes.component.html',
  styleUrls: ['./pagos-pendientes.component.css'],
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule, MatButtonModule, MatIconModule],
})
export class PagosPendientesComponent implements OnInit {
  // Asegúrate de que 'acciones' esté en la lista de columnas
  displayedColumns: string[] = [
    'titulo', 'nombreUsuario', 'apellidoUsuario', 'duracion', 'hora', 'formato', 'estado', 'acciones'
  ];

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