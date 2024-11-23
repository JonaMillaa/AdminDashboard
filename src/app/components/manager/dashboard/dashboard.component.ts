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

import { GrowthRateData } from '../../../models/interfaces';

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

  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})

export class DashboardComponent implements OnInit{

  totalUsuariosActivos: number = 0;
  totalTutores: number = 0;
  totalEstudiantes: number = 0;
  totalPublicaciones: number = 0;
  totalAyudantias: number = 0;


  growthRate: number = 0;

  
  averageChart: any;
  declineChart: any;

  selectedMonthTasa: string = '';
  selectedCurrentCount: number = 0;
  selectedPrevCount: number = 0;



  sunburstChart: any;
  selectedMonth: string = '11'; // Mes por defecto: Enero
  months = [
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

  monthlyAverage: number = 0;
  showDetailsModal: boolean = false;
  selectedDay: string = '';
  selectedDayCount: number = 0;
  analysisMessage: string = '';

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
     this.onGrowthMonthChange(this.selectedGrowthMonth);

    if (isPlatformBrowser(this.platformId)) {
    this.loadDashboardData();
    this.loadSunburstData(this.selectedMonth);
    this.firebaseService.getPublications().subscribe(publications => {
      const chartData = this.prepareGrowthRateData(publications);
      this.createCategoryBarChart(chartData);
    });
    }
  }

  // Función para cambiar el mes seleccionado
  onMonthChange(event: MatSelectChange): void {
    this.selectedMonth = event.value;
    this.loadSunburstData(this.selectedMonth);
  }

// Función para cargar los datos del gráfico de distribución de publicaciones por día
  loadSunburstData(month: string): void {
    this.firebaseService.getPublications().subscribe(publications => {
      const chartData = this.prepareSunburstData(publications, month);
      this.calculateMonthlyAverage(chartData.data);
      this.createSunburstChart(chartData);
    });
  }

  // Función para preparar los datos del gráfico de distribución de publicaciones por día
  prepareSunburstData(publications: any[], month: string): any {
    const groupedData: { [day: string]: { count: number } } = {};

    publications.forEach(pub => {
      const dateStr = pub.fecha_ayudantia;
      if (dateStr) {
        const [day, pubMonth, year] = dateStr.split('-').map((part: string) => parseInt(part, 10));
        if (pubMonth === parseInt(month)) {
          const formattedDay = `${day.toString().padStart(2, '0')}`;

          if (!groupedData[formattedDay]) {
            groupedData[formattedDay] = { count: 0 };
          }
          groupedData[formattedDay].count++;
        }
      }
    });

    const labels: string[] = [];
    const data: number[] = [];
    const backgroundColors: string[] = [];

    Object.keys(groupedData).forEach(day => {
      labels.push(`Día ${day}`);
      data.push(groupedData[day].count);
      backgroundColors.push(this.getRandomColor());
    });

    return { labels, data, backgroundColors };
  }

  // Función para crear el gráfico de distribución de publicaciones por día
  createSunburstChart(chartData: any): void {
    if (isPlatformBrowser(this.platformId)) {
        const ctx = document.getElementById('sunburstChart') as HTMLCanvasElement;

        if (ctx) {
            if (this.sunburstChart) {
                this.sunburstChart.destroy();
            }

            this.sunburstChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: 'Publicaciones Diarias',
                        data: chartData.data,
                        backgroundColor: chartData.backgroundColors,
                        borderWidth: 1,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false, // Ocultar las etiquetas fuera del gráfico
                        },
                        tooltip: {
                            enabled: false // Desactivar tooltips para evitar conflictos visuales
                        },
                        datalabels: {
                            color: '#fff', // Color de las etiquetas internas
                            formatter: (value, ctx) => {
                                const labels = ctx.chart.data.labels;
                                // Verificamos si las etiquetas están definidas antes de acceder a ellas
                                if (labels && Array.isArray(labels) && labels[ctx.dataIndex]) {
                                    const label = labels[ctx.dataIndex];
                                    return `${label}`;
                                }
                                return ''; // Devuelve un string vacío si no hay etiquetas
                            },
                            anchor: 'center',
                            align: 'center',
                            clamp: true,
                            font: {
                                weight: 'bold',
                                size: 16 // Tamaño de fuente más grande para las etiquetas internas
                            }
                        }
                    },
                    onClick: (event, elements) => {
                        if (elements.length) {
                            const index = elements[0].index;
                            this.onSegmentClick(index, chartData);
                        }
                    },
                },
                plugins: [ChartDataLabels]
            });
        }
    }
 }

  // Función para mostrar los detalles del día al hacer clic en un segmento
  onSegmentClick(index: number, chartData: any): void {
    const selectedLabel = chartData.labels[index];
    const selectedCount = chartData.data[index];
    this.selectedDay = selectedLabel;
    this.selectedDayCount = selectedCount;

    // Determina el análisis según el valor seleccionado
    if (selectedCount > this.monthlyAverage) {
        this.analysisMessage = 'El número de publicaciones está por encima del promedio mensual. Buen trabajo.';
    } else if (selectedCount < this.monthlyAverage) {
        this.analysisMessage = 'El número de publicaciones está por debajo del promedio mensual. Considere revisar la actividad de ese día.';
    } else {
        this.analysisMessage = 'El número de publicaciones es igual al promedio mensual.';
    }

    // Abre el modal con los datos relevantes
    this.dialog.open(ModalDetallesDiaComponent, {
        data: {
            selectedDay: this.selectedDay,
            selectedDayCount: this.selectedDayCount,
            monthlyAverage: this.monthlyAverage,
            analysisMessage: this.analysisMessage
        }
    });
  }

 // Función para calcular el promedio mensual
  calculateMonthlyAverage(data: number[]): void {
    const total = data.reduce((a, b) => a + b, 0);
    this.monthlyAverage = data.length ? parseFloat((total / data.length).toFixed(2)) : 0;
  }

  closeModal(): void {
    this.showDetailsModal = false;
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

  loadDashboardData(): void {
    // Cargar usuarios activos
    this.firebaseService.getUsuariosActivos().subscribe(usuariosActivos => {
      this.totalUsuariosActivos = usuariosActivos;
    });

    // Cargar tutores
    this.firebaseService.getUsuariosPorTipo('TUTOR').subscribe(tutores => {
      this.totalTutores = tutores.length;
    });

    // Cargar estudiantes
    this.firebaseService.getUsuariosPorTipo('ESTUDIANTE').subscribe(estudiantes => {
      this.totalEstudiantes = estudiantes.length;
    });

    // Cargar publicaciones en curso
    this.firebaseService.getAllPublications().subscribe(publicaciones => {
      this.totalPublicaciones = publicaciones.length;
    });

    // Cargar ayudantías en curso
    this.firebaseService.getAyudantias().subscribe(ayudantias => {
      this.totalAyudantias = ayudantias.length;
    });
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
      const filteredPublications = publications.filter(pub => pub.categoria === category);

      this.dialog.open(ModalTasaComponent, {
        width: '500px',
        data: {
          category,
          count,
          average: filteredPublications.length ? count / filteredPublications.length : 0, // Calcular el promedio
          publications: filteredPublications.map(pub => ({
            title: pub.titulo || 'Sin título',
            date: pub.fecha_ayudantia || 'Sin fecha'
          }))
        }
      });
    });
  }




  // Función para calcular la tasa de crecimiento
  calculateGrowthRate(publications: any[]): void {
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const currentYear = new Date().getFullYear();

    const currentMonthCount = publications.filter(pub => {
      const [day, month, year] = pub.fecha_ayudantia.split('-').map(Number);
      return month === currentMonth + 1 && year === currentYear;
    }).length;

    const lastMonthCount = publications.filter(pub => {
      const [day, month, year] = pub.fecha_ayudantia.split('-').map(Number);
      return month === lastMonth + 1 && year === currentYear;
    }).length;

    this.growthRate = lastMonthCount === 0 ? 0 : ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100;
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
    if (isPlatformBrowser(this.platformId)) {
      const ctx = document.getElementById('growthRateChart') as HTMLCanvasElement;
  
      if (ctx) {
        if (this.growthRateChart) {
          this.growthRateChart.destroy();
        }
  
        const average = chartData.data.reduce((a, b) => a + b, 0) / chartData.data.length; // Calcular el promedio
  
        this.growthRateChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: chartData.labels, // Categorías en el eje X
            datasets: [
              {
                label: 'Número de Publicaciones',
                data: chartData.data, // Cantidades por categoría
                backgroundColor: chartData.labels.map((label, index) =>
                  chartData.data[index] > average ? 'rgba(54, 162, 235, 0.8)' : 'rgba(255, 99, 132, 0.8)'
                ), // Colores dinámicos según promedio
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 1
              },
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: 'top' },
              tooltip: {
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
                  stepSize: 1, // Asegura números enteros
                  callback: (value) => Number.isInteger(value) ? value : null // Filtra valores no enteros
                }
              }
            }
          }
        });
      }
    }
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

