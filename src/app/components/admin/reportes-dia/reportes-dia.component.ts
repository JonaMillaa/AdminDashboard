import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ReportesService } from '../../../firebase/reportes.service';

@Component({
  selector: 'app-reportes-dia',
  templateUrl: './reportes-dia.component.html',
  styleUrls: ['./reportes-dia.component.css'],
  standalone: true,
})
export class ReportesDiaComponent implements OnInit {
  // Variables para los cuadros de métricas
  contadorIniciosSesionHoy: number = 0;
  numeroUsuariosActivosHoy: number = 0;
  nuevosUsuariosHoy: number = 0;
  publicacionesHoy: any[] = [];

  @ViewChild('myChart', { static: true }) myChart!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

  constructor(private reportesService: ReportesService) {
    Chart.register(...registerables, ChartDataLabels);
  }

  ngOnInit(): void {
    this.obtenerDatosDelDia();
    this.inicializarGrafico();
  }

  obtenerDatosDelDia(): void {
    this.reportesService.obtenerContadorHoy().subscribe(
      contador => {
        this.contadorIniciosSesionHoy = contador;
        this.actualizarGrafico();
      },
      error => console.error('Error al obtener el contador de inicios de sesión:', error)
    );

    this.reportesService.obtenerUsuariosActivosHoy().subscribe(
      numero => {
        this.numeroUsuariosActivosHoy = numero;
        this.actualizarGrafico();
      },
      error => console.error('Error al obtener el número de usuarios activos de hoy:', error)
    );

    this.reportesService.obtenerNuevosUsuariosHoy().subscribe(
      contador => {
        this.nuevosUsuariosHoy = contador;
        this.actualizarGrafico();
      },
      error => console.error('Error al obtener el número de nuevos usuarios de hoy:', error)
    );
  }

  inicializarGrafico(): void {
    const total = this.contadorIniciosSesionHoy + this.numeroUsuariosActivosHoy + this.nuevosUsuariosHoy;

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
         datasets: [
          {
            data: [this.contadorIniciosSesionHoy, this.numeroUsuariosActivosHoy, this.nuevosUsuariosHoy],
            backgroundColor: ['#3b82f6', '#4caf50', '#ff9800'],
            hoverBackgroundColor: ['#1c64d6', '#388e3c', '#ff5722'],
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          datalabels: {
            color: '#fff',
            formatter: (value) => {
              const percentage = ((value / total) * 100).toFixed(2) + '%';
              return percentage; // Solo muestra el porcentaje
            },
            font: {
              weight: 'bold'
            }
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                const label = tooltipItem.label || '';
                const value = tooltipItem.raw as number;
                const percentage = ((value / total) * 100).toFixed(2) + '%';
                return `${label}: ${value} (${percentage})`;
              }
            }
          }
        }
      }
    };

    this.chart = new Chart(this.myChart.nativeElement, config as any);
  }

  actualizarGrafico(): void {
    const total = this.contadorIniciosSesionHoy + this.numeroUsuariosActivosHoy + this.nuevosUsuariosHoy;

    this.chart.data.datasets[0].data = [
      this.contadorIniciosSesionHoy,
      this.numeroUsuariosActivosHoy,
      this.nuevosUsuariosHoy
    ];
    this.chart.options.plugins!.datalabels!.formatter = (value) => {
      const percentage = ((value / total) * 100).toFixed(2) + '%';
      return percentage; // Solo muestra el porcentaje
    };
    this.chart.update();
  }
}
