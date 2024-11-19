import { Component, OnInit } from '@angular/core';
import { UsuariosService } from '../../../firebase/usuarios.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Usuario } from '../../../models/usuario.model';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsuarioDetalleComponent } from '../usuario-detalle/usuario-detalle.component';

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
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    UsuarioDetalleComponent,
  ],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
})
export class UsuariosComponent implements OnInit {
  displayedColumns: string[] = ['nombre', 'apellido', 'rut', 'telefono', 'estado', 'acciones'];
  usuariosDataSource = new MatTableDataSource<Usuario>([]); // Fuente de datos de la tabla
  cargando: boolean = false; // Indicador de carga

  constructor(private firebaseService: UsuariosService, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true; // Indica que los datos están siendo cargados
    this.firebaseService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.usuariosDataSource.data = usuarios || []; // Asigna los datos al `dataSource`
        this.cargando = false; // Finaliza la carga
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.cargando = false;
      },
    });
  }

  aplicarFiltro(event: Event): void {
    const input = event.target as HTMLInputElement; // Se asegura de que event.target sea un input
    const filtro = input?.value.trim().toLowerCase() || ''; // Maneja el caso de null
    this.usuariosDataSource.filter = filtro;
  }
  

  cambiarEstado(usuario: Usuario): void {
    const nuevoEstado = usuario.Estado === 'ACTIVO' ? 'BLOQUEADO' : 'ACTIVO';
    this.firebaseService
      .actualizarEstadoUsuario(usuario.ID, nuevoEstado)
      .then(() => this.cargarUsuarios()) // Recarga los datos después de actualizar
      .catch((error) => console.error('Error al actualizar estado:', error));
  }

  editarUsuario(usuario: Usuario): void {
    const dialogRef = this.dialog.open(UsuarioDetalleComponent, {
      width: '600px',
      height: '340px',
      data: { ...usuario }, // Pasa los datos al componente de detalle
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.firebaseService
          .actualizarUsuario(result)
          .then(() => this.cargarUsuarios()) // Recarga los datos después de editar
          .catch((error) => console.error('Error al actualizar usuario:', error));
      }
    });
  }
}
