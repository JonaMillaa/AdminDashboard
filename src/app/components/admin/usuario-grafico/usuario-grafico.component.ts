import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-usuario-grafico',
  standalone: true,
  imports: [NgChartsModule],
  templateUrl: './usuario-grafico.component.html',
  styleUrls: ['./usuario-grafico.component.css']
})
export class UsuarioGraficoComponent implements OnChanges {
  @Input() iniciosSesion: number = 0;
  @Input() usuariosActivos: number = 0;
  @Input() nuevosUsuarios: number = 0;

  public scatterChartData: ChartData<'scatter'> = {
    datasets: [
      { data: [{ x: 1, y: 0 }], label: 'Inicios de Sesión Hoy', backgroundColor: '#3b82f6', pointRadius: 5 },
      { data: [{ x: 2, y: 0 }], label: 'Usuarios Activos Hoy', backgroundColor: '#4caf50', pointRadius: 5 },
      { data: [{ x: 3, y: 0 }], label: 'Nuevos Usuarios Hoy', backgroundColor: '#ff9800', pointRadius: 5 }
    ]
  };

  public scatterChartOptions: ChartOptions<'scatter'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Métricas'
        },
        ticks: {
          stepSize: 1,
          callback: function(value, index, values) {
            return ['Inicios de Sesión', 'Usuarios Activos', 'Nuevos Usuarios'][index];
          }
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad'
        }
      }
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    // Actualiza los datos en el gráfico cada vez que las entradas cambien
    this.scatterChartData.datasets[0].data = [{ x: 1, y: this.iniciosSesion }];
    this.scatterChartData.datasets[1].data = [{ x: 2, y: this.usuariosActivos }];
    this.scatterChartData.datasets[2].data = [{ x: 3, y: this.nuevosUsuarios }];
  }
}
