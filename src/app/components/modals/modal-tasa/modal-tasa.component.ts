import { Component, Inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-modal-tasa',
  standalone: true,
  imports: [
    MatIconModule,
    MatDividerModule,
    CommonModule,
  ],
  templateUrl: './modal-tasa.component.html',
  styleUrl: './modal-tasa.component.css'
})
export class ModalTasaComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ModalTasaComponent>
  ) {}

  closeModal(): void {
    this.dialogRef.close();
  }

  formatMonth(month: string): string {
    const [monthPart, yearPart] = month.split('-');
    return `${monthPart.padStart(2, '0')}-${yearPart}`;
  }

  calculateDifference(currentCount: number, prevCount: number): string {
    return (currentCount - prevCount).toString();
  }

  // Generar el texto de análisis y determinar el color basado en la tasa de crecimiento
  getGrowthExplanation(): { text: string, color: string } {
    const growthRate = this.data.growthRate;

    if (growthRate > 0) {
      return {
        text: `Valor positivo: Indica crecimiento (más publicaciones en el mes actual comparado con el anterior). La tasa de crecimiento es ${growthRate}%.`,
        color: 'green'
      };
    } else if (growthRate < 0) {
      return {
        text: `Valor negativo: Indica decrecimiento (menos publicaciones en el mes actual comparado con el anterior). La tasa de decrecimiento es ${Math.abs(growthRate)}%.`,
        color: 'red'
      };
    } else {
      return {
        text: `Valor de 0%: Indica que la cantidad de publicaciones se mantuvo igual en ambos meses.`,
        color: 'orange'
      };
    }
  }

}
