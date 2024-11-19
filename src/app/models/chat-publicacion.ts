export interface InfoUsuario {
    id_usuario: string;
    nombre: string;
    apellido: string;
    foto : string;
  }
  
  export interface Mensaje {
    contenido: string;
    fecha_envio: string; // ISO 8601 string
    info_usuario: InfoUsuario;
  }
  
  export interface Interface_chat {
    id_chat: string;
    id_publicacion: string;
    mensajes: Mensaje[]; // Array de mensajes
  }