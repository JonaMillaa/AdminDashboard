import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ReportesService } from '../../../firebase/reportes.service';
import { PublicacionesDiaService } from '../../../firebase/publicaciones-dia.service';

@Component({
  selector: 'app-reportes-dia',
  templateUrl: './reportes-dia.component.html',
  styleUrls: ['./reportes-dia.component.css'],
  standalone: true,
})
export class ReportesDiaComponent implements OnInit {
  // Variables para métricas de usuario
  contadorIniciosSesionHoy: number = 0;
  numeroUsuariosActivosHoy: number = 0;
  nuevosUsuariosHoy: number = 0;

  // Variables para métricas de publicaciones
  publicacionesAgendadasCount: number = 0;
  publicacionesEnCursoCount: number = 0;
  publicacionesFinalizadasCount: number = 0;
  publicacionesNoRealizadasCount: number = 0;

  // Referencias a los elementos de los gráficos
  @ViewChild('myChart', { static: true }) usuarioChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('publicacionChart', { static: true }) publicacionChartCanvas!: ElementRef<HTMLCanvasElement>;

  usuarioChart!: Chart<'doughnut'>;
  publicacionChart!: Chart<'pie'>;

  constructor(
    private reportesService: ReportesService,
    private publicacionesService: PublicacionesDiaService
  ) {
    Chart.register(...registerables, ChartDataLabels);
  }

  ngOnInit(): void {
    this.obtenerDatosDeUsuario();
    this.obtenerDatosDePublicaciones();
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
    this.reportesService.obtenerNuevosUsuariosHoy().subscribe(contador => {
      this.nuevosUsuariosHoy = contador;
      this.actualizarUsuarioChart();
    });
  }

  obtenerDatosDePublicaciones(): void {
    this.publicacionesService.getPublicacionesPorEstadoDelDia().subscribe(data => {
      this.publicacionesAgendadasCount = data.agendadas.length;
      this.publicacionesEnCursoCount = data.enCurso.length;
      this.publicacionesFinalizadasCount = data.finalizadas.length;
      this.publicacionesNoRealizadasCount = data.noRealizadas.length;
      this.actualizarPublicacionChart();
    });
  }

  inicializarGraficos(): void {
    // Configuración del gráfico de usuarios con porcentaje
    const usuarioConfig: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
           datasets: [{
          data: [this.contadorIniciosSesionHoy, this.numeroUsuariosActivosHoy, this.nuevosUsuariosHoy],
          backgroundColor: ['#3b82f6', '#4caf50', '#ff9800'],
          hoverBackgroundColor: ['#1c64d6', '#388e3c', '#ff5722']
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
        }
      }
    };
    this.usuarioChart = new Chart(this.usuarioChartCanvas.nativeElement, usuarioConfig);

    // Configuración del gráfico de publicaciones con porcentaje
    const publicacionConfig: ChartConfiguration<'pie'> = {
      type: 'pie',
      data: {
    datasets: [{
          data: [this.publicacionesAgendadasCount, this.publicacionesEnCursoCount, this.publicacionesFinalizadasCount, this.publicacionesNoRealizadasCount],
          backgroundColor: ['#42a5f5', '#66bb6a', '#ffa726', '#ef5350'],
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
        }
      }
    };
    this.publicacionChart = new Chart(this.publicacionChartCanvas.nativeElement, publicacionConfig);
  }

  actualizarUsuarioChart(): void {
    this.usuarioChart.data.datasets[0].data = [
      this.contadorIniciosSesionHoy,
      this.numeroUsuariosActivosHoy,
      this.nuevosUsuariosHoy
    ];
    this.usuarioChart.update();
  }

  actualizarPublicacionChart(): void {
    this.publicacionChart.data.datasets[0].data = [
      this.publicacionesAgendadasCount,
      this.publicacionesEnCursoCount,
      this.publicacionesFinalizadasCount,
      this.publicacionesNoRealizadasCount
    ];
    this.publicacionChart.update();
  }
}
