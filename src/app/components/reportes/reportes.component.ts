import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../firebase/firebase.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    MatCardModule,
    MatInputModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})

export class ReportesComponent implements OnInit {
  tutorForm: FormGroup;
  tutorData: any = null;
  sesiones: any[] = [];
  totalGanancias: number = 0;
  comision: number = 0;
  pagoNeto: number = 0;

  constructor(private fb: FormBuilder, private firebaseService: FirebaseService) {
    this.tutorForm = this.fb.group({
      rut: ['']
    });
  }

  ngOnInit(): void {}

  buscarTutor(): void {
    let rut = this.tutorForm.get('rut')?.value;
    rut = this.formatRUT(rut); // Formatear el RUT correctamente

    if (rut) {
        this.firebaseService.getUserByRUT(rut).subscribe((data) => {
            if (data.length > 0) {
                this.tutorData = data[0];
                this.cargarSesiones();
            } else {
                this.tutorData = null;
                this.sesiones = [];
                console.error("No se encontró información para el RUT proporcionado.");
            }
        });
    }
}


  cargarSesiones(): void {
    this.firebaseService.getFinalizedPublicaciones().subscribe((publicaciones) => {
      this.sesiones = publicaciones.filter(pub => pub.tutorId === this.tutorData.id);
      this.calcularFacturacion();
    });
  }

  calcularFacturacion(): void {
    this.totalGanancias = this.sesiones.reduce((total, sesion) => total + (sesion.duracion * 5000), 0);
    this.comision = this.totalGanancias * 0.05;
    this.pagoNeto = this.totalGanancias - this.comision;
  }

  formatRUT(rut: string): string {
    // Convertir a mayúsculas, eliminar puntos y guiones y formatear en el formato deseado
    let formattedRUT = rut.replace(/\./g, '').replace(/-/g, '');
    const cuerpo = formattedRUT.slice(0, -1);
    const dv = formattedRUT.slice(-1).toUpperCase();
    return `${cuerpo}-${dv}`;
}


  generarPDF(): void {
    const doc = new jsPDF();
    doc.text('Boleta de Honorarios - TeAyudoApp', 10, 10);
    doc.text(`RUT: ${this.tutorData?.rut}`, 10, 20);
    doc.text(`Nombre: ${this.tutorData?.nombre}`, 10, 30);
    doc.text(`Email: ${this.tutorData?.email}`, 10, 40);

    let y = 50;
    this.sesiones.forEach((sesion, index) => {
      doc.text(`Sesión ${index + 1}: ${sesion.duracion} hrs - ${sesion.duracion * 5000} CLP`, 10, y);
      y += 10;
    });

    doc.text(`Total Ganancias: ${this.totalGanancias} CLP`, 10, y + 10);
    doc.text(`Comisión (5%): ${this.comision} CLP`, 10, y + 20);
    doc.text(`Pago Neto: ${this.pagoNeto} CLP`, 10, y + 30);

    doc.save(`Boleta_Honorarios_${this.tutorData?.rut}.pdf`);
  }
}


