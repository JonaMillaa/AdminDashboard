import { Injectable } from '@angular/core';
import { Firestore, collection, query, where } from '@angular/fire/firestore';
import { collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ReportesService {
  constructor(private firestore: Firestore) {}

  obtenerContadorHoy(): Observable<number> {
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

    const contadorCollection = collection(this.firestore, 'Contador_inicio_sesion');
    const q = query(contadorCollection, where('fecha', '==', formattedDate));

    return collectionData(q).pipe(
      map((contadores: any[]) => {
        console.log("Datos obtenidos para Inicios de Sesión Hoy:", contadores);
        return contadores.length > 0 ? contadores[0].contador : 0;
      }),
      catchError(error => {
        console.error("Error al obtener el contador de hoy:", error);
        return [0];
      })
    );
  }

  obtenerUsuariosActivosHoy(): Observable<number> {
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

    const usuariosActivosCollection = collection(this.firestore, 'UsuariosActivos');
    const q = query(usuariosActivosCollection, where('fechaLogin', '==', formattedDate), where('estado', '==', true));

    return collectionData(q).pipe(
      map((usuarios: any[]) => {
        console.log("Datos obtenidos para Usuarios Activos Hoy:", usuarios);
        return usuarios.length;
      }),
      catchError(error => {
        console.error("Error al obtener usuarios activos de hoy:", error);
        return [0];
      })
    );
  }

  obtenerNuevosUsuariosHoy(): Observable<number> {
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

    const usuariosCollection = collection(this.firestore, 'Contador_nuevos_usuarios');
    const q = query(usuariosCollection, where('fecha', '==', formattedDate));

    return collectionData(q).pipe(
      map((contadores: any[]) => {
        console.log("Datos obtenidos para Nuevos Usuarios Hoy:", contadores);
        return contadores.length > 0 ? contadores[0].contador : 0;
      }),
      catchError(error => {
        console.error("Error al obtener nuevos usuarios de hoy:", error);
        return [0];
      })
    );
  }
}
