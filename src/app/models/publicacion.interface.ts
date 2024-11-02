export interface InfoUsuario {
    apellido: string;
    id_usuario: string;
    nombre: string;
}

export interface InfoAyudantia {
    categoria: string;
    descripcion_ayudantia: string;
    estado_ayudantia: string;
    id_ayudantia: string;
    titulo_ayudantia: string;
    subcategoria: string;
    info_usuario: InfoUsuario; // Campo anidado dentro de info_ayudantia
}

export interface Publicacion {
    id_publicacion: string;
    detalle_ubicacion: string;
    duracion: string;
    estado: string;
    fecha_ayudantia: string;
    formato: string;
    hora: string;
    participantes: string;
    info_ayudantia: InfoAyudantia; // Campo anidado dentro de Publicacion
}
