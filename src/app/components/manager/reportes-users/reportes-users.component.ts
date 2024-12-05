import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Reportes } from '../../../models/reportes';

@Component({
  selector: 'app-reportes-users',
  standalone: true,
  imports: [],
  templateUrl: './reportes-users.component.html',
  styleUrl: './reportes-users.component.css'
})

export class ReportesUsersComponent implements OnInit {
  reportes$: Observable<Reportes[]>;
  estados: string[] = ['en curso', 'resuelto', 'no resuelto'];

  constructor(private firestore: Firestore) {
    this.reportes$ = this.getReportes();
  }

  ngOnInit(): void {
    this.reportes$.subscribe((reportes) => {
      const dataByEstado = this.estados.map((estado) => ({
        estado,
        count: reportes.filter((reporte) => reporte.estado === estado).length,
      }));

      this.renderChart(dataByEstado);
    });
  }

  getReportes(): Observable<Reportes[]> {
    const ref = collection(this.firestore, 'Reportes');
    return collectionData(ref, { idField: 'id' }) as Observable<Reportes[]>;
  }

  renderChart(dataByEstado: { estado: string; count: number }[]): void {
    new Chart('reportChart', {
      type: 'line',
      data: {
        labels: dataByEstado.map((data) => data.count.toString()), // Cantidades en el eje X
        datasets: dataByEstado.map((data) => ({
          label: data.estado, // Cada línea representa un estado
          data: [data.count], // Cantidad del estado
          borderColor: this.getRandomColor(),
          borderWidth: 2,
          fill: false,
          pointBackgroundColor: this.getRandomColor(),
          pointRadius: 5,
        })),
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top', // Mostrar la leyenda en la parte superior
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Cantidad de reportes',
            },
            beginAtZero: true,
          },
          y: {
            type: 'category', // Muestra los estados como categorías en el eje Y
            labels: this.estados, // Asigna los estados como etiquetas del eje Y
            title: {
              display: true,
              text: 'Estados',
            },
          },
        },
        elements: {
          line: {
            tension: 0, // Desactiva la curvatura de las líneas
          },
        },
      },
    });
  }


  getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}



