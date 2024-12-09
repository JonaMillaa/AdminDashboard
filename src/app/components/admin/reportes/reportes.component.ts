import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FirebaseService } from '../../../firebase/firebase.service';
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
  styleUrls: ['./reportes.component.css']
})

export class ReportesComponent implements OnInit {
  tutorForm: FormGroup;
  tutorData: any = null; // Aquí se guarda la data del tutor
  sesiones: any[] = [];  // Inicializamos como un arreglo vacío
  postulaciones: any[] = [];
  totalGanancias: number = 0;
  comision: number = 0;
  pagoNeto: number = 0;
  precioSesion: number = 0;

  constructor(private fb: FormBuilder, private firebaseService: FirebaseService) {
    this.tutorForm = this.fb.group({
      rut: ['']
    });
  }

  ngOnInit(): void {   this.cargarSesiones(); }

  buscarTutor(): void {
    let rut = this.tutorForm.get('rut')?.value;
    rut = this.formatRUT(rut); // Formatear el RUT correctamente

    if (rut) {
      this.firebaseService.getUserByRUT(rut).subscribe((data) => {
        if (data.length > 0) {
          this.tutorData = data[0]; // Asignar los datos del tutor
          this.sesiones = [];  // Limpiar las sesiones antes de cargar las nuevas
          this.cargarSesiones();  // Cargar las sesiones asociadas al tutor
        } else {
          this.tutorData = null;
          this.sesiones = [];  // Limpiar sesiones si no se encuentra el usuario
          console.error("No se encontró información para el RUT proporcionado.");
        }
      });
    }
  }
  cargarSesiones(): void {
    // Obtener las publicaciones finalizadas
    this.firebaseService.getFinalizedPublicaciones().subscribe((publicaciones) => {
      console.log('Publicaciones Finalizadas:', publicaciones); // Verifica si hay publicaciones finalizadas
      const tutorSesiones = publicaciones.filter(pub => pub.estado === 'FINALIZADA' && pub.id_usuario === this.tutorData.id);
      console.log('Sesiones del tutor:', tutorSesiones); // Verifica las sesiones filtradas
  
      // Obtener las postulaciones con estado 'REALIZADA'
      this.firebaseService.getPostulacionesRealizadas().subscribe((postulaciones) => {
        console.log('Postulaciones Realizadas:', postulaciones); // Verifica las postulaciones
  
        // Filtrar las postulaciones que coinciden con las publicaciones finalizadas y el id_usuario del tutor
        this.postulaciones = postulaciones.filter(post => 
          post.estado_postulacion === 'REALIZADA' && 
          tutorSesiones.some(pub => pub.id_publicacion === post.id_publicacion)
        );
        console.log('Postulaciones filtradas:', this.postulaciones);
  
        // Asociar el precio de la postulación con cada sesión
        this.sesiones = tutorSesiones.map((sesion) => {
          const post = this.postulaciones.find(p => p.id_publicacion === sesion.id_publicacion);
          if (post) {
            return {
              ...sesion,
              precio: post.precio, // Precio de la postulación
            };
          }
          return sesion;
        });
        console.log('Sesiones completas:', this.sesiones); // Verifica las sesiones con el precio asignado
  
        // Calcular las ganancias
        this.calcularFacturacion();
      });
    });
  }
  

  calcularFacturacion(): void {
    // Calcular total ganancias, comisión y pago neto
    this.totalGanancias = this.sesiones.reduce((total, sesion) => total + (sesion.duracion * sesion.precio), 0);
    this.comision = this.totalGanancias * 0.15;
    this.pagoNeto = this.totalGanancias - this.comision;
  }

  formatRUT(rut: string): string {
    let formattedRUT = rut.replace(/\./g, '').replace(/-/g, '');
    const cuerpo = formattedRUT.slice(0, -1);
    const dv = formattedRUT.slice(-1).toUpperCase();
    return `${cuerpo}-${dv}`;
  }

  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;
  isDownloading = false;

  // Método para generar el PDF
  generatePDF(): void {
    const exportButton = document.getElementById('exportButton');
    if (exportButton) {
      exportButton.style.display = 'none';
    }

    this.isDownloading = true; // Activar el loader

    const DATA = this.pdfContent.nativeElement;
    html2canvas(DATA, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 190; // Ajuste para A4
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`Boleta_Honorarios_${this.tutorData?.Rut}.pdf`);

      setTimeout(() => {
        this.isDownloading = false;
      }, 3000);
    });
  }
}
