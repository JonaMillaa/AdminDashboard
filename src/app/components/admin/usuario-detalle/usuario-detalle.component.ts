import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Usuario } from '../../../models/usuario.model';
import { UsuariosService } from '../../../firebase/usuarios.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-usuario-detalle',
  templateUrl: './usuario-detalle.component.html', 
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  styleUrls: ['./usuario-detalle.component.css']
})
export class UsuarioDetalleComponent {
  usuarioForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<UsuarioDetalleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Usuario,
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private snackBar: MatSnackBar // Inyectamos MatSnackBar
  ) {
    this.usuarioForm = this.fb.group({
      Nombre: [data.Nombre, Validators.required],
      Apellido: [data.Apellido, Validators.required],
      Email: [data.Email, [Validators.required, Validators.email]],
      Telefono: [data.Telefono, Validators.required],
      Estado: [data.Estado, Validators.required],
      Rut: [data.Rut, Validators.required],
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  guardar(): void {
    if (this.usuarioForm.valid) {
      // Mostrar snackbar para confirmación
      const snackBarRef = this.snackBar.open('¿Confirmar cambios en el usuario?', 'Confirmar', {
        duration: 5000,
      });

      snackBarRef.onAction().subscribe(() => {
        // Proceder con la actualización si se confirma
        const usuarioActualizado: Usuario = {
          ...this.data,
          ...this.usuarioForm.value
        };

        this.usuariosService.actualizarUsuario(usuarioActualizado)
          .then(() => {
            this.dialogRef.close(usuarioActualizado);  // Envía el usuario actualizado al cerrar
          })
          .catch(error => console.error('Error al actualizar usuario:', error));
      });
    }
  }
}
