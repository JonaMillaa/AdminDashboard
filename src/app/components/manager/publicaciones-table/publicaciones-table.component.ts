import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FirebaseService } from '../../../firebase/firebase.service';
import { MatTableDataSource, MatTableModule} from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { Chart } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-publicaciones-table',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    CommonModule,
    FormsModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatPaginator,
    MatTooltipModule,
    MatCardModule
  ],
  templateUrl: './publicaciones-table.component.html',
  styleUrl: './publicaciones-table.component.css'
})

export class PublicacionesTableComponent implements OnInit {
  @Input() publicaciones: any[] = [];

  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [
    'nombre',
    'apellido',
    // 'categoria',
    'estado',
    'formato',
    'fecha_ayudantia',
    'hora',
    'detalle_ubicacion',
    'duracion',
    'titulo_ayudantia',
    'participantes',
    'descripcion_ayudantia'
  ];
  filtroEstado: string = '';
  filtroFormato: string = '';
  filtroBusqueda: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private firebaseService: FirebaseService, 
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarPublicaciones();
    this.loadKPIs();
  }

  cargarPublicaciones(): void {
    this.firebaseService.getPublications().subscribe(publicaciones => {
      this.publicaciones = publicaciones;
      this.actualizarTabla();
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  actualizarTabla(): void {
    let dataFiltrada = this.publicaciones;

    // Filtro por estado
    if (this.filtroEstado) {
      dataFiltrada = dataFiltrada.filter(pub => pub.estado === this.filtroEstado);
    }

    // Filtro por formato
    if (this.filtroFormato) {
      dataFiltrada = dataFiltrada.filter(pub => pub.formato === this.filtroFormato);
    }

    // Filtro por búsqueda (nombre o apellido)
    if (this.filtroBusqueda) {
      const busquedaLower = this.filtroBusqueda.toLowerCase();
      dataFiltrada = dataFiltrada.filter(pub => {
        const nombre = pub.info_ayudantia.info_usuario.nombre?.toLowerCase() || '';
        const apellido = pub.info_ayudantia.info_usuario.apellido?.toLowerCase() || '';
        return nombre.includes(busquedaLower) || apellido.includes(busquedaLower);
      });
    }

    // Actualizamos el dataSource
    this.dataSource.data = dataFiltrada;

    // Si no se encuentran resultados, mostramos un mensaje de Snackbar
    if (dataFiltrada.length === 0) {
      this.mostrarMensaje('No se encontraron resultados para los filtros aplicados.');
    }
  }

  mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000, // Duración del mensaje en milisegundos
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-custom']
    });
  }

  aplicarFiltros(): void {
    this.actualizarTabla();
  }

  // aplicarFiltros(): void {
  //   const filtroEstado = this.filtroEstado.toLowerCase();
  //   const filtroFormato = this.filtroFormato.toLowerCase();
  //   const filtroBusqueda = this.filtroBusqueda.toLowerCase();

  //   this.dataSource.filterPredicate = (data: any, filter: string) => {
  //     const matchEstado = filtroEstado ? data.estado.toLowerCase().includes(filtroEstado) : true;
  //     const matchFormato = filtroFormato ? data.formato.toLowerCase().includes(filtroFormato) : true;
  //     const matchBusqueda = filtroBusqueda
  //       ? (data.info_usuario.nombre.toLowerCase() + ' ' + data.info_usuario.apellido.toLowerCase()).includes(filtroBusqueda)
  //       : true;

  //     return matchEstado && matchFormato && matchBusqueda;
  //   };

  //   this.dataSource.filter = `${filtroEstado}${filtroFormato}${filtroBusqueda}`.trim().toLowerCase();
  // }

  limpiarFiltros(): void {
    this.filtroEstado = '';
    this.filtroFormato = '';
    this.filtroBusqueda = '';
    this.actualizarTabla();
  }


  // KPIs y Gráficos 

  totalAyudantiasActivas: number = 0;
  // promedioDuracion: number = 0;
  participantesTotales: number = 50; // Dato fijo como ejemplo
  pendingPublicationData: { PUBLICADO: number; FINALIZADA: number } = { PUBLICADO: 0, FINALIZADA: 0 };
  mostUsedFormatData: { PRESENCIAL: number; REMOTO: number } = { PRESENCIAL: 0, REMOTO: 0 };
  promedioDuracion: string = '0.0'; // Guardado como string para formatear a dos dígitos
  promedioParticipantes: number = 0; // Número entero


  loadKPIs(): void {
    this.firebaseService.getPublications().subscribe((publications: any[]) => {
      // Total de ayudantías activas
      this.totalAyudantiasActivas = publications.filter(pub => pub.estado === 'EN_CURSO').length;

      // Promedio de duración
      const duraciones = publications.map(pub => parseInt(pub.duracion, 10));
      const totalDuracion = duraciones.reduce((a, b) => a + b, 0);
      this.promedioDuracion = publications.length
        ? (totalDuracion / publications.length).toFixed(1)
        : '0.0';

      // Promedio de participantes (como número entero)
      const participantes = publications.map(pub => parseInt(pub.participantes, 10));
      const totalParticipantes = participantes.reduce((a, b) => a + b, 0);
      this.promedioParticipantes = publications.length
        ? Math.round(totalParticipantes / publications.length)
        : 0;

      // Datos para gráficas
      this.pendingPublicationData = this.calculateStateData(publications, ['PUBLICADO', 'FINALIZADA']);
      // this.mostUsedFormatData = this.calculateFormatData(publications, 'EN_CURSO');
      this.mostUsedFormatData = this.calculateFormatData(publications, 'FINALIZADA');

      // Crear gráficos
      this.createPieChart('pendingPublicationPieChart', this.pendingPublicationData, 'Estado de Ayudantías');
      this.createPieChart('mostUsedFormatPieChart', this.mostUsedFormatData, 'Formato Más Utilizado');
    });
  }

  calculateStateData(
    publications: any[],
    estados: ('PUBLICADO' | 'FINALIZADA')[]
  ): { PUBLICADO: number; FINALIZADA: number } {
    // Inicializamos el objeto con las claves específicas
    const data: { PUBLICADO: number; FINALIZADA: number } = { PUBLICADO: 0, FINALIZADA: 0 };
  
    publications.forEach(pub => {
      if (estados.includes(pub.estado)) {
        // Aseguramos que pub.estado sea del tipo esperado
        const estado = pub.estado as 'PUBLICADO' | 'FINALIZADA';
        data[estado]++;
      }
    });
  
    return data;
  }
  
  calculateFormatData(publications: any[], estado: string): { PRESENCIAL: number; REMOTO: number } {
    const data: { PRESENCIAL: number; REMOTO: number } = { PRESENCIAL: 0, REMOTO: 0 };
    publications.forEach((pub: any) => {
      if (pub.estado === estado) { // Verifica si el estado coincide
        const formato: 'PRESENCIAL' | 'REMOTO' = pub.formato;
        if (data[formato] !== undefined) {
          data[formato]++;
        }
      }
    });
    return data;
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

  // Función para obtener un color aleatorio
  // getRandomColor(): string {
  //   const letters = '0123456789ABCDEF';
  //   let color = '#';
  //   for (let i = 0; i < 6; i++) {
  //     color += letters[Math.floor(Math.random() * 16)];
  //   }
  //   return color;
  // }

  createPieChart(chartId: string, data: { [key: string]: number }, label: string): void {
    const ctx = document.getElementById(chartId) as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: Object.keys(data),
          datasets: [
            {
              data: Object.values(data),
              backgroundColor: Object.keys(data).map(() => this.getRandomColor())
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top'
            },
            datalabels: {
              color: '#ffffff', // Color del texto dentro del gráfico
              font: {
                weight: 'bold',
                size: 16
              },
              formatter: (value: number) => value.toString() // Mostrar cantidad dentro del gráfico
            }
          }
        },
        plugins: [ChartDataLabels] // Plugin para etiquetas
      });
    }
  }
}

