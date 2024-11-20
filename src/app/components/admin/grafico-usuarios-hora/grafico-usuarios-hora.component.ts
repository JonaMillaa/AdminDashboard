import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart, ChartData, ChartOptions } from 'chart.js';
import { FirebaseService } from '../../../firebase/firebase.service';

@Component({
  selector: 'app-grafico-usuarios-hora',
  templateUrl: './grafico-usuarios-hora.component.html',
  styleUrls: ['./grafico-usuarios-hora.component.css']
})
export class GraficoUsuariosHoraComponent implements OnInit {
  @ViewChild('lineChart', { static: true }) lineChartRef!: ElementRef;

  private lineChart!: Chart;

  constructor(private actividadService: FirebaseService) {}

  ngOnInit(): void {
    this.cargarDatosGrafico();
  }

  private inicializarGrafico(data: number[][]) {
    const [usuariosActivos, logins, registros] = data;

    const chartData: ChartData<'line'> = {
      labels: this.generarEtiquetasHora(),
      datasets: [
        { data: usuariosActivos, label: 'Usuarios Activos', borderColor: '#42A5F5', fill: false },
        { data: logins, label: 'Logins', borderColor: '#66BB6A', fill: false },
        { data: registros, label: 'Nuevos Registros', borderColor: '#FFA726', fill: false }
      ]
    };

    const chartOptions: ChartOptions<'line'> = {
      responsive: true,
      scales: {
        x: {},
        y: { beginAtZero: true }
      }
    };

    this.lineChart = new Chart(this.lineChartRef.nativeElement, {
      type: 'line',
      data: chartData,
      options: chartOptions
    });
  }

  private cargarDatosGrafico() {
    // Modificamos Promise.all para asegurar que siempre haya un array en los resultados
    Promise.all([
      this.actividadService.obtenerUsuariosActivosPorHora().toPromise().then(data => data || []),
      this.actividadService.obtenerLoginsPorHora().toPromise().then(data => data || []),
      this.actividadService.obtenerRegistrosPorHora().toPromise().then(data => data || [])
    ]).then((data) => {
      this.inicializarGrafico(data as number[][]); // Aseguramos que siempre sea un array de arrays de números
    });
  }

  private generarEtiquetasHora(): string[] {
    return Array.from({ length: 24 }, (_, i) => `${i}:00`);
  }
}
