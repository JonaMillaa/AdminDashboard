

export interface InfoAyudantia {
    precio: InfoAyudantia;
    categoria: string;
    descripcion_ayudantia: string;
    estado_ayudantia: string;
    id_ayudantia: string;
    titulo_ayudantia: string;
    subcategoria: string;
    info_usuario: {
        id_usuario: string;
        nombre: string;
        apellido: string;
    };
}

export interface Publicacion {
    info_usuario: any;
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
