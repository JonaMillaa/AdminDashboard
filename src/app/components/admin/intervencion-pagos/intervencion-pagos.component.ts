import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { MatToolbarModule } from '@angular/material/toolbar'; 
import { MatIconModule } from '@angular/material/icon'; 
import { MatButtonModule } from '@angular/material/button'; 
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatInputModule } from '@angular/material/input'; 
import { FormsModule } from '@angular/forms'; 
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from '../../../firebase/chat.service';
import { PagosService } from '../../../firebase/pagos.service';
import { Interface_chat, Mensaje } from '../../../models/chat-publicacion';
import { Publicacion } from '../../../models/publicacion.interface';
import { Usuario } from '../../../models/usuario.model';
import { PostulacionEstudiante } from '../../../models/postulacion-estudiante';

@Component({
  selector: 'app-intervencion-pagos',
  standalone: true,
  templateUrl: './intervencion-pagos.component.html',
  styleUrls: ['./intervencion-pagos.component.css'],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
})
export class IntervencionPagosComponent implements OnInit {
  idPublicacion!: string;
  infoPublicacion!: Publicacion;
  infoChat!: Interface_chat;
  nuevoMensaje = ''; 
  participantes: Usuario[] = [];
  estudiantes:  Usuario[] = []; // Arreglo para estudiantes
  tutor: Usuario | null = null; // Tutor con toda la información
  arrayAsistencia: Array<{ id_usuario: string }> = []; 
  cargando = true;  
  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private pagosService: PagosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.idPublicacion = this.route.snapshot.paramMap.get('id')!;
    
    this.pagosService.getPublicacionById(this.idPublicacion).subscribe((data) => {
      this.infoPublicacion = data;
    });
  
    this.chatService.getChatByPublicacionId(this.idPublicacion).subscribe((chats) => {
      this.infoChat = chats[0];
    });

    // Llama al método para obtener el tutor dependiendo del estado de la postulación
    this.obtenerTutorPorEstado();

    this.obtenerParticipantes(); 
    this.obtenerEstudiantes(); // Nuevo método para obtener los estudiantes añadidos
  }

  obtenerParticipantes(): void {
    this.pagosService.getAsistenciaPorPublicacion(this.idPublicacion).subscribe(asistencia => {
      if (asistencia && asistencia.asistencia.length > 0) {
        this.arrayAsistencia = asistencia.asistencia;
  
        this.pagosService.getDetallesParticipantes(this.arrayAsistencia).subscribe(usuarios => {
          this.participantes = usuarios.map(usuario => ({
            ...usuario,
            Foto: usuario.Foto ? usuario.Foto : '/assets/images/avatar_default.png', 
          }));
  
          console.log('Participantes con foto predeterminada:', this.participantes);
        });
      }
    });
  }

  // Método para obtener el tutor aceptado para la publicación
  obtenerTutorPorEstado(): void {
    this.pagosService.getTutorPorPublicacion(this.idPublicacion).subscribe(tutor => {
      if (tutor) {
        this.tutor = tutor; // Asignamos el tutor completo
        console.log('Tutor encontrado:', this.tutor); // Verifica si tiene los campos esperados
      } else {
        console.log('No hay tutor aceptado o la postulación no está en estado ACEPTADO');
      }
    });
  }

  // Método para obtener los estudiantes añadidos a la publicación
obtenerEstudiantes(): void {
  this.pagosService.getEstudiantesPorPublicacion(this.idPublicacion).subscribe({
    next: (estudiantes) => {
      this.estudiantes = estudiantes;
      console.log('Estudiantes encontrados:', this.estudiantes);  // Verifica la respuesta
    },
    error: (err) => {
      console.error('Error al obtener los estudiantes', err);
    },
  });
}


  enviarMensaje(): void {
    if (!this.nuevoMensaje.trim()) {
      return; 
    }
  
    const nuevoMensaje: Mensaje = {
      contenido: this.nuevoMensaje.trim(),
      fecha_envio: new Date().toISOString(),
      info_usuario: {
        id_usuario: 'admin', 
        nombre: 'Administrador',
        apellido: '',
        foto: '/assets/images/logo.png',
      },
    };
  
    this.chatService.enviarMensaje(this.infoChat.id_chat, nuevoMensaje).then(() => {
      this.nuevoMensaje = ''; 
    });
  } 
  
  modificarPublicacion(): void {
    this.router.navigate(['/admin/modificar-publicacion', this.idPublicacion]);
  }
}
