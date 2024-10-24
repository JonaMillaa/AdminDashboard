import { Component, OnInit,Inject, PLATFORM_ID} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

import { FirebaseService } from '../../firebase/firebase.service';
import { Observable, of, forkJoin } from 'rxjs';
import  {Chart}  from 'chart.js/auto';

import { MatDialog } from '@angular/material/dialog';
import { ModalTasaComponent } from './../modal-tasa/modal-tasa.component';

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
    MatProgressSpinnerModule
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
  averageMonthly: number = 0;
  averageWeekly: number = 0;
  declineRate: number = 0;

  growthRateChart: any;
  averageChart: any;
  declineChart: any;

  constructor(
    private firebaseService: FirebaseService, 
    @Inject(PLATFORM_ID) private platformId: Object,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadIndicators();
  }

  //Función para abrir el modal
  openDetailsModal(month: string, currentCount: number, prevCount: number, growthRate: number): void {
    this.dialog.open(ModalTasaComponent, {
      width: '500px',
      data: {
        month,
        currentCount,
        prevCount,
        growthRate
      }
    });
  }

  

  selectedMonth: string = '';
  selectedCurrentCount: number = 0;
  selectedPrevCount: number = 0;

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

  loadIndicators(): void {
    this.firebaseService.getAllPublications().subscribe(publications => {
        const growthData = this.prepareGrowthRateData(publications);
        const averageData = this.prepareAverageData(publications);
        const declineData = this.prepareDeclineData(publications);

        // Crear gráficos una sola vez con los datos recibidos
        this.createGrowthRateChart(growthData);
        this.createAverageChart(averageData);
    });
  }


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


  calculateAverages(publications: any[]): void {
    const totalMonths = 12;
    const totalWeeks = 52;

    const monthlyCount = new Array(totalMonths).fill(0);
    const weeklyCount = new Array(totalWeeks).fill(0);

    publications.forEach(pub => {
      const [day, month, year] = pub.fecha_ayudantia.split('-').map(Number);
      monthlyCount[month - 1]++;

      const date = new Date(year, month - 1, day);
      const weekNumber = this.getWeekNumber(date);
      weeklyCount[weekNumber - 1]++;
    });

    this.averageMonthly = publications.length / totalMonths;
    this.averageWeekly = publications.length / totalWeeks;
  }

  createGrowthRateChart(chartData: any): void {
    if (isPlatformBrowser(this.platformId)) {
      const ctx = document.getElementById('growthRateChart') as HTMLCanvasElement;
  
      if (ctx) {
        if (this.growthRateChart) {
          this.growthRateChart.destroy();
        }
  
        this.growthRateChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: chartData.labels,
            datasets: [{
              label: 'Tasa de Crecimiento',
              data: chartData.data,
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 2,
              fill: true,
              pointRadius: 5,
              pointHoverRadius: 8
            }]
          },
          options: {
            onClick: (event, elements) => {
              if (elements.length) {
                this.onPointClick(elements, chartData.rawData);
              }
            },
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
                  text: 'Crecimiento (%)',
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
  }  

  onPointClick(elements: any, chartData: any): void {
    const index = elements[0]?.index;
    if (index !== undefined) {
      const selectedData = chartData[index];
  
      this.openDetailsModal(
        selectedData.label,
        selectedData.currentCount,
        selectedData.prevCount,
        selectedData.growthRate
      );
    }
  }
  

  createAverageChart(chartData: any): void {
  // Verificar si estamos en el entorno del navegador antes de acceder al DOM
  if (isPlatformBrowser(this.platformId)) {

    const ctx = document.getElementById('averagePublicationsChart') as HTMLCanvasElement;

    if (ctx) {
        // Verificar si ya existe un gráfico y destruirlo antes de crear uno nuevo
        if (this.averageChart) {
            this.averageChart.destroy();
        }

        // Crear el nuevo gráfico
        this.averageChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Promedio de Publicaciones',
                    data: chartData.data,
                    backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 206, 86, 0.6)'],
                    borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)'],
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
                            text: 'Periodo',
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
  }

  // Esta función calculará la tasa de decrecimiento en las publicaciones, 
  // comparando meses en los que hubo menos publicaciones en comparación con el mes anterior:
  prepareDeclineData(publications: any[]): any {
    const groupedData: { [monthYear: string]: number } = {};

    // Agrupar publicaciones por mes
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
        const [monthA, yearA] = a.split('-').map(part => parseInt(part, 10));
        const [monthB, yearB] = b.split('-').map(part => parseInt(part, 10));

        const dateA = new Date(yearA, monthA - 1);
        const dateB = new Date(yearB, monthB - 1);

        return dateA.getTime() - dateB.getTime();
    });

    // Calcular tasa de decrecimiento entre meses
    const data = labels.map((label, index) => {
        if (index === 0) return 0; // El primer mes no tiene decrecimiento comparativo
        const prevCount = groupedData[labels[index - 1]];
        const currentCount = groupedData[label];
        return prevCount > currentCount ? ((prevCount - currentCount) / prevCount) * 100 : 0; // Tasa de decrecimiento en porcentaje
    });

    return { labels, data };
  }

  //Esta función calculará la tasa de crecimiento comparando el número de publicaciones en meses consecutivos
  prepareGrowthRateData(publications: any[]): any {
    const groupedData: { [monthYear: string]: number } = {};
  
    // Agrupar publicaciones por mes y año
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
  
    // Ordenar las etiquetas de los meses
    const labels = Object.keys(groupedData).sort((a, b) => {
      const [monthA, yearA] = a.split('-').map((part: string) => parseInt(part, 10));
      const [monthB, yearB] = b.split('-').map((part: string) => parseInt(part, 10));
      const dateA = new Date(yearA, monthA - 1);
      const dateB = new Date(yearB, monthB - 1);
      return dateA.getTime() - dateB.getTime();
    });
  
    // Calcular los datos para el gráfico
    const data = labels.map((label, index) => {
      const currentCount = groupedData[label];
      const prevCount = index > 0 ? groupedData[labels[index - 1]] : 0;
      const growthRate = prevCount ? ((currentCount - prevCount) / prevCount) * 100 : 0;
      return {
        label,
        currentCount,
        prevCount,
        growthRate: parseFloat(growthRate.toFixed(2)) // Limitar a dos decimales
      };
    });
  
    return {
      labels: data.map(d => d.label),
      data: data.map(d => d.growthRate),
      rawData: data // Información detallada para el modal
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

