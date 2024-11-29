import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, doc, docData, Firestore, query, updateDoc, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Reportes } from '../models/reportes';
import { RespuestaReporte } from '../models/respuesta-reporte';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class SoporteService {

  constructor( private firestore: Firestore) { }
  // Obtener todos los reportes
  getReportes(): Observable<Reportes[]> {
    const ref = collection(this.firestore, 'Reportes');
    return collectionData(ref, { idField: 'id' }) as Observable<Reportes[]>;
  }


  // Actualizar el estado de un reporte
  actualizarEstadoReporte(reporteId: string, nuevoEstado: string): Promise<void> {
    const reporteDoc = doc(this.firestore, `Reportes/${reporteId}`);
    return updateDoc(reporteDoc, { estado: nuevoEstado });
  }


  // Guardar la respuesta en la colección Respuesta_reporte
  guardarRespuesta(respuesta:RespuestaReporte): Promise<void> {
    const respuestasCollection = collection(this.firestore, 'Respuesta_reporte');
    return addDoc(respuestasCollection, respuesta).then(() => {
      console.log('Respuesta guardada correctamente');
    });
  }


getCollectionQuery<tipo>(path: string, parametro: string, busqueda: any) {
  const collectionRef = collection(this.firestore, path);

  // Crear la consulta con where
  const q = query(collectionRef, where(parametro, '==', busqueda));

  // Usar collectionData para obtener datos en tiempo real
  return collectionData(q, { idField: 'id' });  // 'idField' es opcional, pero útil para obtener el ID de cada documento
}





  // Obtener respuestas de un reporte específico
  getRespuestasPorReporte(reporteId: string): Observable<RespuestaReporte []> {
    const ref = collection(this.firestore, 'Respuesta_reporte');
    const q = query(ref, where('reporte_id', '==', reporteId));
    return collectionData(q, { idField: 'id' }) as Observable<RespuestaReporte []>;
  }


  // Método en FirebaseService para obtener un usuario por su ID
getUsuarioPorID(usuarioID: string): Observable<Usuario | null> {
  const ref = doc(this.firestore, `Usuarios/${usuarioID}`);
  return docData(ref, { idField: 'ID' }) as Observable<Usuario | null>;
}

}
