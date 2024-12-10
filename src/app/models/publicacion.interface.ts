// Interface para el usuario (info_usuario)
export interface UsuarioDuenio {
    id_usuario: string;
    nombre: string;
    apellido: string;
  }
  
  // Interface para la información de la ayudantía (info_ayudantia)
  export interface InfoAyudantia {
    categoria: string;
    descripcion_ayudantia: string;
    estado_ayudantia: string;
    id_ayudantia: string;
    titulo_ayudantia: string;
    subcategoria: string;
    info_usuario: UsuarioDuenio;  // Relación con la interface Usuario
  }
  
  // Interface para la publicación
  export interface Publicacion {
    id_publicacion: string;
    detalle_ubicacion: string;
    duracion: string;
    estado: string;
    fecha_ayudantia: string;
    formato: string;
    hora: string;
    participantes: number;  // Cambié esto a number para reflejar el valor numérico
    info_ayudantia: InfoAyudantia;  // Campo anidado dentro de Publicacion
  }
  