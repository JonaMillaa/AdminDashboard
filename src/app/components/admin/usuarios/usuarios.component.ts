import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UsuariosService } from '../../../firebase/usuarios.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Usuario } from '../../../models/usuario.model';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginator, MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { UsuarioDetalleComponent } from '../usuario-detalle/usuario-detalle.component';
import { ReportesService } from '../../../firebase/reportes.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatTabsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    UsuarioDetalleComponent,
    MatPaginatorModule,
  ],
  providers: [
    {
      provide: MatPaginatorIntl,
      useValue: (() => {
        const paginatorIntl = new MatPaginatorIntl();
        paginatorIntl.itemsPerPageLabel = 'Elementos por página:';
        paginatorIntl.nextPageLabel = 'Página siguiente';
        paginatorIntl.previousPageLabel = 'Página anterior';
        paginatorIntl.firstPageLabel = 'Primera página';
        paginatorIntl.lastPageLabel = 'Última página';
        paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number) => {
          if (length === 0 || pageSize === 0) {
            return `0 de ${length}`;
          }
          const startIndex = page * pageSize;
          const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
          return `${startIndex + 1} - ${endIndex} de ${length}`;
        };
        return paginatorIntl;
      })(),
    },
  ],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
})
export class UsuariosComponent implements OnInit {
  displayedColumns: string[] = ['nombre', 'apellido', 'rut', 'telefono', 'estado', 'acciones'];
  usuariosDataSource = new MatTableDataSource<Usuario>([]);
  cargando: boolean = false; 
    // Variables para métricas de usuario
    contadorIniciosSesionHoy: number = 0;
    numeroUsuariosActivosHoy: number = 0;
    nuevosUsuariosHoy: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;  
   // Referencias a los elementos de los gráficos
   @ViewChild('myChart', { static: true }) usuarioChartCanvas!: ElementRef<HTMLCanvasElement>;

  usuarioChart!: Chart<'doughnut'>;

  constructor(private firebaseService: UsuariosService,
     public dialog: MatDialog,
     private reportesService: ReportesService,
  

  ) { 
    Chart.register(...registerables, ChartDataLabels);
  }

  ngOnInit(): void {
    this.cargarUsuarios(); 
    this.obtenerDatosDeUsuario();
    this.inicializarGraficos();
  }

  obtenerDatosDeUsuario(): void {
    this.reportesService.obtenerContadorHoy().subscribe(contador => {
      this.contadorIniciosSesionHoy = contador;
      this.actualizarUsuarioChart();
    });
    this.reportesService.obtenerUsuariosActivosHoy().subscribe(numero => {
      this.numeroUsuariosActivosHoy = numero;
      this.actualizarUsuarioChart();
    });
 
  } 
  actualizarUsuarioChart(): void {
    this.usuarioChart.data.datasets[0].data = [
      this.contadorIniciosSesionHoy,
      this.numeroUsuariosActivosHoy,
    ];
    this.usuarioChart.update();
  } 
  inicializarGraficos(): void {
    // Configuración del gráfico de usuarios con porcentaje
    const usuarioConfig: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [this.contadorIniciosSesionHoy, this.numeroUsuariosActivosHoy],
          backgroundColor: ['#4caf50', '#2196f3'],
          hoverBackgroundColor: ['#4caf50', '#2196f3']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          datalabels: {
            color: '#fff',
            formatter: (value, context) => {
              const dataArray = context.dataset.data as number[];
              const total = dataArray.reduce((acc, val) => acc + (typeof val === 'number' ? val : 0), 0);
              return total > 0 ? ((value / total) * 100).toFixed(2) + '%' : '0%';
            },
            font: { weight: 'bold' }
          }
        },
        scales: {
          x: { 
            grid: {
              display: true,
              color: '#ddd', // Color de la cuadrícula
              borderColor: '#ddd', // Color del borde
              borderWidth: 1, // Grosor del borde
            },
          },
          y: {
            ticks: {
              display: false, // Desactivar los números en el eje y
            },
            grid: {
              display: true,
              color: '#ddd', // Color de la cuadrícula
              borderColor: '#ddd', // Color del borde
              borderWidth: 1, // Grosor del borde
            },
          },
        },
      }
    };
  
    this.usuarioChart = new Chart(this.usuarioChartCanvas.nativeElement, usuarioConfig);
  }
  

  cargarUsuarios(): void {
    this.cargando = true;
    this.firebaseService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.usuariosDataSource.data = usuarios || [];
        this.usuariosDataSource.paginator = this.paginator; // Configura el paginador
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.cargando = false;
      },
    });
  }

  aplicarFiltro(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.usuariosDataSource.filter = input.value.trim().toLowerCase();
  }

  cambiarEstado(usuario: Usuario): void {
    const nuevoEstado = usuario.Estado === 'ACTIVO' ? 'BLOQUEADO' : 'ACTIVO';
    this.firebaseService
      .actualizarEstadoUsuario(usuario.ID, nuevoEstado)
      .then(() => this.cargarUsuarios())
      .catch((error) => console.error('Error al actualizar estado:', error));
  }

  editarUsuario(usuario: Usuario): void {
    const dialogRef = this.dialog.open(UsuarioDetalleComponent, {
      width: '600px',
      height: '340px',
      data: { ...usuario },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.firebaseService
          .actualizarUsuario(result)
          .then(() => this.cargarUsuarios())
          .catch((error) => console.error('Error al actualizar usuario:', error));
      }
    });
  }
}
