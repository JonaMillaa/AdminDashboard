// src/app/services/usuarios-activos.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface UsuarioActivo {
  usuarioId: string;
  nombre: string;
  activo: boolean;
  ultimoInicioSesion: string;
}

export interface ContadorInicioSesion {
  id: string;
  contador: number;
  fecha: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsuariosActivosService {
  constructor(private firestore: AngularFirestore) {}

  // Obtener usuarios activos en tiempo real
  obtenerUsuariosActivos(): Observable<UsuarioActivo[]> {
    return this.firestore
      .collection<UsuarioActivo>('UsuariosActivos', ref => ref.where('activo', '==', true))
      .valueChanges()
      .pipe(
        tap(usuarios => console.log('Usuarios activos recibidos:', usuarios))
      );
  }

  // Obtener el contador de inicios de sesión del día de hoy
  obtenerContadorHoy(): Observable<number> {
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
    console.log('Fecha para contador de hoy:', formattedDate);

    return this.firestore
      .collection<ContadorInicioSesion>('Contador_inicio_sesion', ref => ref.where('fecha', '==', formattedDate))
      .valueChanges()
      .pipe(
        tap(contadores => console.log('Contadores encontrados:', contadores)),
        map(contadores => (contadores.length > 0 ? contadores[0].contador : 0))
      );
  }
}
