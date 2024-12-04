import { Component } from '@angular/core';
import { Observable, of} from 'rxjs';
import { Usuario } from '../../../models/usuario.model';
import { FirebaseService } from '../../../firebase/firebase.service';

import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuarios-app',
  standalone: true,
  imports: [
    MatTabsModule,
    MatCardModule,
    MatIconModule,
    CommonModule,
  ],
  templateUrl: './usuarios-app.component.html',
  styleUrl: './usuarios-app.component.css'
})

export class UsuariosAppComponent {
  usuarios$: Observable<Usuario[]> = of([]);
  tutores$: Observable<Usuario[]> = of([]);
  estudiantes$: Observable<Usuario[]> = of([]);


  constructor(private firebaseService: FirebaseService) { }

  ngOnInit(): void {
    this.usuarios$ = this.firebaseService.getUsuarios();
    this.tutores$ = this.firebaseService.getUsuariosPorTipo('TUTOR');
    this.estudiantes$ = this.firebaseService.getUsuariosPorTipo('ESTUDIANTE');
  }

}
