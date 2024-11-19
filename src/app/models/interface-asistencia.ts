export interface InterfaceAsistencia {
    id: string;
    id_publicacion: string;
    asistencia: Array<{
      id_usuario: string;
    }>;
  }
  