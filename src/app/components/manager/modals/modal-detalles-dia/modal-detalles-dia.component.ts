
import { Component, Inject, AfterViewInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef,MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js';
import { isPlatformBrowser } from '@angular/common';
import { ModalNoDataComponent } from '../modal-no-data/modal-no-data.component';

@Component({
  selector: 'app-modal-detalles-dia',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './modal-detalles-dia.component.html',
  styleUrl: './modal-detalles-dia.component.css'
})

export class ModalDetallesDiaComponent implements AfterViewInit{

  miniTrendChart: any;
  analysisColor: string = '#000';

  constructor(
    private dialogRef: MatDialogRef<ModalNoDataComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef // Inyección de ChangeDetectorRef
  ) {}

  closeModal(): void {
    this.dialogRef.close();
  }

  ngAfterViewInit(): void {
    this.setAnalysisColor();
    setTimeout(() => {
      this.createMiniTrendChart();
    }, 200);  // Espera 200ms para asegurarse de que el canvas esté en el DOM
  }

  setAnalysisColor(): void {
    if (this.data.selectedDayCount > this.data.monthlyAverage) {
      this.analysisColor = 'green';
    } else if (this.data.selectedDayCount < this.data.monthlyAverage) {
      this.analysisColor = 'red';
    } else {
      this.analysisColor = 'orange';
    }
    this.cdr.detectChanges(); // Fuerza una nueva verificación de cambios
  }

  createMiniTrendChart(): void {
    if (isPlatformBrowser(this.platformId)) {
      const ctx = document.getElementById('miniTrendChart') as HTMLCanvasElement;

      if (ctx) {
        if (this.miniTrendChart) {
          this.miniTrendChart.destroy();
        }

        const miniChartData = this.getMiniChartData();

        // Si miniChartData es null, salimos de la función para evitar errores
        if (!miniChartData) return;

        this.miniTrendChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: miniChartData.labels,
            datasets: [{
              label: 'Tendencia de Publicaciones',
              data: miniChartData.data,
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
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
                  text: 'Días',
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
                  text: 'Publicaciones',
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
              legend: { display: false },
              tooltip: { enabled: true }
            }
          }
        });
      }
    }
  }

  getMiniChartData(): { labels: string[], data: number[] } | null {
    const selectedDay = parseInt(this.data.selectedDay.split(' ')[1], 10);

    // Comprobar si `dailyData` está definido
    if (!this.data.dailyData) {
      console.warn('dailyData no está definido en MAT_DIALOG_DATA');
      return null;  // Retornar null si `dailyData` no está disponible
    }

    const dailyData = this.data.dailyData;
    const labels = [];
    const data = [];

    for (let i = selectedDay - 3; i <= selectedDay + 3; i++) {
      if (dailyData[i] !== undefined) {
        labels.push(`Día ${i}`);
        data.push(dailyData[i]);
      } else {
        labels.push(`Día ${i}`);
        data.push(0);
      }
    }

    return { labels, data };
  }

}
