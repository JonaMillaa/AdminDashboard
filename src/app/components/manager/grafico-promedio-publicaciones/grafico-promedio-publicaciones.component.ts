import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Observable } from 'rxjs';
import { collection, query, where, collectionData } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';

//Gráfico
import { Chart } from 'chart.js'; // Importamos Chart.js

interface PromedioPorCategoria {
  categoria: string;
  promedioDuracion: string;
  fecha: string;
}

@Component({
  selector: 'app-grafico-promedio-publicaciones',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,

  ],
  templateUrl: './grafico-promedio-publicaciones.component.html',
  styleUrl: './grafico-promedio-publicaciones.component.css'
})

export class GraficoPromedioPublicacionesComponent implements OnInit, AfterViewInit {
  // Definir los datos que se mostrarán en la tabla
  displayedColumns: string[] = ['categoria', 'promedioDuracion', 'fecha'];
  // Inicializar dataSource con el tipo adecuado
  dataSource: MatTableDataSource<PromedioPorCategoria> = new MatTableDataSource<PromedioPorCategoria>([]);

  // Obtener la referencia del paginator
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;

  constructor(private firestore: Firestore) {}

  ngOnInit(): void {
    this.getFinalizedPublicaciones().subscribe((publicaciones) => {
      this.publicaciones = publicaciones;
      const promediosPorCategoria = this.calcularPromedioPorCategoria(publicaciones);
      this.dataSource.data = promediosPorCategoria;
      
      // Preparar los datos para el gráfico
      this.prepareChartData(promediosPorCategoria);
      this.renderChart();
    });
  }

  // Método para ejecutar cuando la vista esté completamente cargada
  ngAfterViewInit(): void {
    // Crear el gráfico cuando la vista esté completamente cargada
    // this.dibujarGrafico();

  }

  //tabla
  // Función para obtener las publicaciones finalizadas de Firebase
  getFinalizedPublicaciones(): Observable<any[]> {
    const publicacionesRef = collection(this.firestore, 'Publicaciones');
    const q = query(publicacionesRef, where('estado', '==', 'FINALIZADA'));
    return collectionData(q, { idField: 'ID' });
  }

  // Función para calcular el promedio de duración por categoría
  // Función para calcular el promedio de duración por categoría
  calcularPromedioPorCategoria(publicaciones: any[]): PromedioPorCategoria[] {
    const categorias: { [key: string]: { totalDuracion: number; count: number; fecha: string } } = {};

    publicaciones.forEach(publicacion => {
      const duracion = parseInt(publicacion.duracion, 10);
      if (!isNaN(duracion)) {
        if (!categorias[publicacion.info_ayudantia.categoria]) {
          categorias[publicacion.info_ayudantia.categoria] = { totalDuracion: 0, count: 0, fecha: publicacion.fecha_ayudantia };
        }
        categorias[publicacion.info_ayudantia.categoria].totalDuracion += duracion;
        categorias[publicacion.info_ayudantia.categoria].count++;
      }
    });

    const promedioPorCategoria: PromedioPorCategoria[] = [];
    for (const categoria in categorias) {
      if (categorias.hasOwnProperty(categoria)) {
        const promedio = categorias[categoria].totalDuracion / categorias[categoria].count;
        promedioPorCategoria.push({
          categoria: categoria,
          promedioDuracion: promedio.toFixed(2),
          fecha: categorias[categoria].fecha
        });
      }
    }

    const convertirFecha = (fecha: string): Date => {
      const [dia, mes, anio] = fecha.split('-');
      return new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));
    };

    promedioPorCategoria.sort((a, b) => {
      const fechaA = convertirFecha(a.fecha);
      const fechaB = convertirFecha(b.fecha);
      return fechaB.getTime() - fechaA.getTime(); // De la más reciente a la más antigua
    });

    return promedioPorCategoria;
  }


  //Gráfico

  publicaciones: any[] = [];
  categorias: string[] = [];
  fechas: string[] = [];
  // promedios: number[] = [];
  chart: any;
  promedios: PromedioPorCategoria[] = [];
  @ViewChild('graficoPromedio') graficoPromedio: any;

  // Función para preparar los datos para el gráfico
  prepareChartData(promediosPorCategoria: PromedioPorCategoria[]): void {
    this.categorias = [];
    this.fechas = [];
    const promediosNumericos: number[] = []; // Arreglo temporal para los valores numéricos


    promediosPorCategoria.forEach(item => {
      this.categorias.push(item.categoria);
      this.fechas.push(item.fecha);
      promediosNumericos.push(parseFloat(item.promedioDuracion)); // Convertimos el promedio a número
  
    });
  }

  // Función para renderizar el gráfico
  renderChart(): void {
    const ctx = (this.graficoPromedio.nativeElement as HTMLCanvasElement).getContext('2d');
    if (!ctx) {
      console.error('No se pudo obtener el contexto del canvas');
      return;  // Si el contexto es null, no intentamos crear el gráfico
    }

    // Si el gráfico ya existe, lo destruimos antes de crear uno nuevo
    if (this.chart) {
      this.chart.destroy();
    }

    // Preparar los datos para el gráfico
    const categoriasData = this.getCategoriasData();  // Método para obtener las categorías y sus datos
    const labels = categoriasData.dates;  // Fechas en formato 'dd-mm-yyyy'

    // Generar las datasets dinámicamente con las categorías
    const datasets = categoriasData.categories.map((categoria, index) => ({
      label: categoria,
      data: categoriasData.data[categoria],
      fill: false,  // No llenar el área bajo la curva
      borderColor: this.getRandomColor(),  // Color aleatorio para cada categoría
      tension: 0.1,  // Suavizar la línea
    }));

    // Crear el gráfico con los datos y opciones
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Fecha'
            },
            ticks: {
              callback: function(value) {
                const date = new Date(value);
                return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
              }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Promedio Duración'
            },
            beginAtZero: false, // Para que no siempre empiece en cero
          }
        }
      }
    });
  }

  getCategoriasData() {
    const fechas = Array.from(new Set(this.promedios.map(p => p.fecha))).sort((a, b) => {
      const dateA = new Date(a.split('-').reverse().join('-'));
      const dateB = new Date(b.split('-').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });
  
    const categories = Array.from(new Set(this.promedios.map(p => p.categoria)));
  
    const data: { [key: string]: (number | null)[] } = {};
    categories.forEach(category => {
      data[category] = fechas.map(fecha => {
        const promedio = this.promedios.find(p => p.categoria === category && p.fecha === fecha);
        return promedio ? parseFloat(promedio.promedioDuracion) : null;
      });
    });
  
    return {
      dates: fechas,
      categories: categories,
      data: data
    };
  }
  


// Método para generar colores aleatorios para las líneas
getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

}
