import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../../firebase/firebase.service';
import { startOfDay } from 'date-fns';
import { CommonModule, NgIf } from '@angular/common';

import { EventModalComponent } from '../../../components/manager/modals/event-modal/event-modal.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-calendar',
  standalone: true,
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatCardModule,
    MatDialogModule,
  ],
})

export class CalendarComponent implements OnInit {
   // Declaración de las propiedades que usamos
   selectedDate: Date = new Date(); // Inicializa con la fecha actual
   eventosDelDia: { title: string; fecha: Date }[] = []; // Eventos del día



  constructor(private firebaseService: FirebaseService, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.cargarEventos(this.selectedDate);// Cargar eventos para la fecha actual
  }

  // Método para cargar eventos desde Firebase según la fecha seleccionada
  cargarEventos(fecha: Date): void {
    this.firebaseService.getAyudantias().subscribe((ayudantias) => {
      this.eventosDelDia = ayudantias
        .filter(
          (ayudantia) =>
            startOfDay(new Date(ayudantia.fecha)).getTime() ===
            startOfDay(fecha).getTime()
        )
        .map((ayudantia) => ({
          title: ayudantia.titulo_ayudantia,
          fecha: new Date(ayudantia.fecha),
        }));
    });
  }

  onDateChange(selectedDate: Date): void {
    this.selectedDate = selectedDate; // Actualizamos la fecha seleccionada
    this.cargarEventos(this.selectedDate); // Cargamos los eventos para la nueva fecha
    this.abrirModal();
  }

  abrirModal(): void {
    this.dialog.open(EventModalComponent, {
      width: '950px',
      height: '700px',
      data: {
        fecha: this.selectedDate,
        eventos: this.eventosDelDia,
      },
    });
  }
  
}
