import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, query, where, orderBy, getDoc, doc} from '@angular/fire/firestore';
import { Observable, forkJoin, from} from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { Ayudantia } from '../models/ayudantia.model';
import { Pregunta_ayudantia } from '../models/preguntas_ayudantia.model';
import { Publicacion } from '../models/publicacion.interface';
import { Calificacion } from '../models/calificacion.interface';
import { TutorRanking } from '../models/tutor-ranking.interface';
import { map, combineLatestWith, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoginData } from '../models/LoginData';
import { CrecimientoUsuario } from '../models/CrecimientoUsuario';
import { Reportes } from '../models/reportes';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {

  getDoc<T>(arg0: string, idPublicacion: string) {
    throw new Error('Method not implemented.');
  }



  constructor(private firestore: Firestore,
    private router: Router,
    ) {}
  private isLoggedIn: boolean = false;
    // Método para registrar un nuevo usuario y guardar el evento de registro



  login(user: string): void {
    if (user === 'admin' || user === 'manager') {
      this.isLoggedIn = true;
      localStorage.setItem('user', user); // Guardamos el "usuario" en localStorage
    } else {
      this.isLoggedIn = false;
    }
  }

  logout(): void {
    localStorage.removeItem('user');
    this.router.navigate(['/login']); // Redirige al login al cerrar sesión
  }

  isAuthenticated(): boolean {
    if (typeof window !== 'undefined' && localStorage) {

      return localStorage.getItem('user') !== null;

    }
    return false; // O un valor por defecto
  }

  // Método genérico para obtener cualquier colección de Firebase
  getCollection<T>(nombre_coleccion: string): Observable<T[]> {
    const ref = collection(this.firestore, nombre_coleccion);
    return collectionData(ref, { idField: 'id' }) as Observable<T[]>;
  } 
  
  
  getCollectionQuery<T>(path: string, parametro: string, condicion: any, busqueda: string): Observable<T[]> {
    const ref = collection(this.firestore, path);
    const queryRef = query(ref, where(parametro, condicion, busqueda));  // Usar 'query' para añadir condiciones
    return collectionData(queryRef, { idField: 'id' }) as Observable<T[]>;
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
      map((usuarios) => (usuarios as Usuario[]).length)
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

  // Método para obtener publicaciones filtradas por categoría y estado
  getFilteredPublications(category: string, status: string): Observable<any[]> {
    const ref = collection(this.firestore, 'Publicaciones');
    const q = query(ref, where('info_ayudantia.categoria', '==', category), where('estado', '==', status));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  // Método para obtener publicaciones filtradas por categoría y subcategoría
  getPublicationsByCategoryAndSubcategory(category: string, subcategory: string): Observable<any[]> {
    const ref = collection(this.firestore, 'Publicaciones');
    const q = query(
      ref,
      where('info_ayudantia.categoria', '==', category),
      where('info_ayudantia.subcategoria', '==', subcategory)
    );
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  // Nuevo método para obtener todas las publicaciones por categoría
  getPublicationsByCategory(category: string): Observable<any[]> {
    const ref = collection(this.firestore, 'Publicaciones');
    const q = query(ref, where('info_ayudantia.categoria', '==', category));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  // Método para obtener publicaciones filtradas por estado
  getPublicationsByState(state: string): Observable<any[]> {
    const ref = collection(this.firestore, 'Publicaciones');
    const q = query(ref, where('estado', '==', state));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  // Nuevo método para obtener todas las publicaciones
  getAllPublications(): Observable<any[]> {
    return this.getCollection<any>('Publicaciones');
  }

  // Método para obtener publicaciones por formato
  getPublicationsByFormat(format: string): Observable<any[]> {
    const publicationsRef = collection(this.firestore, 'Publicaciones');
    const q = query(publicationsRef, where('formato', '==', format));
    return collectionData(q, { idField: 'id' });
  }

  getPublicationsByDateRange(startDate: Date, endDate: Date): Observable<any[]> {
    const publicationsCollection = collection(this.firestore, 'Publicaciones');
    const rangeQuery = query(
        publicationsCollection,
        where('fecha_ayudantia', '>=', startDate.toISOString().split('T')[0]),
        where('fecha_ayudantia', '<=', endDate.toISOString().split('T')[0])
    );

    return collectionData(rangeQuery).pipe(
        map((publications) => publications)
    );
  }

  // Obtener postulaciones aceptadas
  getAcceptedPostulaciones(): Observable<any[]> {
    const postulacionesRef = collection(this.firestore, 'Postulaciones');
    const q = query(postulacionesRef, where('estado_postulacion', '==', 'ACEPTADO'));
    return collectionData(q, { idField: 'id' });
  }

   // Obtener publicaciones finalizadas
   getFinalizedPublicaciones(): Observable<any[]> {
    const publicacionesRef = collection(this.firestore, 'Publicaciones');
    const q = query(publicacionesRef, where('estado', '==', 'FINALIZADA'));
    return collectionData(q, { idField: 'ID' });
  }

  // Obtener postulaciones realizadas
  getPostulacionesRealizadas(): Observable<any[]> {
    const postulacionesRef = collection(this.firestore, 'Postulaciones');
    const q = query(postulacionesRef, where('estado_postulacion', '==', 'REALIZADA'));
    return collectionData(q, { idField: 'ID' });
  }

  // Obtener información de usuario filtrando por RUT
  getUserByRUT(rut: string): Observable<any[]> {
    const usersRef = collection(this.firestore, 'Usuarios');
    const q = query(usersRef, where('Rut', '==', rut));
    return collectionData(q, { idField: 'ID' });
  }
  
  getPublicationsByMonthAndYear(month: string, year: number): Observable<any[]> {
    const publicationsCollection = collection(this.firestore, 'Publicaciones');
    const startDate = `${year}-${month}-01`;
    const endDate = `${year}-${month}-31`;
    const monthQuery = query(
      publicationsCollection,
      where('fecha_ayudantia', '>=', startDate),
      where('fecha_ayudantia', '<=', endDate)
    );
    return collectionData(monthQuery) as Observable<any[]>;
  }

  getPublications(): Observable<any[]> {
    const publicationsCollection = collection(this.firestore, 'Publicaciones');
    return collectionData(publicationsCollection) as Observable<any[]>;
  }

  // Obtener publicaciones más demandadas
  getPublicacionesMasDemandadas(): Observable<Publicacion[]> {
    const publicacionesRef = collection(this.firestore, 'Publicaciones');
    const publicacionesQuery = query(publicacionesRef,
      where('estado', '==', 'PUBLICADO'), // Filtrar publicaciones activas
      orderBy('participantes', 'desc')
    );
    return collectionData(publicacionesQuery) as Observable<Publicacion[]>;
  }

  // Obtener ranking de tutores
  getRankingTutores(): Observable<TutorRanking[]> {
    const usuariosRef = collection(this.firestore, 'Usuarios');
    const usuariosQuery = query(usuariosRef, where('Rol', '==', 'TUTOR'));

    return collectionData(usuariosQuery).pipe(
      map((usuarios: Usuario[]) => usuarios.map((usuario) => ({
        usuario,
        publicaciones: collectionData(
          query(
            collection(this.firestore, 'Publicaciones'),
            where('info_ayudantia.info_usuario.id_usuario', '==', usuario.ID),
            where('info_ayudantia.estado_ayudantia', '==', 'PUBLICADO')
          )
        ) as Observable<Publicacion[]>,
        calificaciones: collectionData(
          query(
            collection(this.firestore, 'Calificacion'),
            where('id_receptor', '==', usuario.ID)
          )
        ) as Observable<Calificacion[]>
      })))
    );
  }

  getCrecimientoUsuarios(): Observable<CrecimientoUsuario[]> {
    const coleccion = collection(this.firestore, 'Contador_nuevos_usuarios');
    return collectionData(coleccion, { idField: 'id' }).pipe(
      map((data: any[]) => data.map(item => ({
        fecha: item.fecha,
        contador: item.contador
      })))
    );
  }

  getLoginsUsuarios(): Observable<LoginData[]> {
    const coleccion = collection(this.firestore, 'Contador_inicio_sesion');
    return collectionData(coleccion, { idField: 'id' }).pipe(
      map((data: any[]) => data.map(item => ({
        fecha: item.fecha,
        contador: item.contador
      })))
    );
  }


  // Obtener todas las publicaciones con ayudantías finalizadas y los datos de los participantes
  // Obtener ayudantías con estado FINALIZADA y extraer campos requeridos
  getAyudantiasFinalizadas(): Observable<any[]> {
    const coleccion = collection(this.firestore, 'Publicaciones');
    return collectionData(coleccion, { idField: 'id' }).pipe(
      map((publicaciones: any[]) =>
        publicaciones
          .filter(publicacion => publicacion.estado === 'FINALIZADA')
          .map(publicacion => ({
            titulo_ayudantia: publicacion.info_ayudantia?.titulo_ayudantia || 'Sin título',
            descripcion_ayudantia: publicacion.info_ayudantia?.descripcion_ayudantia || 'Sin descripción',
            categoria: publicacion.info_ayudantia?.categoria || 'Sin categoría',
            subcategoria: publicacion.info_ayudantia?.subcategoria || 'Sin subcategoría',
            participantes: publicacion.info_ayudantia?.participantes || '0',
            fecha_ayudantia: this.formatFecha(publicacion.fecha_ayudantia || ''),
            nombre_estudiante: publicacion.info_ayudantia?.info_usuario?.nombre || 'Desconocido',
            apellido_estudiante: publicacion.info_ayudantia?.info_usuario?.apellido || 'Desconocido',
            detalle_ubicacion: publicacion.detalle_ubicacion || 'Ubicación no especificada',
            duracion: publicacion.duracion || 'Duración no especificada',
            formato: publicacion.formato || 'Formato no especificado'
          }))
      )
    );
  }

  // Método para formatear la fecha en formato dd-mm-yyyy
  private formatFecha(fecha: string): string {
    if (!fecha) return 'Fecha no disponible';
    const [year, month, day] = fecha.split('-'); // Suponemos que la fecha está en formato yyyy-mm-dd
    return `${day}-${month}-${year}`;
  }

      // Obtener todas las postulaciones
  getPostulacionesPorEstado(estado: string): Observable<any[]> {
    const coleccion = collection(this.firestore, 'Postulaciones');
    const consulta = query(coleccion, where('estado_postulacion', '==', estado));
    return collectionData(consulta, { idField: 'id' });
  }

  // Obtener una publicación por ID
  getPublicacionById(id: string): Observable<any> {
    const publicacionRef = doc(this.firestore, `Publicaciones/${id}`);
    return from(getDoc(publicacionRef)).pipe(
      map((snapshot) => (snapshot.exists() ? snapshot.data() : null))
    );
  }

  // Combinar Postulaciones y Publicaciones
  getPostulacionesConPublicaciones(estado: string): Observable<any[]> {
    return this.getPostulacionesPorEstado(estado).pipe(
      switchMap((postulaciones: any[]) => {
        // Mapear cada postulación con la publicación relacionada
        const detallePostulaciones$ = postulaciones.map((postulacion) =>
          this.getPublicacionById(postulacion.id_publicacion).pipe(
            map((publicacion) => ({
              ...postulacion,
              fecha_ayudantia: publicacion?.fecha_ayudantia || null,
              titulo: publicacion?.titulo || null,
            }))
          )
        );

        // Combinar todas las solicitudes en un único observable
        return forkJoin(detallePostulaciones$);
      })
    );
  }


  // Obtener todos los reportes
  getReportes(): Observable<Reportes[]> {
    const ref = collection(this.firestore, 'Reportes');
    return collectionData(ref, { idField: 'id' }) as Observable<Reportes[]>;
  }
}

