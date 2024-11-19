import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para directivas *ngIf, *ngFor
import { MatToolbarModule } from '@angular/material/toolbar'; // Para mat-toolbar
import { MatIconModule } from '@angular/material/icon'; // Para mat-icon
import { MatButtonModule } from '@angular/material/button'; // Para botones
import { MatFormFieldModule } from '@angular/material/form-field'; // Para mat-form-field
import { MatInputModule } from '@angular/material/input'; // Para matInput
import { FormsModule } from '@angular/forms'; // Para [(ngModel)]

import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from '../../../firebase/chat.service';
import { PagosService } from '../../../firebase/pagos.service';
import { Interface_chat, Mensaje } from '../../../models/chat-publicacion';
import { Publicacion } from '../../../models/publicacion.interface';
import { InterfacePostulacion } from '../../../models/interface-postulacion';
import { Usuario } from '../../../models/usuario.model';

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
    FormsModule, // Para usar [(ngModel)]
  ],
})
export class IntervencionPagosComponent implements OnInit {
  idPublicacion!: string;
  infoPublicacion!: Publicacion;
  infoChat!: Interface_chat;
  nuevoMensaje = ''; 
  participantes: Usuario[] = []; // Lista de participantes con información detallada
 arrayAsistencia: Array<{ id_usuario: string }> = []; // Lista temporal de IDs de participantes
 
  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private pagosService: PagosService,
    private router: Router // Asegúrate de inyectar el servicio de Router


  ) {}

  ngOnInit(): void {
    this.idPublicacion = this.route.snapshot.paramMap.get('id')!;
    
    this.pagosService.getPublicacionById(this.idPublicacion).subscribe((data) => {
      this.infoPublicacion = data;
    });
  
    this.chatService.getChatByPublicacionId(this.idPublicacion).subscribe((chats) => {
      this.infoChat = chats[0];
    });
  
    // Llama al método para obtener participantes
    this.obtenerParticipantes();
  }
  
  obtenerParticipantes(): void {
    this.pagosService.getAsistenciaPorPublicacion(this.idPublicacion).subscribe(asistencia => {
      if (asistencia && asistencia.asistencia.length > 0) {
        this.arrayAsistencia = asistencia.asistencia;
  
        this.pagosService.getDetallesParticipantes(this.arrayAsistencia).subscribe(usuarios => {
          this.participantes = usuarios.map(usuario => ({
            ...usuario,
            Foto: usuario.Foto ? usuario.Foto : '/assets/images/avatar_default.png', // Asignar imagen predeterminada si falta
          }));
  
          console.log('Participantes con foto predeterminada:', this.participantes);
        });
      }
    });
  }
  

  enviarMensaje(): void {
    if (!this.nuevoMensaje.trim()) {
      return; // Evita enviar mensajes vacíos
    }
  
    const nuevoMensaje: Mensaje = {
      contenido: this.nuevoMensaje.trim(),
      fecha_envio: new Date().toISOString(),
      info_usuario: {
        id_usuario: 'admin', // ID del administrador
        nombre: 'Administrador',
        apellido: '',
        foto: '/assets/images/logo.png', // Ruta correcta para la imagen
      },
    };
  
    this.chatService.enviarMensaje(this.infoChat.id_chat, nuevoMensaje).then(() => {
      this.nuevoMensaje = ''; // Limpia el campo de entrada
    });
  } 
  modificarPublicacion(): void {
    this.router.navigate(['/admin/modificar-publicacion', this.idPublicacion]);
  }
  
}
