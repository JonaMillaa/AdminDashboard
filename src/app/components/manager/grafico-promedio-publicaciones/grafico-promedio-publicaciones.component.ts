import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { collection, query, where, collectionData } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';

//Gráfico
import { Chart } from 'chart.js'; // Importamos Chart.js

interface PromedioPorCategoria {
  categoria: string;
  promedioDuracion: string;
  fecha: string;
}

@Component({
  selector: 'app-grafico-promedio-publicaciones',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,

  ],
  templateUrl: './grafico-promedio-publicaciones.component.html',
  styleUrl: './grafico-promedio-publicaciones.component.css'
})

export class GraficoPromedioPublicacionesComponent implements OnInit {
  // Definir los datos que se mostrarán en la tabla
  displayedColumns: string[] = ['categoria', 'promedioDuracion', 'fecha'];

  // Inicializar dataSource con el tipo adecuado
  dataSource: MatTableDataSource<PromedioPorCategoria> = new MatTableDataSource<PromedioPorCategoria>([]);

  // Obtener la referencia del paginator
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;

  constructor(private firestore: Firestore) {}

  ngOnInit(): void {
    // Obtener las publicaciones finalizadas
    this.getFinalizedPublicaciones().subscribe(publicaciones => {
      // Calcular el promedio por categoría
      const promedioPorCategoria = this.calcularPromedioPorCategoria(publicaciones);
      // Asignar el resultado procesado al dataSource
      this.dataSource.data = promedioPorCategoria;
    });
  }

  //tabla

  // Función para obtener las publicaciones finalizadas de Firebase
  getFinalizedPublicaciones(): Observable<any[]> {
    const publicacionesRef = collection(this.firestore, 'Publicaciones');
    const q = query(publicacionesRef, where('estado', '==', 'FINALIZADA'));
    return collectionData(q, { idField: 'ID' });
  }
  // Función para calcular el promedio de duración por categoría
  calcularPromedioPorCategoria(publicaciones: any[]): PromedioPorCategoria[] {
    // Definir el tipo para el objeto de categorías
    const categorias: { [key: string]: { totalDuracion: number; count: number; fecha: string } } = {};

    // Recorrer las publicaciones y agrupar por categoría
    publicaciones.forEach(publicacion => {
      // Convertir duración de texto a número (en minutos)
      const duracion = parseInt(publicacion.duracion, 10);
      if (!isNaN(duracion)) {
        // Si la categoría ya existe, agregamos la duración
        if (!categorias[publicacion.info_ayudantia.categoria]) {
          categorias[publicacion.info_ayudantia.categoria] = { totalDuracion: 0, count: 0, fecha: publicacion.fecha_ayudantia };
        }
        categorias[publicacion.info_ayudantia.categoria].totalDuracion += duracion;
        categorias[publicacion.info_ayudantia.categoria].count++;
      }
    });

    // Calcular el promedio de duración por categoría
    const promedioPorCategoria: PromedioPorCategoria[] = [];
    for (const categoria in categorias) {
      if (categorias.hasOwnProperty(categoria)) {
        const promedio = categorias[categoria].totalDuracion / categorias[categoria].count;
        promedioPorCategoria.push({
          categoria: categoria,
          promedioDuracion: promedio.toFixed(2), // Redondeamos a dos decimales
          fecha: categorias[categoria].fecha
        });
      }
    }

    // Función para convertir fecha en formato "dd-MM-yyyy" a objeto Date
    const convertirFecha = (fecha: string): Date => {
      const [dia, mes, anio] = fecha.split('-');
      return new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));
    };

    // Ordenar las fechas de más reciente a más antigua
    promedioPorCategoria.sort((a, b) => {
      const fechaA = convertirFecha(a.fecha);
      const fechaB = convertirFecha(b.fecha);
      return fechaB.getTime() - fechaA.getTime(); // De la más reciente a la más antigua
    });

    return promedioPorCategoria;
  }

  //Gráfico

  chart: any; // Aquí vamos a almacenar la referencia del gráfico

}
