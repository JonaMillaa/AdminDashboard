import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PagosService } from '../../../firebase/pagos.service';
import { Publicacion } from '../../../models/publicacion.interface';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-modificar-publicacion',
  templateUrl: './modificar-publicacion.component.html',
  styleUrls: ['./modificar-publicacion.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
})
export class ModificarPublicacionComponent implements OnInit {
  idPublicacion!: string;
  publicacionForm!: FormGroup;
  publicacionActual!: Publicacion;

  constructor(
    private route: ActivatedRoute,
    private pagosService: PagosService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.idPublicacion = this.route.snapshot.paramMap.get('id')!;
    this.cargarPublicacion();

    this.publicacionForm = this.fb.group({
      titulo_ayudantia: ['', Validators.required],
      descripcion_ayudantia: ['', Validators.required],
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      duracion: ['', Validators.required],
      formato: ['', Validators.required],
      ubicacion: ['', Validators.required],
      categoria: ['', Validators.required],
      subcategoria: ['', Validators.required],
    });
  }

  cargarPublicacion(): void {
    this.pagosService.getPublicacionById(this.idPublicacion).subscribe((data) => {
      this.publicacionActual = data;

      this.publicacionForm.patchValue({
        titulo_ayudantia: data.info_ayudantia.titulo_ayudantia,
        descripcion_ayudantia: data.info_ayudantia.descripcion_ayudantia,
        fecha: this.convertirFechaAISO(data.fecha_ayudantia), // Convertir para el input
        hora: data.hora,
        duracion: data.duracion,
        formato: data.formato,
        ubicacion: data.detalle_ubicacion,
        categoria: data.info_ayudantia.categoria,
        subcategoria: data.info_ayudantia.subcategoria,
      });
    });
  }

  guardarCambios(): void {
    if (this.publicacionForm.valid) {
      const publicacionModificada: Publicacion = {
        ...this.publicacionActual,
        detalle_ubicacion: this.publicacionForm.value.ubicacion,
        duracion: this.publicacionForm.value.duracion,
        fecha_ayudantia: this.convertirFechaAFormato(this.publicacionForm.value.fecha), // Convertir de vuelta
        hora: this.publicacionForm.value.hora,
        formato: this.publicacionForm.value.formato,
        info_ayudantia: {
          ...this.publicacionActual.info_ayudantia,
          titulo_ayudantia: this.publicacionForm.value.titulo_ayudantia,
          descripcion_ayudantia: this.publicacionForm.value.descripcion_ayudantia,
          categoria: this.publicacionForm.value.categoria,
          subcategoria: this.publicacionForm.value.subcategoria,
        },
      };

      this.pagosService
        .actualizarPublicacion(this.idPublicacion, publicacionModificada)
        .then(() => {
          alert('Publicación actualizada exitosamente.');
          this.router.navigate(['/admin/intervencion-pagos', this.idPublicacion]);
        })
        .catch((error) => {
          console.error('Error al actualizar la publicación:', error);
          alert('Error al actualizar la publicación.');
        });
    }
  }

  cancelar(): void {
    this.router.navigate(['/admin/intervencion-pagos', this.idPublicacion]);
  }

  private convertirFechaAISO(fecha: string): string {
    const [dia, mes, año] = fecha.split('-');
    return `${año}-${mes}-${dia}`; // Convertir a formato ISO
  }

  private convertirFechaAFormato(fecha: string): string {
    const [año, mes, dia] = fecha.split('-');
    return `${dia}-${mes}-${año}`; // Convertir a formato dd-mm-yyyy
  }
}
