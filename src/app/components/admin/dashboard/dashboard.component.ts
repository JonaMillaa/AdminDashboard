import { Component, OnInit,Inject, PLATFORM_ID, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FirebaseService } from '../../../firebase/firebase.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { ModalTasaComponent } from '../modals/modal-tasa/modal-tasa.component';
import { ModalDetallesDiaComponent } from '../modals/modal-detalles-dia/modal-detalles-dia.component';
import { ModalNoDataComponent } from '../modals/modal-no-data/modal-no-data.component';
import { Chart} from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
// import { PublicacionesTableComponent } from '../../../components/manager/publicaciones-table/publicaciones-table.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    // PublicacionesTableComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})

export class DashboardComponent implements OnInit, AfterViewInit{

  
  // growthRate: number = 0;
  
  // averageChart: any;
  // declineChart: any;

  // monthlyAverage: number = 0;
  // showDetailsModal: boolean = false;
  // selectedDay: string = '';
  // selectedDayCount: number = 0;
  // analysisMessage: string = '';


  constructor(
    private firebaseService: FirebaseService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  // Función para inicializar los datos del dashboard
  ngOnInit(): void {

    // Inicializar el mes actual cuando se carga el componente
    //Grafico publicaciones por dia
    const currentDate = new Date();
    this.selectedMonth = (currentDate.getMonth() + 1).toString(); // Mes actual (1-12)
    
  
    // Seleccionar automáticamente el mes actual
    const currentMonth = new Date().getMonth() + 1; // Mes actual (1-12)
    this.selectedGrowthMonth = currentMonth.toString().padStart(2, '0'); // Formato 'MM'
  
    // Cargar datos automáticamente al abrir la página
    if (isPlatformBrowser(this.platformId)) {

      // Cargar años disponibles para el selector de años
      this.loadAvailableYears();
      this.loadGrowthYears()

      // Gráfico de Categorías (Tasa de Crecimiento)
      this.firebaseService.getPublications().subscribe(publications => {
      // Filtramos las publicaciones que corresponden al año seleccionado y al mes seleccionado
        const filteredPublications = publications.filter(pub => {
        const pubDate = pub.fecha_ayudantia; // 'DD-MM-YYYY'
        const [day, month, year] = pubDate.split('-').map(Number);

          // Filtramos por año y mes
          return year === parseInt(this.selectedYearCategory) && month === parseInt(this.selectedGrowthMonth);
        });

        // Preparar los datos por categoría y mes (filtrados por año y mes)
        const categoryChartData = this.prepareCategoryData(filteredPublications, this.selectedGrowthMonth);

        // Crear el gráfico con los datos filtrados
        this.createCategoryBarChart(categoryChartData);
    });
  
      // Gráfico de Barras por año Cantidad de Publicaciones
      this.firebaseService.getPublications().subscribe(publications => {
        const barChartData = this.prepareBarChartData(publications, this.selectedYear, this.selectedMonth);
        this.createBarChart(barChartData, this.selectedYear, this.selectedMonth);
      });
    }
  } 

  ngAfterViewInit() {
    // Usar setTimeout para retrasar la ejecución del código
    setTimeout(() => {
      if (this.canvasRef) {
        const ctx = this.canvasRef.nativeElement as HTMLCanvasElement;
        if (ctx && this.chartData.labels.length > 0 && this.chartData.data.length > 0) {
          this.createCategoryBarChart(this.chartData);
        } else {
          console.error('Canvas o chartData no están disponibles.');
        }
      }
  
      // Forzar la detección de cambios
      this.cdr.detectChanges();
    }, 0); // Retrasa hasta el siguiente ciclo de eventos de Angular
  }

  selectedYear: string = new Date().getFullYear().toString();
  selectedMonth: string = ''; // 'all' para mostrar todos los meses por defecto
  years: string[] = [];
  barChart: any;
  months: { value: string, name: string }[] = [
    { value: '01', name: 'Enero' },
    { value: '02', name: 'Febrero' },
    { value: '03', name: 'Marzo' },
    { value: '04', name: 'Abril' },
    { value: '05', name: 'Mayo' },
    { value: '06', name: 'Junio' },
    { value: '07', name: 'Julio' },
    { value: '08', name: 'Agosto' },
    { value: '09', name: 'Septiembre' },
    { value: '10', name: 'Octubre' },
    { value: '11', name: 'Noviembre' },
    { value: '12', name: 'Diciembre' }
  ];
  // Inicializar las variables de estado
  public noPublications: boolean = false; // Para controlar si no hay publicaciones

  // Función para cargar los años disponibles
  loadAvailableYears(): void {
    this.firebaseService.getPublications().subscribe(publications => {
      const yearsSet = new Set<string>();
      publications.forEach(pub => {
        const [, , year] = pub.fecha_ayudantia.split('-');
        yearsSet.add(year);
      });
      this.years = Array.from(yearsSet).sort();
    });
  }

  // Función para obtener el número de días del mes seleccionado en un año dado
  getDaysInMonth(year: string, month: string): number {
    const date = new Date(Number(year), parseInt(month, 10), 0); // El día 0 del siguiente mes es el último día del mes actual
    return date.getDate();
  }

  // Función para actualizar el gráfico de barras basado en el año y mes seleccionados
  updateBarChart(year: string, month: string): void {
    this.firebaseService.getPublications().subscribe(publications => {
      // Restablecer noPublications a false antes de preparar los datos
      this.noPublications = false;
      
      const chartData = this.prepareBarChartData(publications, year, month);
  
      // Verificar si hay publicaciones para el mes y año seleccionados
      this.noPublications = chartData.data.length === 0;
  
      // Si no hay publicaciones, no se muestra el gráfico
      if (!this.noPublications) {
        this.createBarChart(chartData, this.selectedYear, this.selectedMonth);
      }
    });
  }

  // Preparar los datos del gráfico para el mes y año seleccionados
  prepareBarChartData(publications: any[], year: string, month: string): any {
    const monthlyCounts: { [day: string]: number } = {};

    // Filtrar publicaciones del mes y año seleccionados
    publications.forEach(pub => {
      const [day, pubMonth, pubYear] = pub.fecha_ayudantia.split('-');
      if (pubYear === year && pubMonth === month) {
        monthlyCounts[day] = (monthlyCounts[day] || 0) + 1;
      }
    });

    // Obtener las etiquetas y los datos del gráfico
    const labels = Object.keys(monthlyCounts);
    const data = Object.values(monthlyCounts);

    return { labels, data, monthlyCounts };
  }

  // Crear gráfico de barras mostrando solo días con publicaciones
  createBarChart(chartData: any, selectedMonth: string, selectedYear: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const ctx = document.getElementById('barChart') as HTMLCanvasElement;

      if (ctx) {
        if (this.barChart) {
          this.barChart.destroy();
        }

        const backgroundColors = chartData.data.map(() => this.getRandomColor());

        // Crear el título dinámico
        const chartTitle = `Publicaciones por Día en el Mes de ${this.getMonthName(selectedMonth)} de ${selectedYear}`;


        this.barChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: chartData.labels, // Días del mes con publicaciones
            datasets: [
              {
                label: chartTitle,  // Título del gráfico dinámico
                data: chartData.data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors,
                borderWidth: 1,
                minBarLength: 5, // Ancho mínimo para barras pequeñas
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: 'top' },
              tooltip: {
                callbacks: {
                  label: (tooltipItem) => {
                    const value = tooltipItem.raw;
                    const label = tooltipItem.label;
                    return `Día: ${label}, Publicaciones: ${value}`;
                  },
                },
              },
              datalabels: {
                color: '#000', // Color del número
                anchor: 'end',
                align: 'end',
                font: {
                  size: 16, // Tamaño más grande
                  weight: 'bold', // Negrita para resaltar
                },
              },
            },
            hover: {
              mode: 'index', // Asegura que el hover funcione en todos los puntos
              intersect: false, // Permite interacción incluso si no se pasa exactamente sobre la barra
            },
            interaction: {
              mode: 'index', // Interacción mejorada en el eje X
              intersect: false,
            },
            scales: {
              x: {
                title: { display: true, text: 'Días' },
              },
              y: {
                beginAtZero: true,
                title: { display: true, text: 'Cantidad de Publicaciones' },
                ticks: {
                  // Establecer los ticks para que sean enteros
                  stepSize: 1, // Incremento de 1 para que solo se muestren enteros
                  callback: function(value) {
                    // Formatear solo valores enteros
                    return Number.isInteger(value) ? value : '';
                  },
                },
              },
            },
            onClick: (event, elements) => {
              if (elements.length) {
                const index = elements[0].index;
                this.showDayDetails(
                  chartData.dailyCounts,
                  chartData.labels[index],
                  this.selectedYear,
                  this.selectedMonth
                );
              }
            },
          },
          plugins: [ChartDataLabels], // Activar ChartDataLabels
        });
      }
    }
  }

  // Mostrar detalles de los días de publicaciones al hacer clic en un día
  showDayDetails(dailyCounts: { [day: string]: number }, day: string, year: string, month: string): void {
    this.firebaseService.getPublications().subscribe(publications => {
      // Filtrar publicaciones para el día seleccionado
      const filteredData = publications.filter(pub => {
        const [pubDay, pubMonth, pubYear] = pub.fecha_ayudantia.split('-');
        return pubDay === day && pubMonth === month && pubYear === year;
      });

      // Preparar detalles por día con información adicional
      const dayDetails = filteredData.map(pub => {
        const [pubDay, pubMonth, pubYear] = pub.fecha_ayudantia.split('-');
        const date = new Date(`${pubYear}-${pubMonth}-${pubDay}`);
        return {
          day: date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
          format: pub.formato,
          hour: pub.hora,
        };
      });

      this.dialog.open(ModalDetallesDiaComponent, {
        data: { 
          day, 
          month: this.getMonthName(month), 
          year, 
          dayDetails 
        },
      });
    });
  }

  // Cambiar año seleccionado
  onYearChange(event: MatSelectChange): void {
    this.selectedYear = event.value;
    this.updateBarChart(this.selectedYear, this.selectedMonth || 'all');
  }

  // Cambiar mes seleccionado
  onMonthChange(event: MatSelectChange): void {
    this.selectedMonth = event.value;
    this.updateBarChart(this.selectedYear, this.selectedMonth);
  }
  
  // Obtener el nombre del mes desde su número
  getMonthName(month: string): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    return months[parseInt(month, 10) - 1] || '';
  }

  // Función para obtener un color aleatorio
  getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }


///////////////Publicaciones por Categoría///////////////

  growthRateChart: Chart | null = null; // Inicializar como null
  growthMonths = [
    { name: 'Enero', value: '01' },
    { name: 'Febrero', value: '02' },
    { name: 'Marzo', value: '03' },
    { name: 'Abril', value: '04' },
    { name: 'Mayo', value: '05' },
    { name: 'Junio', value: '06' },
    { name: 'Julio', value: '07' },
    { name: 'Agosto', value: '08' },
    { name: 'Septiembre', value: '09' },
    { name: 'Octubre', value: '10' },
    { name: 'Noviembre', value: '11' },
    { name: 'Diciembre', value: '12' },
  ];

    // Propiedades
  growthYears: string[] = []; // Años disponibles desde Firebase
  selectedYearCategory: string = '2023'; // Ejemplo, cambiar según la selección
  selectedGrowthMonth: string = '01';   // Ejemplo, cambiar según la selección
  // noDataMessage: string;
  noDataMessage: string = '';  // Inicializar con un valor predeterminado
  showNoDataImage: boolean = false;
  chartData: { labels: string[], data: number[] } = { labels: [], data: [] }; // Asegúrate de inicializar chartData
  showChart: boolean = true;         // Controla si se debe mostrar el gráfico

  @ViewChild('growthRateChart') canvasRef: ElementRef | undefined;

  // Cargar los años disponibles de publicaciones para el gráfico
  loadGrowthYears(): void {
    this.firebaseService.getPublications().subscribe(publications => {
      const yearsSet = new Set<string>();
      publications.forEach(pub => {
        const pubDate = pub.fecha_ayudantia; // 'DD-MM-YYYY'
        const [, , year] = pubDate.split('-');
        yearsSet.add(year); // Añadimos el año al Set para evitar duplicados
      });

      // Actualizamos la propiedad growthYears con los años ordenados
      this.growthYears = Array.from(yearsSet).sort(); // Convertir Set a array y ordenar
    });
  }

 // Método para cargar las publicaciones filtradas por año y mes
  fetchPublications(): void {
    this.firebaseService.getPublications().subscribe(publications => {
      // Filtrar las publicaciones por año y mes si están seleccionados
      const filteredPublications = publications.filter(pub => {
        const pubDate = pub.fecha_ayudantia; // 'DD-MM-YYYY'
        const [day, month, year] = pubDate.split('-').map(Number);
        
        // Filtrar por el año seleccionado
        const isYearMatch = year.toString() === this.selectedYearCategory;
        
        // Filtrar por el mes seleccionado (si existe)
        const isMonthMatch = this.selectedGrowthMonth ? month === parseInt(this.selectedGrowthMonth) : true;
        
        return isYearMatch && isMonthMatch;
      });

      // Si no hay publicaciones para el mes y año seleccionado, mostrar la imagen de "No data found"
      if (filteredPublications.length === 0) {
        this.noDataMessage = `No se encuentran publicaciones en el mes '${this.getMonthName(this.selectedGrowthMonth)}' en el año '${this.selectedYearCategory}'`;
        this.showNoDataImage = true;  // Activa la imagen de "No Data"
        this.showChart = false; // Oculta el gráfico
        return;
      }

      // Si hay publicaciones, ocultamos la imagen y mostramos el gráfico
      this.showNoDataImage = false;
      this.showChart = true; // Muestra el gráfico

      // Preparar los datos del gráfico
      const chartData = this.prepareCategoryData(filteredPublications, this.selectedGrowthMonth);

      // Mostrar gráfico si hay datos
      this.createCategoryBarChart(chartData);
    });
  }

  openNoDataModal(): void {
    // Abre el modal y pasa el mensaje a mostrar
    this.dialog.open(ModalNoDataComponent, {
      data: {
        message: this.noDataMessage
      }
    });
  }
  
  // Método auxiliar para obtener el nombre del mes
  getMonthNameCategory(month: string): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[parseInt(month) - 1];
  }

  // Método para manejar el cambio de año en el filtro
  onYearChangeCategory(selectedYearCategory: string): void {
    this.selectedYearCategory = selectedYearCategory; // Actualizar el año seleccionado
    this.fetchPublications(); // Llamar para actualizar el gráfico
  }
  
  onGrowthMonthChange(selectedGrowthMonth: string): void {
    this.firebaseService.getPublications().subscribe(publications => {
      // Preparar datos por categoría y mes seleccionado
      const chartData = this.prepareCategoryData(publications, selectedGrowthMonth);
  
      if (chartData.data.every((count: number) => count === 0)) {
        this.dialog.open(ModalNoDataComponent, {
          data: { message: 'No hay datos disponibles para el mes seleccionado.' }
        });
        return;
      }
  
      // Crear el gráfico con los datos filtrados
      this.createCategoryBarChart(chartData);
    });
  }
  
  openDetailsModal(category: string, count: number): void {
    this.firebaseService.getPublications().subscribe(publications => {
      // Filtrar las publicaciones por categoría, mes y año
      const filteredPublications = publications.filter(pub => {
        const pubCategory = pub.info_ayudantia?.categoria;
        const [day, month, year] = pub.fecha_ayudantia.split('-').map(Number);
        
        // Filtrar por categoría, mes y año
        const isCategoryMatch = pubCategory === category;
        const isMonthMatch = this.selectedGrowthMonth ? month === parseInt(this.selectedGrowthMonth) : true;
        const isYearMatch = year.toString() === this.selectedYearCategory;
        
        return isCategoryMatch && isMonthMatch && isYearMatch;
      });
  
      this.dialog.open(ModalTasaComponent, {
        width: '500px',
        data: {
          category,
          count,
          average: Math.round(count / (filteredPublications.length || 1)), // Calcular promedio
          publications: filteredPublications.map(pub => ({
            title: pub.info_ayudantia.titulo_ayudantia || 'Sin título',
            date: pub.fecha_ayudantia || 'Sin fecha'
          }))
        }
      });
    });
  }
  
  loadGrowthRateChart(selectedMonth: string): void {
    this.firebaseService.getPublications().subscribe(publications => {
      // Preparar datos para el gráfico
      const chartData = this.prepareCategoryData(publications, selectedMonth);

      if (chartData.data.every((count: number) => count === 0)) {
        this.dialog.open(ModalNoDataComponent, {
          data: { message: 'No hay datos disponibles para el mes seleccionado.' }
        });
        return;
      }

      // Crear o actualizar el gráfico
      this.createCategoryBarChart(chartData);
    });
  }

  // Método para preparar los datos del gráfico por categorías
  prepareCategoryData(publications: any[], selectedMonth: string): { labels: string[], data: number[] } {
    const categories = [
      'Idiomas y Comunicación',
      'Administración y Negocios',
      'Diseño y Arte',
      'Informática',
      'Salud',
      'Salud y Ciencias Sociales'
    ];

    const groupedData: { [category: string]: number } = {};
    categories.forEach(category => (groupedData[category] = 0));

    publications.forEach(pub => {
      const dateStr = pub.fecha_ayudantia;
      const category = pub.info_ayudantia?.categoria;

      if (dateStr && category) {
        const [day, month, year] = dateStr.split('-').map(Number);
        if (month === parseInt(selectedMonth) && year.toString() === this.selectedYearCategory && categories.includes(category)) {
          groupedData[category]++;
        }
      }
    });

    const labels = Object.keys(groupedData);
    const data = Object.values(groupedData);

    return { labels, data };
  }

  // Método para crear o actualizar el gráfico de barras
  createCategoryBarChart(chartData: { labels: string[], data: number[] }): void {
    const ctx = this.canvasRef?.nativeElement as HTMLCanvasElement;
    if (!ctx) {
      console.error('El elemento canvas no está disponible.');
      return;
    }

    if (this.growthRateChart) {
      this.growthRateChart.destroy();
    }

    const average = chartData.data.reduce((a, b) => a + b, 0) / chartData.data.length;

    this.growthRateChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Número de Publicaciones',
            data: chartData.data,
            backgroundColor: chartData.labels.map((label, index) =>
              chartData.data[index] > average ? 'rgba(54, 162, 235, 0.8)' : 'rgba(255, 99, 132, 0.8)'
            ),
            borderColor: 'rgba(0, 0, 0, 0.1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (tooltipItem) => `Cantidad: ${tooltipItem.raw}`
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Categorías' },
            ticks: {
              autoSkip: false,
              maxRotation: 45,
              minRotation: 45
            }
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Número de Publicaciones' },
            ticks: {
              stepSize: 1,
              callback: (value) => Number.isInteger(value) ? value : null
            }
          }
        },
        hover: {
          mode: 'index',
          intersect: false
        },
        interaction: {
          mode: 'index',
          intersect: false
        },
        animation: {
          duration: 2000,
          easing: 'easeOutBounce'
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const selectedCategory = chartData.labels[index];
            const selectedCount = chartData.data[index];
            this.openDetailsModal(selectedCategory, selectedCount);
          }
        }
      }
    });
  }
  
  // Preparar los datos del gráfico
  // prepareGrowthRateData(publications: any[]): any {
  //   const groupedData: { [monthYear: string]: number } = {};

  //   publications.forEach(pub => {
  //     const dateStr = pub.fecha_ayudantia;
  //     if (dateStr) {
  //       const [day, month, year] = dateStr.split('-').map((part: string) => parseInt(part, 10));
  //       const formattedMonthYear = `${month.toString().padStart(2, '0')}-${year}`;

  //       if (!groupedData[formattedMonthYear]) {
  //         groupedData[formattedMonthYear] = 0;
  //       }
  //       groupedData[formattedMonthYear]++;
  //     }
  //   });

  //   const labels = Object.keys(groupedData).sort((a, b) => {
  //     const [monthA, yearA] = a.split('-').map(Number);
  //     const [monthB, yearB] = b.split('-').map(Number);
  //     return new Date(yearA, monthA - 1).getTime() - new Date(yearB, monthB - 1).getTime();
  //   });

  //   const publicationCounts = labels.map(label => groupedData[label]);
  //   const growthRates = labels.map((label, index) => {
  //     const currentCount = groupedData[label];
  //     const prevCount = index > 0 ? groupedData[labels[index - 1]] : 0;
  //     const growthRate = prevCount ? ((currentCount - prevCount) / prevCount) * 100 : 0;
  //     return parseFloat(growthRate.toFixed(2));
  //   });

  //   return {
  //     labels,
  //     publicationCounts,
  //     growthRates
  //   };
  // }

  //Esta función calculará los promedios de publicaciones mensuales y semanales
  // prepareAverageData(publications: any[]): any {
  //   const groupedData: { [monthYear: string]: number } = {};
  //   const totalWeeks: { [weekYear: string]: number } = {};

  //   // Agrupar publicaciones por mes y semana
  //   publications.forEach(pub => {
  //       const dateStr = pub.fecha_ayudantia;

  //       if (dateStr) {
  //           const [day, month, year] = dateStr.split('-').map((part: string) => parseInt(part, 10));
  //           const formattedMonthYear = `${month.toString().padStart(2, '0')}-${year}`;
  //           const dateObj = new Date(year, month - 1, day);
  //           const weekNumber = this.getWeekNumber(dateObj);
  //           const formattedWeekYear = `Semana ${weekNumber}-${year}`;

  //           // Contar publicaciones por mes
  //           if (!groupedData[formattedMonthYear]) {
  //               groupedData[formattedMonthYear] = 0;
  //           }
  //           groupedData[formattedMonthYear]++;

  //           // Contar publicaciones por semana
  //           if (!totalWeeks[formattedWeekYear]) {
  //               totalWeeks[formattedWeekYear] = 0;
  //           }
  //           totalWeeks[formattedWeekYear]++;
  //       }
  //   });

  //   // Calcular el promedio mensual y semanal
  //   const monthlyAverage = Object.values(groupedData).reduce((a, b) => a + b, 0) / Object.keys(groupedData).length;
  //   const weeklyAverage = Object.values(totalWeeks).reduce((a, b) => a + b, 0) / Object.keys(totalWeeks).length;

  //   return { labels: ['Promedio Mensual', 'Promedio Semanal'], data: [monthlyAverage, weeklyAverage] };
  // }

  // Función para obtener el número de la semana en un año
  // getWeekNumber(date: Date): number {
  //   const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  //   const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  //   return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  // }

}

