// src/app/interfaces/tutor-ranking.interface.ts
import { Usuario } from './usuario.model';
import { Publicacion } from './publicacion.interface';
import { Calificacion } from './calificacion.interface';
import { Observable } from 'rxjs';

export interface TutorRanking {
    usuario: Usuario;
    publicaciones: Observable<Publicacion[]>;
    calificaciones: Observable<Calificacion[]>;
}
