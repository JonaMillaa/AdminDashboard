import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, query, updateDoc, where } from '@angular/fire/firestore';
import { forkJoin, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Publicacion } from '../models/publicacion.interface';
import { InterfacePostulacion } from '../models/interface-postulacion';
import { InterfaceAsistencia } from '../models/interface-asistencia';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root',
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

  // Obtener detalles de una publicación por ID
  getPublicacionById(id: string): Observable<Publicacion> {
    const publicacionDoc = doc(this.firestore, `Publicaciones/${id}`);
    return docData(publicacionDoc, { idField: 'id_publicacion' }) as Observable<Publicacion>;
  } getParticipantesPorPublicacion(idPublicacion: string): Observable<InterfaceAsistencia[]> {
    const ref = collection(this.firestore, 'asistencia_publicacion');
    const q = query(ref, where('id_publicacion', '==', idPublicacion));
    return collectionData(q, { idField: 'id' }) as Observable<InterfaceAsistencia[]>;
  }
  
  // Obtener asistencia por ID de publicación
  getAsistenciaPorPublicacion(idPublicacion: string): Observable<InterfaceAsistencia> {
    const ref = collection(this.firestore, 'Asistencia_publicacion');
    const q = query(ref, where('id_publicacion', '==', idPublicacion));
    return collectionData(q, { idField: 'id' }).pipe(
      map((asistencias: InterfaceAsistencia[]) => asistencias[0]) // Devuelve el primer resultado
    );
  }
  
  // Obtener detalles de los participantes desde la colección Usuarios
  getDetallesParticipantes(asistencia: Array<{ id_usuario: string }>): Observable<Usuario[]> {
    const usuariosObservables = asistencia.map(a =>
      docData(doc(this.firestore, `Usuarios/${a.id_usuario}`)).pipe(take(1)) as Observable<Usuario>
    );
    return forkJoin(usuariosObservables);
  } 

  actualizarPublicacion(id: string, data: Partial<Publicacion>): Promise<void> {
    const docRef = doc(this.firestore, `Publicaciones/${id}`);
    return updateDoc(docRef, data);
  }
  
}
  

