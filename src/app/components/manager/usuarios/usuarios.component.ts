
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FirebaseService } from '../../../firebase/firebase.service';
import { Observable, of } from 'rxjs';
import { Usuario } from '../../../models/usuario.model';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Chart } from 'chart.js/auto'; // Importa Chart.js para gráficos
import { CrecimientoUsuario } from '../../../models/CrecimientoUsuario';
import { LoginData } from '../../../models/LoginData';
import { FormsModule } from '@angular/forms'; // Importa FormsModule


@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatTabsModule,
    MatCardModule,
    MatIconModule,
    FormsModule,
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})


export class UsuariosComponent implements OnInit, AfterViewInit {
  usuarios$: Observable<Usuario[]> = of([]);
  tutores$: Observable<Usuario[]> = of([]);
  estudiantes$: Observable<Usuario[]> = of([]);
  totalTutores: number = 0;
  totalEstudiantes: number = 0;

  mostrarContenido: boolean = false;

  crecimientoUsuariosChart: any;
  loginsChart: any;

  // Filtros independientes de unidad de tiempo para cada gráfico
  filtroTiempoCrecimiento: 'día' | 'mes' = 'mes';
  filtroTiempoLogins: 'día' | 'mes' = 'mes';

  private meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];


  constructor(private firebaseService: FirebaseService) { }

  ngOnInit(): void {
    this.usuarios$ = this.firebaseService.getUsuarios();
    this.tutores$ = this.firebaseService.getUsuariosPorTipo('TUTOR');
    this.estudiantes$ = this.firebaseService.getUsuariosPorTipo('ESTUDIANTE');

    this.tutores$.pipe(
      map((tutores: Usuario[]) => tutores.length)
    ).subscribe((count: number) => this.totalTutores = count);

    this.estudiantes$.pipe(
      map((estudiantes: Usuario[]) => estudiantes.length)
    ).subscribe((count: number) => this.totalEstudiantes = count);
  }

  ngAfterViewInit(): void {
    if (!this.mostrarContenido) {
      this.loadCrecimientoUsuariosData();
      this.loadLoginsData();
    }
  }

  toggleContenido(): void {
    this.mostrarContenido = !this.mostrarContenido;

    if (!this.mostrarContenido) {
      setTimeout(() => {
        this.destroyCharts(); // Destruir gráficos existentes antes de crear nuevos
        this.loadCrecimientoUsuariosData();
        this.loadLoginsData();
      }, 0);
    } else {
      this.destroyCharts(); // Destruir gráficos si el contenido de usuarios está visible
    }
  }


  // Método para agrupar datos por unidad de tiempo seleccionada
  private agruparPorTiempo(data: any[], tiempo: 'día' | 'mes') {
    const agrupados = new Map<string, number>();

    data.forEach(item => {
      const [day, month, year] = item.fecha.split('-'); // Asumimos que la fecha está en formato 'dd-mm-yyyy'
      const fecha = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)); // Convertimos a objeto Date

      let clave: string;

      if (tiempo === 'mes') {
        clave = `${this.meses[fecha.getMonth()]} ${fecha.getFullYear()}`; // Ejemplo: 'noviembre 2024'
      } else {
        clave = `${day}-${month}-${year}`; // Ejemplo: '12-11-2024'
      }

      if (agrupados.has(clave)) {
        agrupados.set(clave, agrupados.get(clave)! + item.contador);
      } else {
        agrupados.set(clave, item.contador);
      }
    });

    return {
      labels: Array.from(agrupados.keys()),
      counts: Array.from(agrupados.values())
    };
  }

  public loadCrecimientoUsuariosData(): void {

    // Destruir el gráfico anterior si existe
    if (this.crecimientoUsuariosChart) {
      this.crecimientoUsuariosChart.destroy();
      this.crecimientoUsuariosChart = null;
    }
  
    this.firebaseService.getCrecimientoUsuarios().subscribe((data) => {
      const { labels, counts } = this.agruparPorTiempo(data, this.filtroTiempoCrecimiento);
  
      this.crecimientoUsuariosChart = new Chart('crecimientoUsuariosChart', {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Crecimiento de Usuarios',
            data: counts,
            fill: false,
            borderColor: 'blue',
            borderWidth: 2,
            pointBackgroundColor: 'blue',
            pointRadius: 5,
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: { 
                display: true, 
                text: 'Fecha',
                color: '#333',
                font: {
                  size: 15,
                  weight: 'bold'
                },
              },
              ticks: {
                color: '#666',
                font: {
                  size: 12
                }
              },
              grid: {
                color: '#e0e0e0',
                lineWidth: 1
              }
            },
            y: {
              title: { 
                display: true, 
                text: 'Usuarios Nuevos',
                color: '#333',
                font: {
                  size: 15,
                  weight: 'bold'
                }
              },
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                color: '#666',
                font: {
                  size: 12
                },
                callback: function (value) {
                  return Number.isInteger(value) ? value : null;
                }
              },
              grid: {
                color: '#e0e0e0',
                lineWidth: 1
              },
              suggestedMin: 0
            }
          },
          plugins: {
            legend: {
              display: true,
              labels: {
                color: '#333', // Color de la etiqueta de la leyenda
                font: {
                  size: 14,
                  weight: 'bold'
                },
                padding: 20, // Espaciado entre leyenda y gráfico
                boxWidth: 15, // Ancho de la caja de color de la leyenda
                boxHeight: 15, // Altura de la caja de color de la leyenda
              
              }
            }
          }
        }
      });
    });
  }
  
  
  public loadLoginsData(): void {

    // Destruir el gráfico anterior si existe
    if (this.loginsChart) {
      this.loginsChart.destroy();
      this.loginsChart = null;
    }
  
    this.firebaseService.getLoginsUsuarios().subscribe((data) => {
      const { labels, counts } = this.agruparPorTiempo(data, this.filtroTiempoLogins);
  
      this.loginsChart = new Chart('loginsChart', {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Inicios de Sesión',
            data: counts,
            backgroundColor: 'rgba(75, 192, 192, 0.3)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            hoverBackgroundColor: 'rgba(75, 192, 192, 0.6)',
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: { 
                display: true, 
                text: 'Fecha',
                color: '#333',
                font: {
                  size: 15,
                  weight: 'bold'
                }
              },
              ticks: {
                color: '#666',
                font: {
                  size: 12
                }
              },
              grid: {
                color: '#e0e0e0',
                lineWidth: 1
              }
            },
            y: {
              title: { 
                display: true, 
                text: 'Inicios de Sesión',
                color: '#333',
                font: {
                  size: 15,
                  weight: 'bold'
                }
              },
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                color: '#666',
                font: {
                  size: 12
                },
                callback: function (value) {
                  return Number.isInteger(value) ? value : null;
                }
              },
              grid: {
                color: '#e0e0e0',
                lineWidth: 1
              },
              suggestedMin: 0
            }
          },
          plugins: {
            legend: {
              display: true,
              labels: {
                color: '#333', // Color de la etiqueta de la leyenda
                font: {
                  size: 14,
                  weight: 'bold'
                },
                padding: 20, // Espaciado entre leyenda y gráfico
                boxWidth: 15, // Ancho de la caja de color de la leyenda
                boxHeight: 15, // Altura de la caja de color de la leyenda
              }
            }
          }
        }
      });
    });
  }
  

  private destroyCharts(): void {
    if (this.crecimientoUsuariosChart) {
      this.crecimientoUsuariosChart.destroy();
      this.crecimientoUsuariosChart = null;
    }
    if (this.loginsChart) {
      this.loginsChart.destroy();
      this.loginsChart = null;
    }
  }

}


