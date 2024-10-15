import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, query, where } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { Usuario } from '/home/jona/admin-dashboard/src/app/models/usuario.model';
import { Ayudantia } from '/home/jona/admin-dashboard/src/app/models/ayudantia.model'; 
import { Pregunta_ayudantia } from '/home/jona/admin-dashboard/src/app/models/preguntas_ayudantia.model'; 

import { map, catchError, combineLatestWith } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor(private firestore: Firestore) {}

  // Método genérico para obtener cualquier colección de Firebase
  getCollection<T>(nombre_coleccion: string): Observable<T[]> {
    const ref = collection(this.firestore, nombre_coleccion);
    return collectionData(ref, { idField: 'id' }) as Observable<T[]>;
  }

  // Método para obtener los usuarios usando la función genérica
  getUsuarios(): Observable<Usuario[]> {
    return this.getCollection<Usuario>('Usuarios');
  }

  // Obtener usuarios por rol usando el método genérico
  getUsuariosPorTipo(rol: 'TUTOR' | 'ESTUDIANTE'): Observable<Usuario[]> {
    return new Observable((observer) => {
      this.getUsuarios().subscribe((usuarios) => {
        observer.next(usuarios.filter((usuario) => usuario.Rol === rol));
      });
    });
  }

  getUsuariosActivos(): Observable<number> {
    const usuariosCollection = collection(this.firestore, 'Usuarios');
    const activosQuery = query(usuariosCollection, where('Estado', '==', 'ACTIVO'));
    return collectionData(activosQuery).pipe(
      map((usuarios) => (usuarios as Usuario[]).length) // Casting explícito a Usuario[]
    );
  }

  getProblemasResueltos(): Observable<number> {
    const usuariosCollection = collection(this.firestore, 'Preguntas_ayudantia');
    const activosQuery = query(usuariosCollection, where('estado', '==', 'RESUELTO'));
    return collectionData(activosQuery).pipe(
      map((pregunta_ayudantia) => (pregunta_ayudantia as Pregunta_ayudantia[]).length) // Casting explícito a Usuario[]
    );
  }

  getAyudantiasEsteMes(): Observable<number> {
    const ayudantiasCollection = collection(this.firestore, 'Ayudantias');
    const mesActual = new Date().getMonth() + 1;
    return collectionData(ayudantiasCollection).pipe(
      map((ayudantias) =>
        (ayudantias as any[]).filter(
          (ayudantia) => new Date(ayudantia.fecha).getMonth() + 1 === mesActual
        ).length
      )
    );
  }

  getAyudantiasMensuales(): Observable<{ mes: string; cantidad: number }[]> {
    const ayudantiasCollection = collection(this.firestore, 'Ayudantias');
  
    return collectionData(ayudantiasCollection).pipe(
      map((ayudantias) => {
        const ayudantiasTyped = ayudantias as Ayudantia[];
  
        const conteoMensual: { [key: number]: number } = {};
  
        ayudantiasTyped.forEach((ayudantia) => {
          // Verificar si la fecha está definida y tiene un formato válido
          if (ayudantia.fecha) {
            const [day, month, year] = ayudantia.fecha.split('-').map(Number);
            const mes = month - 1; // Los meses en JavaScript son 0-indexados
  
            // Incrementar el conteo para el mes correspondiente
            conteoMensual[mes] = (conteoMensual[mes] || 0) + 1;
          }
        });
  
        // Transformar el conteo mensual en un array para el gráfico
        return Object.entries(conteoMensual).map(([mes, cantidad]) => ({
          mes: new Date(0, +mes).toLocaleString('es-ES', { month: 'long' }),
          cantidad,
        }));
      })
    );
  }

  //Calendario
  getAyudantias(): Observable<any[]> {
    const ayudantiasCollection = collection(this.firestore, 'Ayudantias');
    return collectionData(ayudantiasCollection);
  }
  
  // Método específico para buscar usuarios por nombre, apellido o carrera

  buscarUsuarios(termino: string): Observable<Usuario[]> {
    const usuariosCollection = collection(this.firestore, 'Usuarios');

    const nombreQuery = query(
      usuariosCollection,
      where('Nombre', '>=', termino),
      where('Nombre', '<=', termino + '\uf8ff')
    );

    const apellidoQuery = query(
      usuariosCollection,
      where('Apellido', '>=', termino),
      where('Apellido', '<=', termino + '\uf8ff')
    );

    const carreraQuery = query(
      usuariosCollection,
      where('Carrera', '>=', termino),
      where('Carrera', '<=', termino + '\uf8ff')
    );

    const nombre$ = collectionData(nombreQuery, { idField: 'id' }) as Observable<Usuario[]>;
    const apellido$ = collectionData(apellidoQuery, { idField: 'id' }) as Observable<Usuario[]>;
    const carrera$ = collectionData(carreraQuery, { idField: 'id' }) as Observable<Usuario[]>;

    return nombre$.pipe(
      combineLatestWith(apellido$, carrera$),
      map(([porNombre, porApellido, porCarrera]) => {
        const usuarios = [...porNombre, ...porApellido, ...porCarrera];

        // Elimina duplicados basados en el 'id'
        return Array.from(new Set(usuarios.map((u) => u.ID))).map(
          (id) => usuarios.find((u) => u.ID === id)!
        );
      })
    );
  }

  // Método para guardar eventos en la colección 'Eventos'
  guardarEvento(evento: any): Promise<void> {
    const eventosCollection = collection(this.firestore, 'Eventos');
    return  addDoc(eventosCollection, evento).then(() => {
      console.log('Evento guardado correctamente');
    });
  }
}

