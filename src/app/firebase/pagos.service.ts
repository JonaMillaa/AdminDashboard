import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, query, updateDoc, where } from '@angular/fire/firestore';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { Publicacion } from '../models/publicacion.interface';
import { InterfacePostulacion } from '../models/interface-postulacion';
import { InterfaceAsistencia } from '../models/interface-asistencia';
import { Usuario } from '../models/usuario.model';
import { PostulacionEstudiante } from '../models/postulacion-estudiante';

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
  // Obtener postulaciones por ID de publicación
getPostulacionesPorPublicacion(idPublicacion: string): Observable<InterfacePostulacion[]> {
  const ref = collection(this.firestore, 'Postulaciones');
  const q = query(ref, where('id_publicacion', '==', idPublicacion));
  return collectionData(q) as Observable<InterfacePostulacion[]>;
}

// Obtener estudiantes añadidos
getEstudiantesAñadidos(idPublicacion: string): Observable<PostulacionEstudiante[]> {
  const ref = collection(this.firestore, 'Postulacion_estudiante');
  const q = query(ref, where('id_publicacion', '==', idPublicacion));
  return collectionData(q) as Observable<PostulacionEstudiante[]>;
} 

// Modificado para obtener la información completa del tutor
getTutorPorPublicacion(idPublicacion: string): Observable<Usuario | null> {
  const ref = collection(this.firestore, 'Postulaciones');
  // Consultamos por los estados 'ACEPTADO' y 'REALIZADA'
  const q = query(ref, 
    where('id_publicacion', '==', idPublicacion), 
    where('estado_postulacion', 'in', ['ACEPTADO', 'REALIZADA']) // Usamos 'in' para obtener ambos estados
  );

  return collectionData(q, { idField: 'id' }).pipe(
    map((postulaciones: InterfacePostulacion[]) => {
      if (postulaciones.length > 0) {
        const idTutor = postulaciones[0].id_tutor; // solo hay un tutor aceptado o realizado por publicación
        return this.getUsuarioById(idTutor); // Obtenemos los detalles del tutor
      }
      return null; // Si no hay tutor aceptado o realizado
    }),
    switchMap((tutorObservable: any) => tutorObservable ? tutorObservable : of(null)) // Asegurar que se maneje el caso cuando no hay tutor
  );
}
 // Método para obtener estudiantes añadidos a la publicación
 getEstudiantesPorPublicacion(idPublicacion: string): Observable<Usuario[]> {
  const ref = collection(this.firestore, 'Postulacion_estudiante');
  const q = query(ref, where('id_publicacion', '==', idPublicacion));

  return collectionData(q, { idField: 'id' }).pipe(
    switchMap((postulacionesEstudi: PostulacionEstudiante[]) => {
      if (postulacionesEstudi.length > 0) {
        // Obtenemos todos los id_usuario de los estudiantes
        const estudiantesIds = postulacionesEstudi.map(est => est.id_usuario);

        // Usamos forkJoin para hacer peticiones paralelas y obtener todos los detalles de los estudiantes
        const detallesEstudiantes$ = estudiantesIds.map(idUsuario =>
          this.getUsuarioById(idUsuario) // Método que obtiene los detalles del usuario por id
        );

        // Devolver un Observable con los detalles de todos los estudiantes
        return forkJoin(detallesEstudiantes$); // Esperamos que todos los detalles estén listos
      }
      return of([]); // Si no hay estudiantes, devolvemos un array vacío
    })
  );
}

  // Obtener detalles del usuario (tutor) por su ID
  private getUsuarioById(idUsuario: string): Observable<Usuario> {
    const usuarioDoc = doc(this.firestore, `Usuarios/${idUsuario}`);
    return docData(usuarioDoc) as Observable<Usuario>;
  }

} 

  

