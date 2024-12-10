import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { FirebaseService } from '../../../firebase/firebase.service';
import { InterfacePostulacion } from '../../../models/interface-postulacion';
import { Publicacion } from '../../../models/publicacion.interface';
import { Observable } from 'rxjs';
import { map, combineLatestWith } from 'rxjs/operators';
import { Chart } from 'chart.js';
import { isPlatformBrowser } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-costos-ingresos',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './costos-ingresos.component.html',
  styleUrls: ['./costos-ingresos.component.css']
})
export class CostosIngresosComponent implements OnInit {
  publicaciones$!: Observable<Publicacion[]>;
  postulaciones$!: Observable<InterfacePostulacion[]>;
  chartData: any[] = [];
  chart: any;
  filtroTipo: string = 'Mes'; // Controla si mostramos los datos por mes o por año
  anioSeleccionado: number = new Date().getFullYear(); // Año seleccionado (por defecto el actual)

  constructor(
    private firebaseService: FirebaseService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.postulaciones$ = this.firebaseService.getAllPostulaciones();
    this.publicaciones$ = this.firebaseService.getAllPublications();

    this.loadCostosIngresos();
  }

  // Cargar los ingresos según el filtro de visualización (Mes o Año)
  loadCostosIngresos(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.publicaciones$.pipe(
        combineLatestWith(this.postulaciones$),
        map(([publicaciones, postulaciones]) => {
          // Filtrar solo las publicaciones que estén "FINALIZADAS"
          publicaciones = publicaciones.filter(pub => pub.estado === 'FINALIZADA');

          const ingresosPorMes: { [key: string]: number } = {};
          const ingresosPorAnio: { [key: string]: number } = {};

          publicaciones.forEach(publicacion => {
            const postulacionesFiltradas = postulaciones.filter(postulacion => {
              return postulacion.id_publicacion === publicacion.id_publicacion &&
                     postulacion.estado_postulacion === 'REALIZADA';
            });

            const duracion = parseInt(publicacion.duracion, 10);
            const precioTotal = postulacionesFiltradas.reduce((acc, curr) => {
              const precio = parseFloat(curr.precio);
              return acc + (precio * duracion);
            }, 0);

            if (precioTotal > 0) {
              const fechaParts = publicacion.fecha_ayudantia.split('-');
              const fecha = new Date(`${fechaParts[2]}-${fechaParts[1]}-${fechaParts[0]}`);
              const mes = fecha.toLocaleString('default', { month: 'long' });
              const anio = fecha.getFullYear();

              // Si se seleccionó "Mes", solo mostrar el mes del año actual
              if (this.filtroTipo === 'Mes' && anio === this.anioSeleccionado) {
                const key = `${mes} ${anio}`;
                ingresosPorMes[key] = (ingresosPorMes[key] || 0) + precioTotal;
              } else if (this.filtroTipo === 'Año') {
                const key = `${anio}`;
                ingresosPorAnio[key] = (ingresosPorAnio[key] || 0) + precioTotal;
              }
            }
          });

          // Convertir los datos a formato adecuado para el gráfico
          if (this.filtroTipo === 'Mes') {
            this.chartData = Object.keys(ingresosPorMes).map(key => ({
              mes: key,
              ingresos: ingresosPorMes[key],
            }));
          } else {
            this.chartData = Object.keys(ingresosPorAnio).map(key => ({
              anio: key,
              ingresos: ingresosPorAnio[key],
            }));
          }

          if (this.chartData.length > 0) {
            this.renderChart();
          }
        })
      ).subscribe();
    }
  }

  // Método para renderizar el gráfico
  renderChart(): void {
    const ctx = document.getElementById('costosIngresosChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error('No se encontró el canvas en el DOM');
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx.getContext('2d')!, {
      type: 'bar',
      data: {
        labels: this.filtroTipo === 'Mes' ?
          this.chartData.map(data => data.mes) :
          this.chartData.map(data => data.anio),
        datasets: [{
          label: this.filtroTipo === 'Mes' ? 'Ingresos Mensuales' : 'Ingresos Anuales',
          data: this.chartData.map(data => data.ingresos),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
          x: {
            ticks: {
              font: {
                family: 'Arial',
                size: 14,
                weight: 'bold'
              },
              color: '#333'
            }
          }
        }
      }
    });
  }
}