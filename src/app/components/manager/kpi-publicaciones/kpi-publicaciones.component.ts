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
      this.generarTermometro(publicaciones); // Crear el termómetro
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

// Función para generar el termómetro
dibujarTermometro(porcentaje: number): void {
  const canvas = document.getElementById('termometroCanvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error("Canvas no encontrado.");
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error("No se pudo obtener el contexto 2D del canvas.");
    return;
  }

  // Dimensiones y configuración del termómetro
  const x0 = 250; // Centro del círculo
  const y0 = 250; // Línea base del termómetro
  const radius = 200; // Radio del termómetro
  const degrees = (porcentaje / 100) * Math.PI; // Convertimos porcentaje a radianes

  // Limpiar el canvas antes de redibujar
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dibujar el marco del termómetro
  ctx.beginPath();
  ctx.arc(x0, y0, radius, Math.PI, 2 * Math.PI);
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#000';
  ctx.stroke();
  ctx.closePath();

  // Dibujar el nivel actual del termómetro según el porcentaje
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.arc(x0, y0, radius - 10, Math.PI, Math.PI + degrees);
  ctx.fillStyle = 'rgba(0, 100, 255, 0.8)'; // Azul para el nivel actual
  ctx.fill();
  ctx.closePath();

  // Añadir texto del porcentaje
  ctx.font = '20px Arial';
  ctx.fillStyle = '#000';
  ctx.fillText(`${Math.round(porcentaje)}%`, x0 - 20, y0 - radius - 20);
}

dibujarPrueba(): void {
  const canvas = document.getElementById('termometroCanvas1') as HTMLCanvasElement;
  if (!canvas) {
    console.error("Canvas no encontrado.");
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error("No se pudo obtener el contexto 2D del canvas.");
    return;
  }

  // Dibujar un rectángulo básico como prueba
  ctx.fillStyle = 'blue';
  ctx.fillRect(50, 50, 100, 100);
}


// Calcular porcentaje de publicaciones "FINALIZADAS"
calcularPorcentaje(publicaciones: any[]): number {
  const total = publicaciones.length;
  const finalizadas = publicaciones.filter(pub => pub.estado && pub.estado.trim().toUpperCase() === 'FINALIZADA').length;
  return total > 0 ? (finalizadas / total) * 100 : 0;
}








  // Función para generar el termómetro
  generarTermometro(publicaciones: any[]): void {
    let finalizadas = 0;

    // Contamos las publicaciones finalizadas
    publicaciones.forEach(pub => {
      if (pub.estado && pub.estado.trim().toUpperCase() === 'FINALIZADA') {
        finalizadas++;
      }
    });

    // Calcular el porcentaje de finalizadas
    const porcentajeFinalizadas = (finalizadas / publicaciones.length) * 100;

    // Crear el gráfico de termómetro con Chart.js
    const ctx = document.getElementById('termometro') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',  // Tipo de gráfico
        data: {
          labels: ['Finalizado', 'Pendiente'],
          datasets: [{
            data: [porcentajeFinalizadas, 100 - porcentajeFinalizadas],
            backgroundColor: ['#36A2EB', '#FF6384'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '80%',  // Corte para hacer el termómetro
          rotation: -Math.PI / 2,  // Rotación para hacer el gráfico vertical
          circumference: Math.PI,  // Solo dibuja la mitad para simular un termómetro
          plugins: {
            title: {
              display: true,
              text: `${Math.round(porcentajeFinalizadas)}% Finalizadas`,  // Título que muestra el porcentaje
              font: {
                size: 18
              }
            },
            tooltip: {
              enabled: false  // Desactivar tooltips
            },
            datalabels: {
              color: '#fff',
              font: {
                size: 16,
                weight: 'bold'
              },
              formatter: (value: number) => {
                return `${Math.round(value)}%`;  // Mostrar porcentaje dentro del gráfico
              }
            }
          }
        }
      });

      // Actualizar el porcentaje en el div
      const porcentajeDiv = document.getElementById('porcentaje');
      if (porcentajeDiv) {
        porcentajeDiv.textContent = `${Math.round(porcentajeFinalizadas)}%`;
      }
    }
  }
  
}
