import { Component, OnInit } from '@angular/core';
import { Chart, TooltipItem } from 'chart.js';
import { collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { collection } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { ChartOptions, ChartData, ChartType } from 'chart.js';  // Asegúrate de importar los tipos correctos
import ChartDataLabels from 'chartjs-plugin-datalabels';  // Importar el plugin de datalabels

Chart.register(ChartDataLabels); // Registrar el plugin de datalabels

@Component({
  selector: 'app-kpi-publicaciones',
  standalone: true,
  imports: [],
  templateUrl: './kpi-publicaciones.component.html',
  styleUrl: './kpi-publicaciones.component.css'
})
export class KpiPublicacionesComponent implements OnInit {

  publicaciones$: Observable<any[]>;
  chart: Chart | undefined; // Guardamos la referencia del gráfico para no redibujarlo múltiples veces

  constructor(private firestore: Firestore) {
    this.publicaciones$ = this.getPublications();
  }

  ngOnInit(): void {
    this.publicaciones$.subscribe(publicaciones => {
      // Si el gráfico ya existe, destrúyelo
      if (this.chart) {
        this.chart.destroy();
      }
      this.generarGrafico(publicaciones);
      this.generarGraficoTaximetro(publicaciones); // Crear el termómetro
    });
  }

  // Función para obtener las publicaciones
  getPublications(): Observable<any[]> {
    const publicationsCollection = collection(this.firestore, 'Publicaciones');
    return collectionData(publicationsCollection) as Observable<any[]>;
  }

  // Función para generar el gráfico de torta
  generarGrafico(publicaciones: any[]): void {
    let finalizadas = 0;
    let noFinalizadas = 0;

    // Iteramos sobre las publicaciones para verificar el valor de 'state' y contar las finalizadas
    publicaciones.forEach(pub => {
      if (pub.estado && pub.estado.trim().toUpperCase() === 'FINALIZADA') {
        finalizadas++;
      } else {
        noFinalizadas++;
      }
    });

    // Si no hay datos, no mostramos nada
    if (finalizadas === 0 && noFinalizadas === 0) {
      console.log("No hay publicaciones para mostrar");
      return;
    }

    // Preparar los datos para el gráfico
    const chartData: ChartData = {
      labels: ['Finalizado', 'Otros Estados'],
      datasets: [{
        label: 'Estado de las Publicaciones',
        data: [finalizadas, noFinalizadas],
        backgroundColor: ['#36A2EB', '#FF6384'],
        borderColor: ['#36A2EB', '#FF6384'],
        borderWidth: 1
      }]
    };

    // Opciones del gráfico
    const chartOptions: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1500, // Duración de la animación en milisegundos
        easing: 'easeInOutQuad' // Efecto de easing para la animación
      },
      plugins: {
        title: {
          display: true,
          text: 'Distribución del Estado de las Publicaciones', // Título del gráfico
          font: {
            size: 20
          },
          padding: 20
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem: TooltipItem<'pie'>) => {
              if (typeof tooltipItem.raw === 'number') {
                const percentage = (tooltipItem.raw / publicaciones.length * 100).toFixed(2);
                return `${tooltipItem.label}: ${percentage}%`;
              } else {
                return 'Dato no disponible';
              }
            }
          }
        },
        legend: {
          display: true,
          position: 'top', // Posición de la leyenda
          labels: {
            font: {
              size: 20
            }
          }
        },
        datalabels: {
          color: '#fff', // Color del texto de las etiquetas
          font: {
            weight: 'bold',
            size: 14
          },
          formatter: (value: number, ctx: any) => {
            const total = ctx.dataset.data.reduce((acc: number, val: number) => acc + val, 0);
            const percentage = ((value / total) * 100).toFixed(2);
            return `${percentage}%`; // Muestra el porcentaje
          }
        }
      }
    };

    // Crear el gráfico de torta
    const ctx = document.getElementById('kpiChart') as HTMLCanvasElement;
    if (ctx) {
      if (this.chart) {
        this.chart.destroy();
      }
      this.chart = new Chart(ctx, {
        type: 'pie' as ChartType,
        data: chartData,
        options: chartOptions
      });
    }
  }

  // Función para generar el gráfico de tipo taxímetro con cambio de color dinámico
generarGraficoTaximetro(publicaciones: any[]): void {
  let finalizadas = 0;

  // Contamos las publicaciones finalizadas
  publicaciones.forEach(pub => {
    if (pub.estado && pub.estado.trim().toUpperCase() === 'FINALIZADA') {
      finalizadas++;
    }
  });

  // Meta total de ayudantías
  const totalMeta = 100;

  // Validación de datos
  if (publicaciones.length === 0) {
    console.warn('No hay publicaciones disponibles.');
    return;
  }

  // Calcular porcentaje de finalización
  const porcentaje = (finalizadas / totalMeta) * 100;

  // Determinar el color dinámico según el porcentaje
  const colorProgreso = porcentaje >= 60 ? '#00ff00' : '#ff0000'; // Verde si >= 60%, Rojo si < 60%

  // Crear el gráfico de tipo taxímetro con Chart.js
  const ctx = document.getElementById('termometro') as HTMLCanvasElement;
  if (ctx) {
    new Chart(ctx, {
      type: 'doughnut',  // Tipo de gráfico
      data: {
        labels: ['Finalizadas', 'Faltantes'],
        datasets: [{
          data: [porcentaje, 100 - porcentaje], // Porcentaje completado y faltante
          backgroundColor: [colorProgreso, '#e0e0e0'], // Color dinámico y gris para faltantes
          borderWidth: 0 // Sin borde
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        rotation: 270, // Rotación inicial (para que comience desde el sur)
        circumference: 180, // Mostrar solo la mitad del gráfico (semicírculo)
        plugins: {
          title: {
            display: true,
            text: `Ayudantías Finalizadas: ${finalizadas} de ${totalMeta}`, // Título dinámico
            font: {
              size: 18
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw as number;
                return `Porcentaje: ${value.toFixed(2)}%`; // Mostrar porcentaje en el tooltip
              }
            }
          },
          datalabels: {
            color: '#000', // Color del texto
            font: {
              size: 16,
              weight: 'bold'
            },
            formatter: (value) => `${value.toFixed(2)}%` // Mostrar porcentaje dentro del gráfico
          }
        }
      }
    });
  }
}




}
