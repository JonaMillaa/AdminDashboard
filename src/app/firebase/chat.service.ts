import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, query, where, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Interface_chat, Mensaje } from '../models/chat-publicacion';
import { arrayUnion } from 'firebase/firestore'; // Importa arrayUnion directamente

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private firestore: Firestore) {}

  // Obtener chats asociados a una publicación
  getChatByPublicacionId(publicacionId: string): Observable<Interface_chat[]> {
    const ref = collection(this.firestore, 'Chat_publicacion');
    const q = query(ref, where('id_publicacion', '==', publicacionId));
    return collectionData(q, { idField: 'id_chat' }) as Observable<Interface_chat[]>;
  }

  // Agregar un mensaje al chat
  enviarMensaje(chatId: string, nuevoMensaje: Mensaje): Promise<void> {
    const chatRef = doc(this.firestore, `Chat_publicacion/${chatId}`);
    return updateDoc(chatRef, {
      mensajes: arrayUnion(nuevoMensaje), // Usa arrayUnion correctamente
    });
  } 
  
}
