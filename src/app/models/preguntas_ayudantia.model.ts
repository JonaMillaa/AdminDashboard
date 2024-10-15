export interface Pregunta_ayudantia {
    estado: string;  // Cadena con valor constante
    fecha_pregunta: string;  // Ejemplo: "20-10-2024"
    id: string;  // Cadena vacía o identificador
    id_emisor: string;  // ID del emisor (por ejemplo, tutor)
    id_publicacion: string;  // ID de la publicación relacionada
    id_receptor: string;  // ID del receptor (por ejemplo, estudiante)
    pregunta: string;  // Contenido de la pregunta
    respuesta: string;  // Contenido de la respuesta
  }
  