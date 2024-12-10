import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, query, updateDoc, where } from '@angular/fire/firestore';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
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

getEstudiantesPorPublicacion(idPublicacion: string): Observable<Usuario | null> {
  const ref = collection(this.firestore, 'Postulacion_estudiante');
  const q = query(ref, where('id_publicacion', '==', idPublicacion));
  return collectionData(q, { idField: 'id' }).pipe(
    map((postulaciones: PostulacionEstudiante[]) => {
      if (postulaciones.length > 0) {
        const idTutor = postulaciones[0]. id_usuario; // solo hay un tutor aceptado o realizado por publicación
        return this.getUsuarioById(idTutor); // Obtenemos los detalles del tutor
      }
      return null; // Si no hay tutor aceptado o realizado
    }),
    switchMap((tutorObservable: any) => tutorObservable ? tutorObservable : of(null)) // Asegurar que se maneje el caso cuando no hay tutor
  );
}  
getEstudiantesDuenioPublicacion(idPublicacion: string): Observable<Usuario | null> {
  const ref = collection(this.firestore, 'Publicaciones');
  const q = query(ref, where('id_publicacion', '==', idPublicacion));

  return collectionData(q, { idField: 'id' }).pipe(
    map((publicaciones: Publicacion[]) => {
      if (publicaciones.length > 0) {
        const infoAyudantia = publicaciones[0]?.info_ayudantia;

        // Verificamos si info_ayudantia y info_usuario existen
        if (infoAyudantia && infoAyudantia.info_usuario && typeof infoAyudantia.info_usuario.id_usuario === 'string') {
          const idUsuarioDuenio = infoAyudantia.info_usuario.id_usuario; // Obtenemos el ID del usuario dueño de la publicación
          return this.getUsuarioById(idUsuarioDuenio);  // Usamos el ID para obtener los detalles del usuario
        } else {
          console.error('No se pudo encontrar id_usuario válido en la publicación');
          return of(null);  // Si no hay id_usuario válido, devolvemos null
        }
      }
      console.error('No se encontró la publicación con el id proporcionado');
      return of(null);  // Si no hay publicaciones, devolvemos null
    }),
    switchMap((usuarioObservable: Observable<Usuario>) => usuarioObservable)  // Aseguramos que devolvamos el observable correcto
  );
}


  // Obtener detalles del usuario (tutor) por su ID
  private getUsuarioById(idUsuario: string): Observable<Usuario> {
    const usuarioDoc = doc(this.firestore, `Usuarios/${idUsuario}`);
    return docData(usuarioDoc) as Observable<Usuario>;
  }

} 

  

