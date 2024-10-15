export interface InfoUsuario {
    apellido: string;
    id_usuario: string;
    nombre: string;
  }
  
  export interface Ayudantia {
    categoria: string;
    descripcion_ayudantia: string;
    estado_ayudantia: string;
    id_ayudantia: string;
    info_usuario: InfoUsuario;
    subcategoria: string;
    titulo_ayudantia: string;
    fecha: string;
  }
  