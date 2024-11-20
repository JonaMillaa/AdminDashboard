export interface InterfacePostulacion {
    ID: string;
    descripcion: string;
    estado_postulacion: string;
    id_publicacion: string;
    id_tutor: string;
    infoUsuario: {
        ID: string;
        Nombre: string;
        Apellido: string;
        Calificacion: string;
  
    }
    precio: string;
  }