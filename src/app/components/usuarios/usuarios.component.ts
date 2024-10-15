
import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '/home/jona/admin-dashboard/src/app/firebase/firebase.service';
import { Observable, of } from 'rxjs';
import { Usuario } from '/home/jona/admin-dashboard/src/app/models/usuario.model'; 

import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';



@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule, 
    MatToolbarModule,
    MatTabsModule,
    MatCardModule
  ],  
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})


export class UsuariosComponent implements OnInit {
  usuarios$: Observable<Usuario[]> = of([]);
  tutores$: Observable<Usuario[]> = of([]);
  estudiantes$: Observable<Usuario[]> = of([]);

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.usuarios$ = this.firebaseService.getUsuarios();
    this.tutores$ = this.firebaseService.getUsuariosPorTipo('TUTOR');
    this.estudiantes$ = this.firebaseService.getUsuariosPorTipo('ESTUDIANTE');
  }
}
