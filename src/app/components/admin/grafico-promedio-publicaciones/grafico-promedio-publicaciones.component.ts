import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { collection, query, where, collectionData } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms'; // Asegúrate de importar FormsModule
import { MatFormField } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

// Gráfico
import { Chart } from 'chart.js'; 

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
    FormsModule,
    MatFormField,
    MatSelectModule,
    CommonModule,
  ],
  templateUrl: './grafico-promedio-publicaciones.component.html',
  styleUrl: './grafico-promedio-publicaciones.component.css'
})

export class GraficoPromedioPublicacionesComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['categoria', 'promedioDuracion', 'fecha'];
  dataSource: MatTableDataSource<PromedioPorCategoria> = new MatTableDataSource<PromedioPorCategoria>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild('graficoPromedio', { static: false }) graficoPromedio: any; 

  constructor(private firestore: Firestore) {}

  ngOnInit(): void {
    this.getFinalizedPublicaciones().subscribe((publicaciones) => {
      const promediosPorCategoria = this.calcularPromedioPorCategoria(publicaciones);
      this.dataSource.data = promediosPorCategoria;
  
      if (promediosPorCategoria && promediosPorCategoria.length > 0) {
        this.promedios = promediosPorCategoria; // Guarda los promedios calculados
        this.renderChart(promediosPorCategoria); // Renderiza el gráfico inicial
      } else {
        console.error('No hay datos para el gráfico');
      }
    });

    // Cargar categorías dinámicamente
    this.getCategorias().subscribe(categorias => {
      this.categorias = categorias;
    });
  }

  ngAfterViewInit(): void {
    if (this.graficoPromedio) {
      this.renderChart(this.promedios);
    }
  }

  getFinalizedPublicaciones(): Observable<any[]> {
    const publicacionesRef = collection(this.firestore, 'Publicaciones');
    const q = query(publicacionesRef, where('estado', '==', 'FINALIZADA'));
    return collectionData(q, { idField: 'ID' });
  }

  getCategorias(): Observable<string[]> {
    const publicacionesRef = collection(this.firestore, 'Publicaciones');
    const q = query(publicacionesRef, where('estado', '==', 'FINALIZADA'));
    return collectionData(q, { idField: 'ID' }).pipe(map((publicaciones: any[]) => {
      return Array.from(new Set(publicaciones.map(pub => pub.info_ayudantia.categoria)));
    }));
  }
  
  calcularPromedioPorCategoria(publicaciones: any[]): PromedioPorCategoria[] {
    const categorias: { [key: string]: { duraciones: number[]; fechas: string[] } } = {};

    publicaciones.forEach(publicacion => {
      const duracion = parseInt(publicacion.duracion, 10);
      const fecha = publicacion.fecha_ayudantia;  // Fecha completa (día-mes-año)
      const categoria = publicacion.info_ayudantia.categoria;

      if (!isNaN(duracion)) {
        if (!categorias[categoria]) {
          categorias[categoria] = { duraciones: [], fechas: [] };
        }
        categorias[categoria].duraciones.push(duracion);
        categorias[categoria].fechas.push(fecha);
      }
    });

    const promedioPorCategoria: PromedioPorCategoria[] = [];
    for (const categoria in categorias) {
      if (categorias.hasOwnProperty(categoria)) {
        const duraciones = categorias[categoria].duraciones;
        const fechas = Array.from(new Set(categorias[categoria].fechas));  // Fechas únicas
        fechas.forEach(fecha => {
          const publicacionesPorFecha = duraciones.filter((_, index) => categorias[categoria].fechas[index] === fecha);
          const promedio = publicacionesPorFecha.length > 1 
            ? (publicacionesPorFecha.reduce((sum, val) => sum + val, 0) / publicacionesPorFecha.length)
            : publicacionesPorFecha[0]; // Si solo hay una publicación, el promedio es igual a su duración
          
          promedioPorCategoria.push({
            categoria,
            promedioDuracion: promedio.toFixed(2), // Convertimos el promedio a 2 decimales
            fecha,
          });
        });
      }
    }

    return promedioPorCategoria;
  }

  publicaciones: any[] = [];
  categorias: string[] = [];
  fechas: string[] = [];
  chart: any;
  promedios: PromedioPorCategoria[] = [];
  selectedCategory: string = ''; // Para almacenar la categoría seleccionada

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

  getCategoriasData() {
    const fechas = Array.from(new Set(this.promedios.flatMap((p: any) => p.fechas)))
      .sort((a, b) => {
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

  onCategoryChange(): void {
    // Filtrar los datos según la categoría seleccionada
    const filteredData = this.promedios.filter(item => item.categoria === this.selectedCategory);
    this.renderChart(filteredData);  // Renderiza el gráfico solo con los datos filtrados
  }

  // Método que restablece la selección de categoría y muestra todas las categorías
  mostrarTodasCategorias(): void {
    this.selectedCategory = '';  // Restablecer la categoría seleccionada
    this.renderChart(this.promedios);  // Renderizar el gráfico con todos los datos
  }

  renderChart(data: any[]): void {
    if (!data || data.length === 0) {
      console.error('No hay datos disponibles para renderizar el gráfico.');
      return;
    }
  
    const ctx = this.graficoPromedio.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('No se pudo obtener el contexto del canvas.');
      return;
    }
  
    // Si el gráfico ya existe, destrúyelo antes de crear uno nuevo
    if (this.chart) {
      this.chart.destroy();
    }
  
    const fechas = Array.from(new Set(data.flatMap((d: any) => d.fecha)))
      .sort((a, b) => {
        const dateA = new Date(a.split('-').reverse().join('-'));
        const dateB = new Date(b.split('-').reverse().join('-'));
        return dateA.getTime() - dateB.getTime();
      });
  
    // Preparamos los datasets para cada categoría
    const datasets = data.map((item: any) => {
      const valores = fechas.map(fecha => {
        const promedio = item.fecha === fecha ? parseFloat(item.promedioDuracion) : null;
        return promedio;
      });
  
      return {
        label: item.categoria,
        data: valores,
        backgroundColor: this.getRandomColor(),  // Color de fondo dinámico
        borderColor: 'rgba(0, 0, 0, 0.2)', // Color del borde de las barras
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(0, 123, 255, 0.6)', // Color cuando se hace hover
        hoverBorderColor: 'rgba(0, 123, 255, 1)', // Color del borde al hacer hover
        hoverBorderWidth: 2, // Ancho del borde al hacer hover
        fill: true, // Llenar las barras
        barThickness: 20, // Grosor de las barras
      };
    });
  
    // Creación del gráfico
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: fechas,
        datasets: datasets,
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'category',
            offset: true, // Centra las barras en el eje X
          },
          y: {
            suggestedMin: 0,
            ticks: {
              stepSize: 1, // Los valores en el eje Y serán enteros
            },
            title: {
              display: true,
              text: 'Cantidad de publicaciones',
              font: {
                size: 14,
                weight: 'bold',
              },
              color: '#333',
            },
          },
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: {
                size: 14,
                weight: 'bold',
              },
              color: '#333',
            },
          },
        },
        interaction: {
          mode: 'nearest', // Interacción más predecible para el hover
          axis: 'x', // Hacer que el hover se detecte solo en el eje X
          intersect: true, // Requiere intersección exacta para activar el hover
        },
        onClick: (event: any, elements: any[]) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const category = this.chart.data.labels[index];
          }
        },
        onHover: (event: any, elements: any[]) => {
          if (elements.length > 0) {
            const index = elements[0].index;
          }
        },
      },
    });
  }
    
  
  // Método para obtener un color aleatorio para las barras
  getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  
}
