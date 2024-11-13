export interface Usuario {
    ID: string;
    Anio_carrera: string;
    Apellido: string;
    Calificacion: string;
    Cantidad_ayudantia: string;
    Carrera: string;
    Direccion: Direccion;
    Email: string;
    Estado: string;
    Fecha_ingreso: string;
    Foto: string;
    Nombre: string;
    Password: string;
    Rol: 'TUTOR' | 'ESTUDIANTE';
    Rut: string;
    Telefono: string;
  }

  export interface Direccion {
    Comuna: string;
    Region: string;
  }