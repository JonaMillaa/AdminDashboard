import { Component, OnInit,Inject, PLATFORM_ID} from '@angular/core';
import { FirebaseService } from '../../../firebase/firebase.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import {DashboardComponent} from '../dashboard/dashboard.component';
import { GraficoPromedioPublicacionesComponent } from '../grafico-promedio-publicaciones/grafico-promedio-publicaciones.component'
import { Chart} from 'chart.js';
// Definimos el tipo para los datos del gráfico (dataset)
interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string | string[]; // Acepta tanto un solo color como un array de colores
}
 // Definimos el tipo para los estados posibles
 export type StateType = 'PUBLICADO' | 'AGENDADA' | 'FINALIZADA' | 'ADJUDICADO' | 'EN_CURSO' | 'NO ADJUDICACION' | 'ADJUDICACION';


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
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatToolbarModule,
    DashboardComponent,
    GraficoPromedioPublicacionesComponent
  ],
  templateUrl: './publicaciones.component.html',
  styleUrl: './publicaciones.component.css'
})
export class PublicacionesComponent implements OnInit{

  
  displayedColumns: string[] = ['fecha', 'cantidad', 'detalles'];  // Las columnas que deseas mostrar en la tabla
  dataSource = new MatTableDataSource<any>();  // Inicializa MatTableDataSource con datos vacíos


  chart: any;
 
  trendChart: any;

  selectedFormat = 'PRESENCIAL'
  showPublicationModal = false;
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
    this.loadCategoriesData();
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

///7Grafico de publicaciones por categoría
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
  // Valores por defecto
  selectedCategory = 'Informática';
  selectedSubcategory = 'Bases de Datos';
  displayedColumnsCategories: string[] = ['fecha_ayudantia', 'categoria', 'subcategoria', 'cantidad'];
  dataSourceCategories = new MatTableDataSource<any>();
  publicationChart: Chart | null = null;
  // publicationChart: any;
  

  // Cargar todas las categorías y subcategorías de la colección Publicaciones
  loadCategoriesData(): void {
    this.firebaseService.getAllPublications().subscribe(publications => {
      if (publications.length === 0) {
        alert('No hay publicaciones disponibles.');
      } else {
        // Actualizar la tabla con los datos obtenidos
        this.updateCategoriesTable(publications);
      }
    });
  }

  // Función para actualizar la tabla con los datos obtenidos
  updateCategoriesTable(publications: any[]): void {
    // Contamos la cantidad de publicaciones por combinación de categoría y subcategoría
    const publicationData = publications.map(pub => ({
      fecha_ayudantia: pub.fecha_ayudantia,
      categoria: pub.info_ayudantia.categoria,
      subcategoria: pub.info_ayudantia.subcategoria
    }));

    // Convertir a formato que entiende la tabla
    this.dataSourceCategories.data = publicationData;
  }

  createBarChart(chartData: any): void {
    const ctx = document.getElementById('publicationChart') as HTMLCanvasElement;
    if (ctx) {
      if (this.publicationChart) {
        this.publicationChart.destroy();
      }
      this.publicationChart = new Chart(ctx, {
        type: 'bar',
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
              title: { display: true, text: 'Fechas', color: '#666' }
            },
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Cantidad de Publicaciones', color: '#666' },
              ticks: {
                // Asegura que los valores en el eje Y sean enteros
                callback: function(value) {
                  return Number(value).toFixed(0); // Redondea el valor a un entero
                },
                // Limita la cantidad de marcas en el eje Y
                autoSkip: true, // Omite los valores repetidos automáticamente
                maxTicksLimit: 5, // Ajusta el número máximo de ticks en el eje Y
                stepSize: 1 // Configura el tamaño de paso para evitar valores repetidos
              }
            }
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


  ////////// GRAFICO DE ESTADO Y TABLA
  states: ('PUBLICADO'|'AGENDADA' | 'FINALIZADA'|'ADJUDICADO'|'EN_CURSO'| 'NO ADJUDICACION' | 'ADJUDICACION')[] = [
    'PUBLICADO',
    'AGENDADA',
    'FINALIZADA',
    'ADJUDICADO',
    'EN_CURSO',
    'NO ADJUDICACION',
    'ADJUDICACION'
  ];
   
  // Inicializamos selectedState con un valor por defecto
  selectedState: StateType = 'FINALIZADA';  // Valor inicial de ejemplo
  stateChart: any;
  displayedColumnsStates: string[] = ['fecha', 'cantidad', 'estado', 'categoria'];
  dataSourceStates: any[] = [];  // Fuente de datos para la tabla
  showStateModal: boolean = false;  // Controla la visibilidad del modal
  stateModalMessage: string = '';  // Mensaje que se muestra en el modal
  
 // Método para manejar cambios en el estado
  onStateChange(event: MatSelectChange): void {
    this.selectedState = event.value as StateType;
    this.loadStateChartData(this.selectedState, 'month');
  }

  // Método para cargar los datos por estado
  loadStateChartData(state: 'PUBLICADO' | 'AGENDADA' | 'FINALIZADA' | 'ADJUDICADO' | 'EN_CURSO' | 'NO ADJUDICACION' | 'ADJUDICACION', timeRange: string): void {
    this.firebaseService.getPublicationsByState(state).subscribe(publications => {
      // Verificamos si no hay publicaciones
      if (publications.length === 0) {
        this.stateModalMessage = `No hay publicaciones disponibles para el estado ${state}.`;
        this.showStateModal = true; // Mostrar modal
        // Si ya existe el gráfico, lo destruimos
        if (this.stateChart) {
          this.stateChart.destroy();
        }
      } else {
        // Si hay publicaciones, cerramos el modal
        this.showStateModal = false;
        // Preparar y mostrar los datos del gráfico
        const chartData = this.prepareChartDataByTimeRange(publications, timeRange);
        this.createStateChart(chartData);
        const tableData = this.prepareTableData(publications);
        this.dataSourceStates = tableData;
      }
    });
  }
  
  closeStateModal(): void {
    this.showStateModal = false;
  }
  
  createStateChart(chartData: any): void {
    const ctx = document.getElementById('stateChart') as HTMLCanvasElement;
  
    // Verificamos si el contexto y los datos son válidos
    if (ctx && chartData && chartData.datasets && chartData.datasets.length > 0) {
      if (this.stateChart) {
        this.stateChart.destroy(); // Destruimos el gráfico anterior si existe
      }
  
      this.stateChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: chartData.labels,
          datasets: chartData.datasets.map((dataset: ChartDataset) => {
            // Asignamos colores a cada barra dependiendo del valor (usando un mapeo)
            dataset.backgroundColor = dataset.data.map((value: number) => this.getColorForValue(value));
            return dataset;
          })
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 500, // Establece la duración global de las animaciones
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Meses',
                color: '#666',
                font: {
                  size: 15,
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
                  size: 15,
                  weight: 'bold'
                }
              },
              grid: {
                color: 'rgba(200, 200, 200, 0.2)'
              },
              ticks: {
                // Asegura que los valores en el eje Y sean enteros
                callback: function(value) {
                  return Number(value).toFixed(0); // Redondea el valor a un entero
                }
              }
            }
          },
          plugins: {
            legend: { display: true, position: 'top' },
            tooltip: { 
              enabled: true,
              mode: 'nearest', // Cambiado a 'nearest' para que siempre se asocie al valor más cercano
              intersect: false, // Asegura que el tooltip no se muestre si no se pasa por encima del gráfico
              callbacks: {
                label: (tooltipItem) => {
                  const label = tooltipItem.dataset.label || '';
                  const value = tooltipItem.raw as number;
  
                  // Si no hay datos (value <= 0), no mostrar el tooltip
                  if (value <= 0) {
                    return '';  // Retornar vacío para no mostrar el tooltip
                  }
  
                  return `${label}: ${value} publicaciones`; // Retornar el valor del tooltip si es mayor a 0
                },
                title: (tooltipItem) => {
                  // Mostrar el mes (etiqueta de la barra) en el título del tooltip
                  return tooltipItem[0].label;
                }
              },
              // Estilos del tooltip
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              titleColor: '#fff',
              bodyColor: '#fff',
              bodyFont: {
                size: 14,
              },
              titleFont: {
                size: 16,
              },
              footerFont: {
                size: 12,
              },
              displayColors: false, // Ocultar el color de la barra en el tooltip
            }
          },
          onHover: (event, chartElement) => {
            if (chartElement && chartElement.length > 0) {
              const activePoint = chartElement[0]; // Obtenemos el primer elemento de la barra
              if (activePoint) {
                // Cambiar el color de la barra al pasar el mouse
                const datasetIndex = activePoint.datasetIndex;
                const index = activePoint.index;
                const originalColor = activePoint.element.options['backgroundColor'];
      
                // Cambiar el color de la barra
                this.stateChart.data.datasets[datasetIndex].backgroundColor[index] = 'rgba(250, 99, 132, 0.8)'; // Nuevo color al hacer hover
      
                // Actualizar el gráfico después de cambiar el color
                this.stateChart.update();  // Actualiza el gráfico con el nuevo color
              }
            }
          }         
        }
      });
    } else {
      console.error('Datos del gráfico inválidos o vacíos.');
    }
  }
  
  // Función para asignar el color según el valor
  getColorForValue(value: number): string {
    // Lógica simple para asignar colores dependiendo del valor
    if (value > 15) {
      return 'rgba(63, 81, 181, 0.5)'; // Azul
    } else if (value > 10) {
      return 'rgba(54, 162, 235, 0.5)'; // Azul claro
    } else {
      return 'rgba(255, 99, 132, 0.5)'; // Rojo
    }
  }
  
  
  // Función para asignar el color según el estado
  getColorForState(state: 'PUBLICADO' | 'AGENDADA' | 'FINALIZADA' | 'ADJUDICADO' | 'EN_CURSO' | 'NO ADJUDICACION' | 'ADJUDICACION'): string {
    const colors: { [key: string]: string } = {
      'PUBLICADO': 'rgba(63, 81, 181, 0.5)',
      'AGENDADA': 'rgba(54, 162, 235, 0.5)',
      'FINALIZADA': 'rgba(255, 159, 64, 0.5)',
      'ADJUDICADO': 'rgba(255, 159, 64, 0.5)',
      'EN_CURSO': 'rgba(255, 99, 132, 0.5)',
      'NO ADJUDICACION': 'rgba(75, 192, 192, 0.5)',
      'ADJUDICACION': 'rgba(153, 102, 255, 0.5)',
    };
  
    return colors[state] || 'rgba(0, 0, 0, 0.5)'; // Valor por defecto si no coincide
  }
  
  
    // Método para preparar los datos para la tabla
  prepareTableData(publications: any[]): any[] {
    const tableRows: any[] = [];

    // Agrupar las publicaciones por fecha (Mes/Año)
    publications.forEach(pub => {
      const fechaParts = pub.fecha_ayudantia.split('-');  // Obtener el array [día, mes, año]
      if (fechaParts.length === 3) {
        // Asegurarse de que el año, mes y día estén correctamente formateados
        const day = parseInt(fechaParts[0], 10);
        const month = parseInt(fechaParts[1], 10) - 1;  // Mes en JavaScript es 0-indexado
        const year = parseInt(fechaParts[2], 10);

        // Crear la fecha en formato de objeto Date
        const fecha = new Date(year, month, day);
        const fechaFormatted = `${this.getMonthName(fecha.getMonth())} ${fecha.getFullYear()}`;  // Formato: Mes Año
        const estado = pub.estado?.toUpperCase() || 'DESCONOCIDO';  // Estado de la publicación
        const categoria = pub.info_ayudantia?.categoria || 'Desconocida';  // Categoría de la publicación

        // Contamos cuántas publicaciones por estado y fecha
        const existingRow = tableRows.find(row => row.fecha === fechaFormatted && row.estado === estado && row.categoria === categoria);
        if (existingRow) {
          existingRow.cantidad++;  // Si ya existe la fila, simplemente aumentamos la cantidad
        } else {
          // Si no existe la fila, la creamos
          tableRows.push({
            fecha: fechaFormatted,
            cantidad: 1,
            estado: estado,
            categoria: categoria
          });
        }
      }
    });

    return tableRows;  // Devolvemos las filas preparadas para la tabla
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
  
    // Validamos que siempre regrese la estructura adecuada
    return {
      labels: labels,
      datasets: [
        {
          label: 'Publicaciones por Estado',
          data: data,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    };
  }
  
  // Método para preparar los datos para la tabla
  prepareStackedBarChartData(publications: any[]): any {
    const groupedData: { [key: string]: { [state: string]: number } } = {};

    // Agrupar las publicaciones por estado y categoría
    publications.forEach(pub => {
      const categoria = pub.info_ayudantia?.categoria || 'Desconocida';
      const estado = pub.estado?.toUpperCase() || 'DESCONOCIDO';
      const fecha = new Date(pub.fecha);  // Asumimos que hay un campo `fecha`

      const mesAnio = `${this.getMonthName(fecha.getMonth())} ${fecha.getFullYear()}`; // Fecha en formato "Mes Año"

      if (!groupedData[mesAnio]) {
        groupedData[mesAnio] = {
          'PUBLICADO': 0,
          'ADJUDICADO': 0,
          'EN_CURSO': 0,
          'AGENDADA': 0,
          'NO_ADJUDICACION': 0,
          'ADJUDICACION': 0,
        };
      }

      if (groupedData[mesAnio][estado] !== undefined) {
        groupedData[mesAnio][estado]++;
      }
    });

    // Crear etiquetas y conjuntos de datos para la tabla
    const labels = Object.keys(groupedData);
    const datasets = this.states.map(state => {
      return {
        label: state,
        data: labels.map(label => groupedData[label][state] || 0), // Si no hay datos, tomar 0
        backgroundColor: this.getColorForState(state),
        borderWidth: 1
      };
    });

    return { labels, datasets };
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
      this.createInfoTable(chartData); // Crear la tabla al cargar el gráfico
    });
  }
  // Método para cerrar el modal de publicación
  closePublicationModal(): void {
    this.showPublicationModal = false;  // Cerramos el modal de publicación
  }

  // Método para generar la tabla de información
  createInfoTable(chartData: any): void {
    const tableContainer = document.getElementById('infoTableContainer');
    if (!tableContainer) return;

    // Limpiar la tabla anterior
    this.dataSource.data = []; // Limpiar datos previos

    // Llenar los datos de la tabla
    const tableData = chartData.labels.map((label: string, index: number) => ({
      fecha: label,
      cantidad: chartData.data[index],
      detalles: chartData.titles ? chartData.titles[index].join(', ') : 'N/A'
    }));

    this.dataSource.data = tableData; // Asignar los datos a la tabla
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
                },
                ticks: {
                  stepSize: 1, // Incremento de 1 para asegurar solo enteros
                  callback: function(value) {
                    return Number.isInteger(value) ? value : null; // Muestra solo enteros
                  }
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
