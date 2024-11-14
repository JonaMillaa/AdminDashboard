import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ContadorSesionService {
  constructor(private firestore: Firestore) {}

  // Obtener el contador de inicios de sesión del día de hoy
  obtenerContadorHoy(): Observable<number> {
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
    console.log('Fecha para contador de hoy:', formattedDate); // Para verificar la fecha

    const contadorCollection = collection(this.firestore, 'Contador_inicio_sesion');
    const q = query(contadorCollection, where('fecha', '==', formattedDate));

    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (snapshot.empty) return 0;
        const doc = snapshot.docs[0];
        console.log('Datos del contador encontrados:', doc.data());
        return doc.data()['contador'] as number;
      }),
      catchError(error => {
        console.error("Error al obtener el contador de hoy:", error);
        return [0];  // Retorna 0 en caso de error
      })
    );
  }
}
