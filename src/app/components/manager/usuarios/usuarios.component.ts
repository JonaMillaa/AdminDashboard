
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

  constructor(private firebaseService: FirebaseService) {}


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
        this.loadCrecimientoUsuariosData();
        this.loadLoginsData();
      }, 0);
    } else {
      this.destroyCharts();
    }
  }
  
  // Método para agrupar datos por unidad de tiempo seleccionada
  private agruparPorTiempo(data: any[], tiempo: 'día' | 'mes') {
    const agrupados = new Map<string, number>();

    data.forEach(item => {
      const fecha = new Date(item.fecha);
      let clave: string;

      if (tiempo === 'mes') {
        clave = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`; // Agrupación por año-mes
      } else {
        clave = `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`; // Agrupación por año-mes-día
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
    this.firebaseService.getCrecimientoUsuarios().subscribe((data) => {
      const { labels, counts } = this.agruparPorTiempo(data, this.filtroTiempoCrecimiento);

      if (this.crecimientoUsuariosChart) {
        this.crecimientoUsuariosChart.destroy();
      }

      this.crecimientoUsuariosChart = new Chart('crecimientoUsuariosChart', {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Crecimiento de Usuarios',
            data: counts,
            fill: false,
            borderColor: 'blue',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: { title: { display: true, text: 'Fecha' } },
            y: { title: { display: true, text: 'Usuarios Nuevos' } }
          }
        }
      });
    });
  }


  public loadLoginsData(): void {
    this.firebaseService.getLoginsUsuarios().subscribe((data) => {
      const { labels, counts } = this.agruparPorTiempo(data, this.filtroTiempoLogins);

      if (this.loginsChart) {
        this.loginsChart.destroy();
      }

      this.loginsChart = new Chart('loginsChart', {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Inicios de Sesión',
            data: counts,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: { title: { display: true, text: 'Fecha' } },
            y: { title: { display: true, text: 'Inicios de Sesión' } }
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


