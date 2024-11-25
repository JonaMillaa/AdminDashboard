import { Component, OnInit, ViewChild } from '@angular/core';
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
import { MatPaginator, MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
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
    MatPaginatorModule,
  ],
  providers: [
    {
      provide: MatPaginatorIntl,
      useValue: (() => {
        const paginatorIntl = new MatPaginatorIntl();
        paginatorIntl.itemsPerPageLabel = 'Elementos por página:';
        paginatorIntl.nextPageLabel = 'Página siguiente';
        paginatorIntl.previousPageLabel = 'Página anterior';
        paginatorIntl.firstPageLabel = 'Primera página';
        paginatorIntl.lastPageLabel = 'Última página';
        paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number) => {
          if (length === 0 || pageSize === 0) {
            return `0 de ${length}`;
          }
          const startIndex = page * pageSize;
          const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
          return `${startIndex + 1} - ${endIndex} de ${length}`;
        };
        return paginatorIntl;
      })(),
    },
  ],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
})
export class UsuariosComponent implements OnInit {
  displayedColumns: string[] = ['nombre', 'apellido', 'rut', 'telefono', 'estado', 'acciones'];
  usuariosDataSource = new MatTableDataSource<Usuario>([]);
  cargando: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private firebaseService: UsuariosService, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.firebaseService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.usuariosDataSource.data = usuarios || [];
        this.usuariosDataSource.paginator = this.paginator; // Configura el paginador
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.cargando = false;
      },
    });
  }

  aplicarFiltro(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.usuariosDataSource.filter = input.value.trim().toLowerCase();
  }

  cambiarEstado(usuario: Usuario): void {
    const nuevoEstado = usuario.Estado === 'ACTIVO' ? 'BLOQUEADO' : 'ACTIVO';
    this.firebaseService
      .actualizarEstadoUsuario(usuario.ID, nuevoEstado)
      .then(() => this.cargarUsuarios())
      .catch((error) => console.error('Error al actualizar estado:', error));
  }

  editarUsuario(usuario: Usuario): void {
    const dialogRef = this.dialog.open(UsuarioDetalleComponent, {
      width: '600px',
      height: '340px',
      data: { ...usuario },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.firebaseService
          .actualizarUsuario(result)
          .then(() => this.cargarUsuarios())
          .catch((error) => console.error('Error al actualizar usuario:', error));
      }
    });
  }
}
