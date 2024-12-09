export interface Usuario {
  ID: string;
    Apellido: string;
    Nombre: string;
    Carrera: string;
    Calificacion: string;
    Password: string;
    Email: string;
    Estado: string;
    Foto: string;
    Rol: string;
    Telefono: string;
    Cantidad_ayudantia: number;
    token: string; 
    Rut: string;

  }

  export interface Direccion {
    Comuna: string;
    Region: string;
  }