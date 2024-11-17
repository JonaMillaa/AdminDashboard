import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Publicacion } from '../models/publicacion.interface';

@Injectable({
  providedIn: 'root'
})
export class PagosService {
  constructor(private firestore: Firestore) {}

  // Método para obtener las publicaciones en curso y finalizadas del día actual
  getPagosPendientesYFinalizados(): Observable<Publicacion[]> {
    const publicacionesCollection = collection(this.firestore, 'Publicaciones');

    // Generar la fecha de hoy en formato esperado
    const today = new Date();
    const todayString = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${today.getFullYear()}`;

    const q = query(
      publicacionesCollection,
      where('estado', 'in', ['EN_CURSO', 'FINALIZADA']),
      where('fecha_ayudantia', '==', todayString) // Filtrar solo las publicaciones del día de hoy
    );

    return collectionData(q, { idField: 'id_publicacion' }).pipe(
      map((publicaciones: any[]) =>
        publicaciones.map(pub => ({
          ...pub,
          nombreUsuario: pub.info_ayudantia?.info_usuario?.nombre || 'No disponible',
          apellidoUsuario: pub.info_ayudantia?.info_usuario?.apellido || 'No disponible',
        }))
      )
    );
  }
}
