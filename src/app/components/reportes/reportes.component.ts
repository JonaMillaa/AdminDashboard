import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FirebaseService } from '../../firebase/firebase.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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

    console.log("RUT después de formatear:", rut);

    if (rut) {
        this.firebaseService.getUserByRUT(rut).subscribe((data) => {
          console.log("Datos recibidos de Firebase:", data); // Debugging
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

  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;

  isDownloading = false; // Estado para mostrar el mensaje de descarga

  // Método para generar el PDF
  generatePDF(): void {
    // Ocultar el botón de exportación antes de generar el PDF
    const exportButton = document.getElementById('exportButton');
    if (exportButton) {
      exportButton.style.display = 'none';
    }

    this.isDownloading = true; // Activar el mensaje de descarga y loader

    const DATA = this.pdfContent.nativeElement;
    html2canvas(DATA, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Añade la imagen generada al PDF
      const imgWidth = 190; // Ajuste de ancho para A4
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

      // Guardar el PDF
      pdf.save(`Boleta_Honorarios_${this.tutorData?.Rut}.pdf`);

      // Extender la duración del loader por 2 segundos
      setTimeout(() => {
        this.isDownloading = false;
      }, 3000);
    });
  }

}


