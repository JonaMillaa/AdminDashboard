import { Component, OnInit,Inject, PLATFORM_ID} from '@angular/core';
import { FirebaseService } from '../../../firebase/firebase.service';
import { Chart } from 'chart.js/auto';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, FormControl } from '@angular/forms';


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
    ReactiveFormsModule,

  ],
  templateUrl: './publicaciones.component.html',
  styleUrl: './publicaciones.component.css'
})
export class PublicacionesComponent implements OnInit{

  chart: any;
  stateChart: any;
  publicationChart: any;
  trendChart: any;

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

  states: ('PUBLICADO' | 'ADJUDICADO'|'EN_CURSO'|'AGENDADA'| 'NO ADJUDICACION' | 'ADJUDICACION' | 'NO ADJUDICADO')[] = [
    'PUBLICADO',
    'ADJUDICADO',
    'EN_CURSO',
    'AGENDADA',
    'NO ADJUDICACION',
    'ADJUDICACION',
    'NO ADJUDICADO'
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

  selectedTimeRange = 'month'; // Inicializamos el filtro en 'month'

  constructor(
    private firebaseService: FirebaseService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}
  

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
    this.loadTrendChartData(this.selectedFormat);
    this.loadStateChartData(this.selectedState, 'month');
    this.loadChartData(this.selectedCategory, this.selectedSubcategory);
    this.calculateSummaryStatistics();
    }
  }

  calculateSummaryStatistics(): void {
    this.firebaseService.getAllPublications().subscribe(publications => {
      this.totalPublications = publications.length;

      // Contar publicaciones presenciales y virtuales
      this.presencialCount = publications.filter(pub => pub.formato === 'PRESENCIAL').length;
      this.virtualCount = publications.filter(pub => pub.formato === 'REMOTO').length;

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
    this.firebaseService.getPublicationsByCategoryAndSubcategory(category, subcategory).subscribe(publications => {
      if (publications.length === 0) {
        this.publicationModalMessage = `No hay publicaciones disponibles para la combinación de ${category}, ${subcategory}.`;
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
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
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
    const groupedData: { [date: string]: { count: number; titles: string[] } } = {};
    publications.forEach(pub => {
      const dateStr = pub.fecha_ayudantia;
      const titulo = pub.info_ayudantia?.titulo_ayudantia;

      if (dateStr && titulo) {
        const [day, month, year] = dateStr.split('-').map((part: string) => parseInt(part, 10));
        const formattedDateStr = `${day.toString().padStart(2, '0')}-${(month).toString().padStart(2, '0')}-${year}`;

        if (!groupedData[formattedDateStr]) {
          groupedData[formattedDateStr] = { count: 0, titles: [] };
        }
        groupedData[formattedDateStr].count++;
        groupedData[formattedDateStr].titles.push(titulo);
      }
    });

    const labels = Object.keys(groupedData).sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('-').map((part: string) => parseInt(part, 10));
      const [dayB, monthB, yearB] = b.split('-').map((part: string) => parseInt(part, 10));

      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);

      return dateA.getTime() - dateB.getTime();
    });

    const data = labels.map(label => groupedData[label].count);
    const titles = labels.map(label => groupedData[label].titles);

    return { labels, data, titles };
  }

  onTimeRangeChange(event: MatSelectChange): void {
    this.selectedTimeRange = event.value;
    this.loadStateChartData(this.selectedState, this.selectedTimeRange);
  }

  loadStateChartData(state: string, timeRange: string): void {
    this.firebaseService.getPublicationsByState(state).subscribe(publications => {
      if (publications.length === 0) {
        this.stateModalMessage = `No hay publicaciones disponibles para el estado ${state}.`;
        this.showStateModal = true;
        if (this.stateChart) {
          this.stateChart.destroy();
        }
      } else {
        this.showStateModal = false;
        // Preparar los datos según el rango de tiempo seleccionado
        const chartData = this.prepareChartDataByTimeRange(publications, timeRange);
        this.createStateChart(chartData);
      }
    });
  }

  prepareChartDataByTimeRange(publications: any[], timeRange: string): any {
    // Definimos todos los meses en español
    const allMonths = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const groupedData: { [key: string]: number } = {};

    // Dependiendo del rango de tiempo, inicializamos groupedData con etiquetas adecuadas
    if (timeRange === 'month') {
      allMonths.forEach(month => {
        groupedData[month] = 0;
      });
    } else if (timeRange === 'year') {
      // Obtener un rango de años relevante basado en las publicaciones o un intervalo fijo
      const currentYear = new Date().getFullYear();
      for (let year = currentYear - 1; year <= currentYear; year++) {
        groupedData[year.toString()] = 0;
      }
    } else if (timeRange === 'week') {
      // Inicializar las semanas del año (del 1 al 52)
      for (let week = 1; week <= 52; week++) {
        groupedData[`Semana ${week}`] = 0;
      }
    }

    publications.forEach(pub => {
      const dateStr = pub.fecha_ayudantia;
      const [day, month, year] = dateStr.split('-').map((part: string) => parseInt(part, 10));
      const date = new Date(year, month - 1, day);

      let key: string;
      switch (timeRange) {
        case 'year':
          key = date.getFullYear().toString();
          break;
        case 'month':
          key = this.getMonthName(month); // Obtener el nombre del mes
          break;
        case 'week':
          const weekNumber = this.getWeekNumber(date);
          key = `Semana ${weekNumber}`;
          break;
        case 'day':
        default:
          key = `${day.toString().padStart(2, '0')}-${(month).toString().padStart(2, '0')}-${year}`;
          break;
      }

      if (groupedData[key] !== undefined) {
        groupedData[key]++;
      }
    });

    // Obtener las etiquetas (keys) en el orden adecuado para cada rango de tiempo
    let labels = Object.keys(groupedData);
    if (timeRange === 'month') {
      labels = allMonths;
    } else if (timeRange === 'year') {
      labels.sort((a, b) => parseInt(a) - parseInt(b));
    }

    const data = labels.map(label => groupedData[label]);

    return { labels, data };
  }

  // Función para obtener el nombre del mes
  getMonthName(month: number): string {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return monthNames[month - 1]; // Ajuste para los meses base 0
  }

  // Función para calcular el número de semana de una fecha
  getWeekNumber(d: Date): number {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }


  createStateChart(chartData: any): void {
    const ctx = document.getElementById('stateChart') as HTMLCanvasElement;

    if (ctx) {
      if (this.stateChart) {
        this.stateChart.destroy();
      }

      this.stateChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: chartData.labels,
          datasets: [{
            label: 'Publicaciones por Estado',
            data: chartData.data,
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
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
                text: 'Meses',
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
    this.loadStateChartData(this.selectedState, 'month');
  }

  prepareStackedBarChartData(publications: any[]): any {
    const groupedData: { [key: string]: { [state: string]: number } } = {};

    publications.forEach(pub => {
      const categoria = pub.info_ayudantia?.categoria;
      const estado = pub.estado?.toUpperCase();

      if (!groupedData[categoria]) {
        groupedData[categoria] = {
          'PUBLICADO': 0,
          'ADJUDICADO': 0,
          'EN_CURSO': 0,
          'AGENDADA': 0,
          'NO ADJUDICACION': 0,
          'ADJUDICACION': 0,
          'NO ADJUDICADO': 0
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

  getColorForState(state:
    'PUBLICADO'
    | 'ADJUDICADO'
    | 'EN_CURSO'
    | 'AGENDADA'
    | 'NO ADJUDICACION'
    | 'ADJUDICACION'
    | 'NO ADJUDICADO'):
    string {const colors: {
      PUBLICADO: string;
      ADJUDICADO: string;
      EN_CURSO: string;
      AGENDADA: string;
      'NO ADJUDICACION': string;
      ADJUDICACION: string;
      'NO ADJUDICADO': string;
    } = {
      'PUBLICADO': 'rgba(63, 81, 181, 0.5)',
      'ADJUDICADO': 'rgba(255, 159, 64, 0.5)',
      'EN_CURSO': 'rgba(255, 99, 132, 0.5)',
      'AGENDADA': 'rgba(54, 162, 235, 0.5)',
      'NO ADJUDICACION': 'rgba(75, 192, 192, 0.5)',
      'ADJUDICACION': 'rgba(153, 102, 255, 0.5)',
      'NO ADJUDICADO': 'rgba(153, 102, 255, 0.5)'
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

  loadTrendChartData(format: string): void {
    this.firebaseService.getPublicationsByFormat(format).subscribe(publications => {
      const chartData = this.prepareChartDataByDate(publications);
      this.createTrendChart(chartData);
    });
  }

  createTrendChart(chartData: any): void {
    if (typeof window !== 'undefined') {
      const ctx = document.getElementById('trendChart') as HTMLCanvasElement;
      if (ctx) {
        if (this.trendChart) {
          this.trendChart.destroy();
        }

        this.trendChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: chartData.labels,
            datasets: [{
              label: 'Tendencia de Publicaciones',
              data: chartData.data,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 2,
              fill: true,
              pointBackgroundColor: 'rgba(75, 192, 192, 1)',
              pointHoverRadius: 5,
              pointRadius: 3,
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
              tooltip: {
                enabled: true,
                callbacks: {
                  label: (tooltipItem) => {
                    const index = tooltipItem.dataIndex;
                    const titles = chartData.titles[index];
                    return titles ? `Publicaciones: ${titles.join(', ')}` : 'Sin nombre';
                  }
                }
              }
            }
          }
        });
      }
    }
  }


  onFormatChange(event: MatSelectChange): void {
    this.selectedFormat = event.value;
    this.loadTrendChartData(this.selectedFormat);
  }

}
