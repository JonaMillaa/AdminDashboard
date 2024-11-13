import { Injectable } from '@angular/core';
import { Firestore, collection, query, where } from '@angular/fire/firestore';
import { collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PublicacionesDiaService {
  constructor(private firestore: Firestore) {}

  obtenerPublicacionesHoy(): Observable<any[]> {
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

    const publicacionesCollection = collection(this.firestore, 'Publicaciones');
    const estadosValidos = ['PUBLICADO', 'ADJUDICACION', 'ADJUDICADO', 'AGENDADA', 'EN_CURSO'];
    
    const q = query(
      publicacionesCollection,
      where('fecha_ayudantia', '==', formattedDate),
      where('estado', 'in', estadosValidos)
    );

    return collectionData(q).pipe(
      map((publicaciones: any[]) => publicaciones)
    );
  }
}