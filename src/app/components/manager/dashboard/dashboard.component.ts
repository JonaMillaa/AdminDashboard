import { Component, OnInit,Inject, PLATFORM_ID} from '@angular/core';
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
import { ModalTasaComponent } from '../../../components/manager/modals/modal-tasa/modal-tasa.component';
import { ModalDetallesDiaComponent } from '../../../components/manager/modals/modal-detalles-dia/modal-detalles-dia.component';
import { ModalNoDataComponent } from '../../../components/manager/modals/modal-no-data/modal-no-data.component';
import { Chart} from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { PublicacionesTableComponent } from '../../../components/manager/publicaciones-table/publicaciones-table.component';

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
    PublicacionesTableComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})

export class DashboardComponent implements OnInit{

  growthRate: number = 0;

  
  averageChart: any;
  declineChart: any;

  monthlyAverage: number = 0;
  showDetailsModal: boolean = false;
  selectedDay: string = '';
  selectedDayCount: number = 0;
  analysisMessage: string = '';


  selectedYear: string = new Date().getFullYear().toString();
  selectedMonth: string = '';
  years: string[] = [];
  barChart: any;

  constructor(
    private firebaseService: FirebaseService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private dialog: MatDialog
  ) {}

  // Función para inicializar los datos del dashboard
  ngOnInit(): void {
    // Seleccionar automáticamente el mes actual
    const currentMonth = new Date().getMonth() + 1; // Mes actual (1-12)
    this.selectedGrowthMonth = currentMonth.toString().padStart(2, '0'); // Formato 'MM'
  
    // Cargar datos automáticamente al abrir la página
    if (isPlatformBrowser(this.platformId)) {

      // Cargar años disponibles para el selector de años
      this.loadAvailableYears();
  
      // Gráfico de Categorías (Tasa de Crecimiento)
      this.firebaseService.getPublications().subscribe(publications => {
        const categoryChartData = this.prepareCategoryData(publications, this.selectedGrowthMonth);
        this.createCategoryBarChart(categoryChartData);
      });
  
      // Gráfico de Barras por Mes
      this.firebaseService.getPublications().subscribe(publications => {
        const barChartData = this.prepareBarChartData(publications, this.selectedYear);
        this.createBarChart(barChartData);
      });
    }
  }
  

  // Cargar los años disponibles de publicaciones
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
  
  // Actualizar gráfico de barras con base en el año seleccionado
  updateBarChart(year: string): void {
    this.firebaseService.getPublications().subscribe(publications => {
      const chartData = this.prepareBarChartData(publications, year);
      this.createBarChart(chartData);
    });
  }

      // Preparar datos para el gráfico de barras
  prepareBarChartData(publications: any[], year: string): any {
    const monthlyCounts: { [month: string]: number } = {};

    publications.forEach(pub => {
      const [day, month, pubYear] = pub.fecha_ayudantia.split('-');
      if (pubYear === year) {
        monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
      }
    });

    const labels = Object.keys(monthlyCounts).map(month => this.getMonthName(month));
    const data = Object.values(monthlyCounts);

    return { labels, data, monthlyCounts };
  }

// Crear gráfico de barras
  createBarChart(chartData: any): void {
    if (isPlatformBrowser(this.platformId)) {
      const ctx = document.getElementById('barChart') as HTMLCanvasElement;

      if (ctx) {
        if (this.barChart) {
          this.barChart.destroy();
        }

        const backgroundColors = chartData.data.map(() => this.getRandomColor());

        this.barChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: chartData.labels,
            datasets: [
              {
                label: 'Publicaciones por Mes',
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
                  // Mostrar valores incluso si son bajos
                  label: (tooltipItem) => {
                    const value = tooltipItem.raw;
                    const label = tooltipItem.label;
                    return `Mes: ${label}, Publicaciones: ${value}`;
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
                title: { display: true, text: 'Meses' },
              },
              y: {
                beginAtZero: true,
                title: { display: true, text: 'Cantidad de Publicaciones' },
              },
            },
            onClick: (event, elements) => {
              if (elements.length) {
                const index = elements[0].index;
                this.showMonthDetails(
                  chartData.monthlyCounts,
                  Object.keys(chartData.monthlyCounts)[index],
                  this.selectedYear
                );
              }
            },
          },
          plugins: [ChartDataLabels], // Activar ChartDataLabels
        });
      }
    }
  }

  // Mostrar detalles de los días de publicaciones en el mes seleccionado
  showMonthDetails(monthlyCounts: { [month: string]: number }, month: string, year: string): void {
    this.firebaseService.getPublications().subscribe(publications => {
      const filteredData = publications.filter(pub => {
        const [day, pubMonth, pubYear] = pub.fecha_ayudantia.split('-');
        return pubMonth === month && pubYear === year;
      });

      // Preparar detalles por día con información adicional
      const dayDetails = filteredData.map(pub => {
        const [day, pubMonth, pubYear] = pub.fecha_ayudantia.split('-');
        const date = new Date(`${pubYear}-${pubMonth}-${day}`);
        return {
          day: date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
          format: pub.formato,
          hour: pub.hora,
        };
      });

      this.dialog.open(ModalDetallesDiaComponent, {
        data: { 
          month: this.getMonthName(month), 
          year, 
          dayDetails 
        },
      });
    });
  }

  // Obtener el nombre del mes a partir de su número
  getMonthName(month: string): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    return months[parseInt(month, 10) - 1];
  }

  // Cambiar año seleccionado
  onYearChange(event: MatSelectChange): void {
    this.selectedYear = event.value;
    this.updateBarChart(this.selectedYear);
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

  growthRateChart: Chart | null = null; // Inicializar como null
  selectedGrowthMonth: string = ''; // Mes por defecto: Octubre
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
      const filteredPublications = publications.filter(pub => {
        const pubCategory = pub.info_ayudantia?.categoria;
        const [day, month] = pub.fecha_ayudantia.split('-').map(Number);
        
        // Filtrar por categoría y mes seleccionado
        return pubCategory === category && month === parseInt(this.selectedGrowthMonth);
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
  //Función para Preparar Datos por Categoría
  prepareCategoryData(publications: any[], selectedMonth: string): { labels: string[], data: number[] } {
    const categories = [
      'Idiomas y Comunicación',
      'Administración y Negocios',
      'Diseño y Arte',
      'Informática',
      'Salud',
      'Ciencias Sociales'
    ];
  
    const groupedData: { [category: string]: number } = {};
    categories.forEach(category => (groupedData[category] = 0));
  
    publications.forEach(pub => {
      const dateStr = pub.fecha_ayudantia;
      const category = pub.info_ayudantia?.categoria;
  
      if (dateStr && category) {
        const [day, month] = dateStr.split('-').map(Number);
        if (month === parseInt(selectedMonth) && categories.includes(category)) {
          groupedData[category]++;
        }
      }
    });
  
    const labels = Object.keys(groupedData);
    const data = Object.values(groupedData);
  
    return { labels, data };
  }
  

  //Actualizar la Función para Crear el Gráfico
  createCategoryBarChart(chartData: { labels: string[], data: number[] }): void {
    const ctx = document.getElementById('growthRateChart') as HTMLCanvasElement;
  
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
            enabled: true, // Habilitar tooltips
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
          mode: 'index', // Asegura que el hover funcione en todos los puntos
          intersect: false, // Permite interacción incluso si no se pasa exactamente sobre la barra
        },
        interaction: {
          mode: 'index', // Mostrar tooltip para toda la barra
          intersect: false // Activar hover para barras pequeñas
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
            this.openDetailsModal(selectedCategory, selectedCount); // Llamar siempre al modal
          } else {
            console.warn('No se seleccionó ningún segmento.');
          }
        }
      }
    });
  }
  
  
  // Preparar los datos del gráfico
  prepareGrowthRateData(publications: any[]): any {
    const groupedData: { [monthYear: string]: number } = {};

    publications.forEach(pub => {
      const dateStr = pub.fecha_ayudantia;
      if (dateStr) {
        const [day, month, year] = dateStr.split('-').map((part: string) => parseInt(part, 10));
        const formattedMonthYear = `${month.toString().padStart(2, '0')}-${year}`;

        if (!groupedData[formattedMonthYear]) {
          groupedData[formattedMonthYear] = 0;
        }
        groupedData[formattedMonthYear]++;
      }
    });

    const labels = Object.keys(groupedData).sort((a, b) => {
      const [monthA, yearA] = a.split('-').map(Number);
      const [monthB, yearB] = b.split('-').map(Number);
      return new Date(yearA, monthA - 1).getTime() - new Date(yearB, monthB - 1).getTime();
    });

    const publicationCounts = labels.map(label => groupedData[label]);
    const growthRates = labels.map((label, index) => {
      const currentCount = groupedData[label];
      const prevCount = index > 0 ? groupedData[labels[index - 1]] : 0;
      const growthRate = prevCount ? ((currentCount - prevCount) / prevCount) * 100 : 0;
      return parseFloat(growthRate.toFixed(2));
    });

    return {
      labels,
      publicationCounts,
      growthRates
    };
  }

  //Esta función calculará los promedios de publicaciones mensuales y semanales
  prepareAverageData(publications: any[]): any {
    const groupedData: { [monthYear: string]: number } = {};
    const totalWeeks: { [weekYear: string]: number } = {};

    // Agrupar publicaciones por mes y semana
    publications.forEach(pub => {
        const dateStr = pub.fecha_ayudantia;

        if (dateStr) {
            const [day, month, year] = dateStr.split('-').map((part: string) => parseInt(part, 10));
            const formattedMonthYear = `${month.toString().padStart(2, '0')}-${year}`;
            const dateObj = new Date(year, month - 1, day);
            const weekNumber = this.getWeekNumber(dateObj);
            const formattedWeekYear = `Semana ${weekNumber}-${year}`;

            // Contar publicaciones por mes
            if (!groupedData[formattedMonthYear]) {
                groupedData[formattedMonthYear] = 0;
            }
            groupedData[formattedMonthYear]++;

            // Contar publicaciones por semana
            if (!totalWeeks[formattedWeekYear]) {
                totalWeeks[formattedWeekYear] = 0;
            }
            totalWeeks[formattedWeekYear]++;
        }
    });

    // Calcular el promedio mensual y semanal
    const monthlyAverage = Object.values(groupedData).reduce((a, b) => a + b, 0) / Object.keys(groupedData).length;
    const weeklyAverage = Object.values(totalWeeks).reduce((a, b) => a + b, 0) / Object.keys(totalWeeks).length;

    return { labels: ['Promedio Mensual', 'Promedio Semanal'], data: [monthlyAverage, weeklyAverage] };
  }

  // Función para obtener el número de la semana en un año
  getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

}

