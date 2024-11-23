import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule  } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-modal-tasa',
  standalone: true,
  imports: [
    MatIconModule,
    MatDividerModule,
    CommonModule,
    MatDialogModule
  ],
  templateUrl: './modal-tasa.component.html',
  styleUrls: ['./modal-tasa.component.css']
})
export class ModalTasaComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ModalTasaComponent>
  ) {}

  closeModal(): void {
    this.dialogRef.close();
  }

  calculateDifference(): string {
    return (this.data.currentCount - this.data.prevCount).toString();
  }

  // Cambiar texto según la categoría seleccionada
  getCategoryExplanation(): { text: string, color: string } {
    const count = this.data.count;

    if (count > 0) {
      return {
        text: `La categoría "${this.data.category}" tiene un total de ${count} publicaciones.`,
        color: 'green'
      };
    } else {
      return {
        text: `La categoría "${this.data.category}" no tiene publicaciones.`,
        color: 'red'
      };
    }
  }
}
