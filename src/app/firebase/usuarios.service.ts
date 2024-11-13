// usuarios.service.ts
import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Usuario } from '../models/usuario.model';
import { Observable } from 'rxjs';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  constructor(private firebaseService: FirebaseService, private firestore: Firestore) {}

  // Método para obtener todos los usuarios
  getUsuarios(): Observable<Usuario[]> {
    return this.firebaseService.getUsuarios();
  }

  // Método para actualizar el estado de un usuario
  actualizarEstadoUsuario(userId: string, nuevoEstado: string): Promise<void> {
    const usuarioDocRef = doc(this.firestore, `Usuarios/${userId}`);
    return updateDoc(usuarioDocRef, { Estado: nuevoEstado });
  }

  // Método para actualizar los detalles de un usuario
  actualizarUsuario(usuario: Usuario): Promise<void> {
    const usuarioDocRef = doc(this.firestore, `Usuarios/${usuario.ID}`);
    return updateDoc(usuarioDocRef, {
      Nombre: usuario.Nombre,
      Apellido: usuario.Apellido,
      Email: usuario.Email,
      Telefono: usuario.Telefono,
      Rol: usuario.Rol,
      Estado: usuario.Estado,
      // Puedes incluir más campos si tu modelo de usuario tiene otros
    });
  }
}
