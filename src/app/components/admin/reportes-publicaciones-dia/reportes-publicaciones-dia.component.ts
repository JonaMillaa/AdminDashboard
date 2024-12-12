import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule, MatSelectChange, MatSelect } from '@angular/material/select';  // Cambié aquí
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { Publicacion } from '../../../models/publicacion.interface';
import { PublicacionesDiaService } from '../../../firebase/publicaciones-dia.service';
import { Router } from '@angular/router';
import { Chart } from 'chart.js';
import { getSpanishPaginatorIntl } from '../pagos-pendientes/pagos-pendientes.component';

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
  estados: string[] = ['Todos', 'AGENDADA', 'EN_CURSO', 'FINALIZADA', 'NO_REALIZADA'];
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
  estadoSeleccionado: string = 'Todos'; // Estado seleccionado por defecto
  barChart!: Chart<'bar'>;
  // Variables para métricas de publicaciones
  publicacionesAgendadasCount: number = 0;
  publicacionesEnCursoCount: number = 0;
  publicacionesFinalizadasCount: number = 0;
  publicacionesNoRealizadasCount: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('publicacionChart', { static: true }) publicacionChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('estadoSelect', { static: true }) estadoSelect!: MatSelect;  // Cambié aquí
  @ViewChild('barChart', { static: true }) barChartCanvas!: ElementRef<HTMLCanvasElement>;

  publicacionChart!: Chart<'pie'>;

  constructor(
    private publicacionesService: PublicacionesDiaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPublicaciones();
    this.obtenerDatosDePublicaciones(); 
    this.inicializarBarChart();
  }

  obtenerDatosDePublicaciones(): void {
    this.publicacionesService.getPublicacionesPorEstadoDelDia().subscribe(data => {
      console.log('Datos recibidos del servicio:', data); // Verifica los datos recibidos
      this.publicacionesAgendadasCount = data.agendadas.length;
      this.publicacionesEnCursoCount = data.enCurso.length;
      this.publicacionesFinalizadasCount = data.finalizadas.length;
      this.publicacionesNoRealizadasCount = data.noRealizadas.length;
      console.log('Contadores:', {
        agendadas: this.publicacionesAgendadasCount,
        enCurso: this.publicacionesEnCursoCount,
        finalizadas: this.publicacionesFinalizadasCount,
        noRealizadas: this.publicacionesNoRealizadasCount,
      }); // Verifica los valores
      this.actualizarPublicacionChart();
    });
  }
  

  actualizarPublicacionChart(): void {
    this.barChart.data.datasets[0].data = [
      this.publicacionesAgendadasCount,
      this.publicacionesEnCursoCount,
      this.publicacionesFinalizadasCount,
      this.publicacionesNoRealizadasCount,
    ];
    this.barChart.update();
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
 
  verTodasPublicaciones(): void {
    this.estadoSeleccionado = 'Todos';
    this.dataSource.data = this.publicacionesPorEstado['Todos'];
    this.paginator.firstPage(); // Reinicia a la primera página al ver todas
  }

  filtrarPorEstado(event: MatSelectChange): void {
    const estado = event.value;
    this.estadoSeleccionado = estado; // Guardar el estado seleccionado
    this.dataSource.data = this.publicacionesPorEstado[estado] || [];
    this.paginator.firstPage(); // Reinicia a la primera página al filtrar
  }

  filtrarPorEstadoDirecto(estado: string): void {
    this.estadoSeleccionado = estado; // Guardar el estado directamente desde las tarjetas
    this.dataSource.data = this.publicacionesPorEstado[estado] || [];
    this.paginator.firstPage(); // Reinicia a la primera página al filtrar

    // Cambiar el valor del mat-select para que refleje el filtro
    this.estadoSelect.value = estado;  // Ahora accedemos correctamente a la propiedad value
  }

  intervenir(idPublicacion: string): void {
    this.router.navigate(['/admin/intervencion-pagos', idPublicacion]);
  } 

  inicializarBarChart(): void {
    this.barChart = new Chart(this.barChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Agendadas', 'En Curso', 'Finalizadas', 'No Realizadas'],
        datasets: [
          {
            data: [0, 0, 0, 0], // Valores iniciales
            backgroundColor: ['#42a5f5', '#ffa726', '#66bb6a', '#ef5350'],
            barPercentage: 0.6, // Ajusta el grosor de las barras
            categoryPercentage: 0.8, // Relación entre barras y categorías
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false, // Oculta la leyenda (label)
          },
          title: {
            display: true,
            text: 'Cantidad de Publicaciones por Estado', // Título del gráfico
            font: {
              size: 18, // Tamaño del título
              weight: 'bold', // Negrita
            },
            padding: {
              top: 10, // Espacio superior
              bottom: 20, // Espacio inferior
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Estados',
            },
            grid: {
              display: true, // Habilita las líneas cuadriculadas en el eje X
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1, // Asegura que los incrementos sean de 1
              callback: function(value) {
                return Number(value).toFixed(0); // Forzar números enteros
              },
            },
            title: {
              display: true,
              text: 'Cantidad',
            },
            grid: {
              display: true, // Habilita las líneas cuadriculadas en el eje Y
            },
          },
        },
      },
    });
  }
  
  
  
} 

