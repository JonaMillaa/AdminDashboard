import { Component, OnInit, NgModule} from '@angular/core';
import { FirebaseService } from '../../firebase/firebase.service';
import { Chart } from 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: 
  [
    FormsModule,
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './publicaciones.component.html',
  styleUrl: './publicaciones.component.css'
})
export class PublicacionesComponent implements OnInit{

  chart: any;
  stateChart: any;
  publicationChart: any;
  trendChart: any; // Declarar la propiedad para el gráfico de tendencias

  categories = [
    {
      nombre: 'Idiomas y Comunicación',
      subcategorias: ['Traducción e Interpretación', 'Comunicación Digital y Multimedia']
    },
    {
      nombre: 'Administración y Negocios',
      subcategorias: ['Administración de Empresas', 'Contabilidad y Auditoría', 'Marketing']
    },
    {
      nombre: 'Diseño y Arte',
      subcategorias: ['Diseño Gráfico', 'Diseño de Videojuegos', 'Producción Audiovisual']
    },
    {
      nombre: 'Informática',
      subcategorias: ['Desarrollo de Software', 'Inteligencia Artificial y Machine Learning', 'Ciberseguridad', 'Bases de Datos', 'Redes y Telecomunicaciones', 'DevOps y Cloud Computing', 'Desarrollo de Videojuegos', 'Internet de las Cosas (IoT)', 'Automatización y Robótica', 'Tecnologías Emergentes']
    },
    {
      nombre: 'Salud y Ciencias Sociales',
      subcategorias: ['Técnico en Enfermería', 'Terapia Ocupacional', 'Educación Parvularia']
    }
  ];

  states: ('PUBLICADO' | 'ADJUDICACION' | 'NO ADJUDICACION' | 'ADJUDICADO' | 'NO ADJUDICADO' | 'AGENDADO')[] = [
    'PUBLICADO',
    'ADJUDICACION',
    'NO ADJUDICACION',
    'ADJUDICADO',
    'NO ADJUDICADO',
    'AGENDADO'
  ];  

  selectedCategory = this.categories[0].nombre;
  selectedSubcategory = this.categories[0].subcategorias[0];
  selectedState = this.states[0];
  selectedFormat = 'PRESENCIAL'
  showStateModal = false;
  showPublicationModal = false;
  stateModalMessage = '';
  publicationModalMessage = '';

  // Propiedades para el resumen estadístico
  totalPublications: number = 0;
  presencialCount: number = 0;
  virtualCount: number = 0;
  commonState: string = '';

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.loadStateChartData(this.selectedState);
    this.loadChartData(this.selectedCategory, this.selectedSubcategory);
    this.loadTrendChartData();
    this.calculateSummaryStatistics(); 
  }

  calculateSummaryStatistics(): void {
    this.firebaseService.getAllPublications().subscribe(publications => {
      this.totalPublications = publications.length;

      // Contar publicaciones presenciales y virtuales
      this.presencialCount = publications.filter(pub => pub.formato === 'PRESENCIAL').length;
      this.virtualCount = publications.filter(pub => pub.formato === 'VIRTUAL').length;

      // Contar las publicaciones por estado y encontrar el estado más común
      const stateCounts = this.states.reduce((acc, state) => {
        acc[state] = publications.filter(pub => pub.estado === state).length;
        return acc;
      }, {} as { [key: string]: number });

      // Encontrar el estado más común
      this.commonState = Object.keys(stateCounts).reduce((a, b) => stateCounts[a] > stateCounts[b] ? a : b);
    });
  }

  loadChartData(category: string, subcategory: string): void {
    this.firebaseService.getPublicationsByCategoryAndSubcategoryAndFormat(category, subcategory, this.selectedFormat).subscribe(publications => {
      if (publications.length === 0) {
        this.publicationModalMessage = `No hay publicaciones disponibles para la combinación de ${category}, ${subcategory}, y formato ${this.selectedFormat}.`;
        this.showPublicationModal = true;
        if (this.publicationChart) {
          this.publicationChart.destroy();
        }
      } else {
        this.showPublicationModal = false;
        const chartData = this.prepareChartDataByDate(publications);
        this.createBarChart(chartData);
      }
    });
  }

  createBarChart(chartData: any): void {
    const ctx = document.getElementById('publicationChart') as HTMLCanvasElement;
  
    if (ctx) {
      if (this.publicationChart) {
        this.publicationChart.destroy();
      }
  
      this.publicationChart = new Chart(ctx, {
        type: 'bar', // Tipo de gráfico
        data: {
          labels: chartData.labels,
          datasets: [{
            label: 'Publicaciones por Fecha',
            data: chartData.data,
            backgroundColor: 'rgba(54, 162, 235, 0.6)', // Color diferente para las barras del gráfico de publicaciones
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Fechas',
                color: '#666',
                font: {
                  size: 14,
                  weight: 'bold'
                }
              },
              grid: {
                color: 'rgba(200, 200, 200, 0.2)'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Cantidad de Publicaciones',
                color: '#666',
                font: {
                  size: 14,
                  weight: 'bold'
                }
              },
              grid: {
                color: 'rgba(200, 200, 200, 0.2)'
              }
            }
          },
          plugins: {
            legend: { display: true, position: 'top' },
            tooltip: { enabled: true }
          }
        }
      });
    }
  }
  

  prepareChartDataByDate(publications: any[]): any {
    const groupedData: { [date: string]: number } = {};

    publications.forEach(pub => {
      const fecha = pub.fecha_ayudantia; // Asumimos que la fecha está en formato "dd-mm-yyyy"
      if (fecha) {
        if (!groupedData[fecha]) {
          groupedData[fecha] = 0;
        }
        groupedData[fecha]++;
      }
    });

    // Ordenar las fechas y formatear
    const labels = Object.keys(groupedData).sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('-').map(Number);
      const [dayB, monthB, yearB] = b.split('-').map(Number);
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      return dateA.getTime() - dateB.getTime();
    });

    const data = labels.map(label => groupedData[label]);

    return { labels, data };
  }

  loadStateChartData(state: string): void {
    this.firebaseService.getPublicationsByState(state).subscribe(publications => {
      if (publications.length === 0) {
        this.stateModalMessage = `No hay publicaciones disponibles para el estado ${state}.`;
        this.showStateModal = true;
        if (this.stateChart) {
          this.stateChart.destroy();
        }
      } else {
        this.showStateModal = false;
        // Agrupar las publicaciones por fecha y contar las cantidades
        const chartData = this.prepareChartDataByDate(publications);
        this.createStateChart(chartData);
      }
    });
  }

  createStateChart(chartData: any): void {
    const ctx = document.getElementById('stateChart') as HTMLCanvasElement;
  
    if (ctx) {
      if (this.stateChart) {
        this.stateChart.destroy();
      }
  
      this.stateChart = new Chart(ctx, {
        type: 'bar', // Tipo de gráfico
        data: {
          labels: chartData.labels,
          datasets: [{
            label: 'Publicaciones por Estado',
            data: chartData.data,
            backgroundColor: 'rgba(255, 99, 132, 0.6)', // Color diferente para las barras del gráfico de estado
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Fechas',
                color: '#666',
                font: {
                  size: 14,
                  weight: 'bold'
                }
              },
              grid: {
                color: 'rgba(200, 200, 200, 0.2)'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Cantidad de Publicaciones',
                color: '#666',
                font: {
                  size: 14,
                  weight: 'bold'
                }
              },
              grid: {
                color: 'rgba(200, 200, 200, 0.2)'
              }
            }
          },
          plugins: {
            legend: { display: true, position: 'top' },
            tooltip: { enabled: true }
          }
        }
      });
    }
  }  

  closeStateModal(): void {
    this.showStateModal = false;
  }

  closePublicationModal(): void {
    this.showPublicationModal = false;
  }

  onStateChange(event: MatSelectChange): void {
    this.selectedState = event.value;
    this.loadStateChartData(this.selectedState);
  }

  prepareStackedBarChartData(publications: any[]): any {
    const groupedData: { [key: string]: { [state: string]: number } } = {};

    publications.forEach(pub => {
      const categoria = pub.info_ayudantia?.categoria;
      const estado = pub.estado?.toUpperCase();

      if (!groupedData[categoria]) {
        groupedData[categoria] = {
          'PUBLICADO': 0,
          'ADJUDICACION': 0,
          'NO ADJUDICACION': 0,
          'ADJUDICADO': 0,
          'NO ADJUDICADO': 0,
          'AGENDADO': 0
        };
      }

      if (groupedData[categoria][estado] !== undefined) {
        groupedData[categoria][estado]++;
      }
    });

    const labels = Object.keys(groupedData);
    const datasets = this.states.map(state => {
      return {
        label: state,
        data: labels.map(label => groupedData[label][state]),
        backgroundColor: this.getColorForState(state),
        borderWidth: 1
      };
    });

    return { labels, datasets };
  }

  createStackedBarChart(stateData: any, chartId: string = 'stateChart'): void {
    const ctx = document.getElementById(chartId) as HTMLCanvasElement;

    if (ctx) {
      if (chartId === 'stateChart' && this.stateChart) {
        this.stateChart.destroy();
      } else if (chartId === 'publicationChart' && this.publicationChart) {
        this.publicationChart.destroy();
      }

      const newChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: stateData.labels,
          datasets: stateData.datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { stacked: true, title: { display: true, text: 'Categorías' } },
            y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Cantidad de Publicaciones' } }
          },
          plugins: {
            legend: { display: true, position: 'top' },
            tooltip: { enabled: true, mode: 'index', intersect: false }
          }
        }
      });

      if (chartId === 'stateChart') {
        this.stateChart = newChart;
      } else {
        this.publicationChart = newChart;
      }
    }
  }

  getColorForState(state: 'PUBLICADO' | 'ADJUDICACION' | 'NO ADJUDICACION' | 'ADJUDICADO' | 'NO ADJUDICADO' | 'AGENDADO'): string {
    const colors: {
      PUBLICADO: string;
      ADJUDICACION: string;
      'NO ADJUDICACION': string;
      ADJUDICADO: string;
      'NO ADJUDICADO': string;
      AGENDADO: string;
    } = {
      'PUBLICADO': 'rgba(63, 81, 181, 0.5)',
      'ADJUDICACION': 'rgba(255, 159, 64, 0.5)',
      'NO ADJUDICACION': 'rgba(255, 99, 132, 0.5)',
      'ADJUDICADO': 'rgba(54, 162, 235, 0.5)',
      'NO ADJUDICADO': 'rgba(75, 192, 192, 0.5)',
      'AGENDADO': 'rgba(153, 102, 255, 0.5)'
    };
  
    return colors[state] || 'rgba(0, 0, 0, 0.5)';
  }
   
  getSubcategories(): string[] {
    const category = this.categories.find(cat => cat.nombre === this.selectedCategory);
    return category ? category.subcategorias : [];
  }

  onCategoryChange(event: MatSelectChange): void {
    this.selectedCategory = event.value;
    this.selectedSubcategory = this.getSubcategories()[0];
    this.loadChartData(this.selectedCategory, this.selectedSubcategory);
  }

  onSubcategoryChange(event: MatSelectChange): void {
    this.selectedSubcategory = event.value;
    this.loadChartData(this.selectedCategory, this.selectedSubcategory);
  }

  loadTrendChartData(): void {
    this.firebaseService.getAllPublications().subscribe(publications => {
      const chartData = this.prepareChartDataByDate(publications);
      this.createTrendChart(chartData);
    });
  }
  
  createTrendChart(chartData: any): void {
    const ctx = document.getElementById('trendChart') as HTMLCanvasElement;
  
    if (ctx) {
      // Destruir el gráfico si ya existe para evitar problemas de duplicación
      if (this.trendChart) {
        this.trendChart.destroy();
      }
  
      // Crear el gráfico de tendencia de tipo 'line'
      this.trendChart = new Chart(ctx, {
        type: 'line', // Tipo de gráfico
        data: {
          labels: chartData.labels, // Etiquetas de las fechas
          datasets: [{
            label: 'Tendencia de Publicaciones',
            data: chartData.data, // Datos de las publicaciones
            backgroundColor: 'rgba(75, 192, 192, 0.2)', // Color de fondo con transparencia
            borderColor: 'rgba(75, 192, 192, 1)', // Color de la línea
            borderWidth: 2,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Fechas',
                color: '#666',
                font: {
                  size: 14,
                  weight: 'bold'
                }
              },
              grid: {
                color: 'rgba(200, 200, 200, 0.2)'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Cantidad de Publicaciones',
                color: '#666',
                font: {
                  size: 14,
                  weight: 'bold'
                }
              },
              grid: {
                color: 'rgba(200, 200, 200, 0.2)'
              }
            }
          },
          plugins: {
            legend: { display: true, position: 'top' },
            tooltip: { enabled: true }
          }
        }
      });
    }
  }
  

  onFormatChange(event: MatSelectChange): void {
    this.selectedFormat = event.value;
    this.loadChartData(this.selectedCategory, this.selectedSubcategory);
  }

}
