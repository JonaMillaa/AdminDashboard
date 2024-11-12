
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


@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatTabsModule,
    MatCardModule,
    MatIconModule,
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
  
  private loadCrecimientoUsuariosData(): void {
    this.firebaseService.getCrecimientoUsuarios().subscribe((data: CrecimientoUsuario[]) => {
      if (!Array.isArray(data)) {
        console.error('Error: los datos de crecimiento de usuarios no son un arreglo', data);
        return;
      }

      const labels = data.map(item => item.mes);
      const counts = data.map(item => item.count);

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
            x: { title: { display: true, text: 'Mes' } },
            y: { title: { display: true, text: 'Usuarios Nuevos' } }
          }
        }
      });
    });
  }

  private loadLoginsData(): void {
    this.firebaseService.getLoginsUsuarios().subscribe((data: LoginData[]) => {
      if (!Array.isArray(data)) {
        console.error('Error: los datos de logins no son un arreglo', data);
        return;
      }

      const labels = data.map(item => item.mes);
      const counts = data.map(item => item.count);

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
            x: { title: { display: true, text: 'Mes' } },
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


