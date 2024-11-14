import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Publicacion } from '../models/publicacion.interface';

@Injectable({
  providedIn: 'root',
})
export class PublicacionesDiaService {
  constructor(private firestore: Firestore) {}

  // Método para obtener las publicaciones clasificadas por estado en el día de hoy
  getPublicacionesPorEstadoDelDia(): Observable<{ agendadas: Publicacion[], enCurso: Publicacion[], finalizadas: Publicacion[], noRealizadas: Publicacion[] }> {
    const publicacionesCollection = collection(this.firestore, 'Publicaciones');

    const today = new Date();
    const todayString = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${today.getFullYear()}`;

    const estadosQuery = query(publicacionesCollection, where('fecha_ayudantia', '==', todayString));

    return collectionData(estadosQuery, { idField: 'id_publicacion' }).pipe(
      map((publicaciones: any[]) => {
        const agendadas = publicaciones.filter(pub => pub.estado === 'AGENDADA');
        const enCurso = publicaciones.filter(pub => pub.estado === 'EN_CURSO');
        const finalizadas = publicaciones.filter(pub => pub.estado === 'FINALIZADA');
        const noRealizadas = publicaciones.filter(pub => pub.estado === 'NO REALIZADA');
        
        return { agendadas, enCurso, finalizadas, noRealizadas };
      })
    );
  }

  // Método para obtener todas las publicaciones del día sin clasificar por estado
  getTodasLasPublicacionesDelDia(): Observable<Publicacion[]> {
    const publicacionesCollection = collection(this.firestore, 'Publicaciones');

    const today = new Date();
    const todayString = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${today.getFullYear()}`;

    const publicacionesQuery = query(publicacionesCollection, where('fecha_ayudantia', '==', todayString));

    return collectionData(publicacionesQuery, { idField: 'id_publicacion' }).pipe(
      map((publicaciones: any[]) => publicaciones.map(pub => ({
        ...pub,
        nombreUsuario: pub.info_ayudantia?.info_usuario?.nombre || 'No disponible',
        apellidoUsuario: pub.info_ayudantia?.info_usuario?.apellido || 'No disponible',
      })))
    );
  }
}
