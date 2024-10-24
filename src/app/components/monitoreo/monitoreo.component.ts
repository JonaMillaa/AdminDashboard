import { Component, OnInit,Inject, PLATFORM_ID} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FirebaseService } from '../../firebase/firebase.service';
import { Observable, of } from 'rxjs';
import  Chart  from 'chart.js/auto';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-monitoreo',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    RouterModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './monitoreo.component.html',
  styleUrl: './monitoreo.component.css'
})

export class MonitoreoComponent {
  usuariosActivos$: Observable<number> = of(0); // Inicialización predeterminada
  ayudantiasEsteMes$: Observable<number> = of(0); // Inicialización predeterminada
  problemasResueltos$: Observable<number> = of(0);
  ayudantiasMensuales$: Observable<{ mes: string; cantidad: number }[]> = of([]);

  constructor(
    private firebaseService: FirebaseService,
    @Inject(PLATFORM_ID) private platformId: object // Detecta si es navegador o servidor
  ) {}

  ngOnInit(): void {
    // Solo ejecuta este código si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.initializeData();
      this.initializeChart();
    }
  }

  initializeData() {
    // Lógica de datos con cálculo del mes actual
    this.firebaseService.getAyudantiasMensuales().subscribe((data) => {
      const mesActual = new Date().getMonth(); // Mes actual basado en 0-indexado
      const mesActualNombre = new Date(0, mesActual).toLocaleString('es-ES', { month: 'long' });

      // Buscar las ayudantías del mes actual
      const ayudantiasMesActual = data.find((item) => item.mes === mesActualNombre);
      this.ayudantiasEsteMes$ = of(ayudantiasMesActual ? ayudantiasMesActual.cantidad : 0);
    });

    // Asignación de otros datos desde Firebase
    this.usuariosActivos$ = this.firebaseService.getUsuariosActivos();
    this.problemasResueltos$ = this.firebaseService.getProblemasResueltos();
  }


  initializeChart() {
    this.firebaseService.getAyudantiasMensuales().subscribe((data) => {

      const mesesOrdenados = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];

      const datosOrdenados = mesesOrdenados.map((mes) => {
        const entrada = data.find((item) => item.mes.toLowerCase() === mes);
        return entrada ? entrada.cantidad : 0;
      });

      const ctx = document.getElementById('ayudantiasChart') as HTMLCanvasElement;

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: mesesOrdenados,
          datasets: [
            {
              label: 'Ayudantías Mensuales',
              data: datosOrdenados,
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: (context) => `Cantidad: ${context.raw}`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
        },
      });
    });
  }
}
