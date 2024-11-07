import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FirebaseService } from '../../../../firebase/firebase.service';
import { Usuario } from '../../../../models/usuario.model';
import { CommonModule, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

// Resaltamos las importaciones relacionadas con debounce
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';

@Component({
  selector: 'app-event-modal',
  imports: [
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './event-modal.component.html',
  styleUrls: ['./event-modal.component.css'],
  standalone: true
})

export class EventModalComponent implements OnInit{

  terminoBusqueda: string = ''; // Término ingresado
  eventForm: FormGroup;
  usuarios: Usuario[] = []; // Lista de usuarios encontrados
  usuarioSeleccionado?: Usuario; // Usuario seleccionado
  terminoBusquedaControl = new FormControl('');// Resaltamos el FormControl utilizado para la búsqueda
  busquedaRealizada = false; // Indicador de que se realizó una búsqueda

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    public dialogRef: MatDialogRef<EventModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { fecha: Date },
  ) {
    this.eventForm = this.fb.group({
      asunto: ['', Validators.required],
      cuerpo: ['', Validators.required]
    });
  }


  ngOnInit(): void {
    // Filtramos valores nulos antes de aplicar debounce y otras operaciones
    this.terminoBusquedaControl.valueChanges.pipe(
      filter((termino): termino is string => termino !== null), // Solo permite strings no nulos
      debounceTime(300), // Espera 300ms después de que el usuario deje de escribir
      distinctUntilChanged(), // Solo continúa si el valor ha cambiado
      switchMap((termino: string) => this.firebaseService.buscarUsuarios(termino)) // Realiza la búsqueda
    ).subscribe((usuarios) => {
      this.usuarios = usuarios; // Actualiza la lista de usuarios
      this.busquedaRealizada = true; // Marcar que la búsqueda fue realizada
    });
  }

  buscarUsuarios(event: Event): void {
    const input = event.target as HTMLInputElement;
    const termino = input.value;

    if (termino) {
      this.firebaseService.buscarUsuarios(termino).subscribe((usuarios) => {
        this.usuarios = usuarios;
      });
    } else {
      this.usuarios = [];
    }
  }

  // Búsqueda manual al hacer clic en el botón de lupa
  buscarUsuariosManual() {
    const termino = this.terminoBusquedaControl.value || ''; // Si es null, usar cadena vacía
    this.firebaseService.buscarUsuarios(termino).subscribe((usuarios) => {
      this.usuarios = usuarios;
    });
  }

  seleccionarUsuario(usuario: Usuario) {
    this.usuarioSeleccionado = usuario;
  }

  enviarCorreo() {
    if (this.usuarioSeleccionado) {
      const evento = {
        email: this.usuarioSeleccionado.Email,
        asunto: this.eventForm.value.asunto,
        cuerpo: this.eventForm.value.cuerpo,
        fecha: new Date().toISOString()
      };

      this.firebaseService.guardarEvento(evento).then(() => {
        alert('Correo enviado y evento guardado correctamente');
        this.dialogRef.close();
      });
    } else {
      alert('Por favor, selecciona un usuario');
    }
  }

}
