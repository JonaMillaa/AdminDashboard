import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ReportesService } from '../../../firebase/reportes.service';
import { PublicacionesDiaService } from '../../../firebase/publicaciones-dia.service';

@Component({
  selector: 'app-reportes-dia',
  templateUrl: './reportes-dia.component.html',
  styleUrls: ['./reportes-dia.component.css'],
  standalone: true,
})
export class ReportesDiaComponent implements AfterViewInit {
  // Variables para métricas de usuario
  contadorIniciosSesionHoy: number = 0;
  numeroUsuariosActivosHoy: number = 0;
  nuevosUsuariosHoy: number = 0;

  // Publicaciones del día
  publicacionesHoy: any[] = [];

  // Referencias a los elementos de los gráficos
  @ViewChild('usuarioChart', { static: true }) usuarioChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('publicacionChart', { static: true }) publicacionChart!: ElementRef<HTMLCanvasElement>;

  usuarioChartInstance!: Chart<'doughnut'>;
  publicacionChartInstance!: Chart<'pie'>;

  constructor(
    private reportesService: ReportesService,
    private publicacionesService: PublicacionesDiaService
  ) {
    Chart.register(...registerables);
  }

  ngAfterViewInit(): void {
    this.obtenerDatosDeUsuario();
    this.obtenerPublicacionesDeHoy();
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

  obtenerPublicacionesDeHoy(): void {
    this.publicacionesService.obtenerPublicacionesHoy().subscribe(
      publicaciones => {
        this.publicacionesHoy = publicaciones;
        this.actualizarPublicacionChart();
      },
      error => console.error('Error al obtener publicaciones del día:', error)
    );
  }

  inicializarGraficos(): void {
    const usuarioConfig: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: ['Inicios de Sesión Hoy', 'Usuarios Activos Hoy', 'Nuevos Usuarios Hoy'],
        datasets: [{
          data: [this.contadorIniciosSesionHoy, this.numeroUsuariosActivosHoy, this.nuevosUsuariosHoy],
          backgroundColor: ['#3b82f6', '#4caf50', '#ff9800'],
          hoverBackgroundColor: ['#1c64d6', '#388e3c', '#ff5722']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
      }
    };
    this.usuarioChartInstance = new Chart<'doughnut'>(this.usuarioChart.nativeElement, usuarioConfig);

    const publicacionConfig: ChartConfiguration<'pie'> = {
      type: 'pie',
      data: {
        labels: ['PUBLICADO', 'ADJUDICACION', 'ADJUDICADO', 'AGENDADA', 'EN_CURSO'],
        datasets: [{
          data: [0, 0, 0, 0, 0],
          backgroundColor: ['#42a5f5', '#66bb6a', '#ffa726', '#ab47bc', '#ef5350'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
      }
    };
    this.publicacionChartInstance = new Chart<'pie'>(this.publicacionChart.nativeElement, publicacionConfig);
  }

  actualizarUsuarioChart(): void {
    this.usuarioChartInstance.data.datasets[0].data = [
      this.contadorIniciosSesionHoy,
      this.numeroUsuariosActivosHoy,
      this.nuevosUsuariosHoy
    ];
    this.usuarioChartInstance.update();
  }

  actualizarPublicacionChart(): void {
    const estados = ['PUBLICADO', 'ADJUDICACION', 'ADJUDICADO', 'AGENDADA', 'EN_CURSO'];
    const conteoEstados = estados.map(estado =>
      this.publicacionesHoy.filter(publicacion => publicacion.estado === estado).length
    );

    this.publicacionChartInstance.data.datasets[0].data = conteoEstados;
    this.publicacionChartInstance.update();
  }
}
