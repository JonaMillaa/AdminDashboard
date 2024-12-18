import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FirebaseService } from '../../../../firebase/firebase.service';
import { Chart } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-publicaciones-mes-dashboard',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, MatOptionModule, CommonModule],
  templateUrl: './publicaciones-mes-dashboard.component.html',
  styleUrls: ['./publicaciones-mes-dashboard.component.css'],
})
export class PublicacionesMesDashboardComponent implements OnInit {
  selectedYear: string = new Date().getFullYear().toString();
  years: string[] = [];
  noPublications: boolean = false;
  barChart: any;
  months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  professionalColors = [
    '#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F', '#EDC949',
    '#AF7AA1', '#FF9DA7', '#9C755F', '#BAB0AC', '#5F9EA0', '#FFB347'
  ];

  constructor(
    private firebaseService: FirebaseService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadAvailableYears();
    this.updateBarChart(this.selectedYear);
  }

  loadAvailableYears(): void {
    this.firebaseService.getPublications().subscribe((publications) => {
      const yearsSet = new Set<string>();
      publications.forEach((pub) => {
        const [, , year] = pub.fecha_ayudantia.split('-');
        yearsSet.add(year);
      });
      this.years = Array.from(yearsSet).sort();
    });
  }

  updateBarChart(year: string): void {
    this.firebaseService.getPublications().subscribe((publications) => {
      const chartData = this.prepareBarChartData(publications, year);
      this.noPublications = chartData.data.every((count: number) => count === 0);
      if (!this.noPublications) {
        this.createBarChart(chartData, year);
      }
    });
  }

  prepareBarChartData(publications: any[], year: string) {
    const monthlyCounts = Array(12).fill(0);
    publications.forEach((pub) => {
      const [, month, pubYear] = pub.fecha_ayudantia.split('-');
      if (pubYear === year) {
        monthlyCounts[+month - 1] += 1;
      }
    });
    return { labels: this.months, data: monthlyCounts };
  }

  createBarChart(chartData: any, year: string): void {
    const ctx = document.getElementById('barChart') as HTMLCanvasElement;
    if (ctx) {
      if (this.barChart) this.barChart.destroy();
      this.barChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: chartData.labels,
          datasets: [
            {
              label: `Publicaciones por Mes en el Año ${year}`,
              data: chartData.data,
              backgroundColor: this.professionalColors,
              borderColor: '#fff',
              borderWidth: 2,
              hoverBackgroundColor: '#80B1D3',
            },
          ],
        },
        options: {
          responsive: true,
          animation: {
            duration: 2000,
            easing: 'easeOutBounce',
          },
          plugins: {
            legend: { display: true },
            title: {
              display: true,
              text: `Resumen de Publicaciones por Mes en ${year}`,
              color: '#444',
              font: { size: 20, weight: 'bold' },
              padding: { top: 10, bottom: 20 },
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem) => {
                  const value = tooltipItem.raw;
                  return ` Publicaciones: ${value}`;
                },
              },
            },
            datalabels: {
              anchor: 'end',
              align: 'end',
              color: '#333',
              font: { size: 12, weight: 'bold' },
              formatter: (value) => (value > 0 ? value : ''),
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Meses',
                color: '#444',
                font: { weight: 'bold' },
              },
              grid: { display: false },
              ticks: { color: '#555' },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Cantidad de Publicaciones',
                color: '#444',
                font: { weight: 'bold' },
              },
              grid: { color: '#ddd' },
              ticks: { stepSize: 1, color: '#555' },
            },
          },
        },
        plugins: [ChartDataLabels],
      });
    }
  }

  onYearChange(event: any): void {
    this.selectedYear = event.value;
    this.updateBarChart(this.selectedYear);
  }
}
