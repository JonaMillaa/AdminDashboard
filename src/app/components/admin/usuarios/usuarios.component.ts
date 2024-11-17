import { Component, OnInit } from '@angular/core';
import { UsuariosService } from '../../../firebase/usuarios.service';
import { Observable, of } from 'rxjs';
import { Usuario } from '../../../models/usuario.model';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { UsuarioDetalleComponent } from '../usuario-detalle/usuario-detalle.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatTabsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    UsuarioDetalleComponent // Asegúrate de importar el componente del diálogo
  ],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  usuarios$: Observable<Usuario[]> = of([]);
  displayedColumns: string[] = ['nombre', 'apellido', 'email', 'telefono', 'estado', 'acciones'];

  constructor(private firebaseService: UsuariosService, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuarios$ = this.firebaseService.getUsuarios();
  }

  cambiarEstado(usuario: Usuario): void {
    const nuevoEstado = usuario.Estado === 'ACTIVO' ? 'BLOQUEADO' : 'ACTIVO';
    this.firebaseService.actualizarEstadoUsuario(usuario.ID, nuevoEstado)
      .then(() => {
        this.cargarUsuarios(); // Recarga la lista después de actualizar el estado
      })
      .catch(error => console.error('Error al actualizar estado:', error));
  }

  editarUsuario(usuario: Usuario): void {
    const dialogRef = this.dialog.open(UsuarioDetalleComponent, {
      width: '400px',
      data: { ...usuario }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.firebaseService.actualizarUsuario(result)
          .then(() => this.cargarUsuarios()) // Recarga la lista después de actualizar
          .catch(error => console.error('Error al actualizar usuario:', error));
      }
    });
  }
}
