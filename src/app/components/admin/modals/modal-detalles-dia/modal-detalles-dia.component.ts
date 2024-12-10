
import { Component, Inject, AfterViewInit, PLATFORM_ID, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { MatDialogRef,MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js';
import { isPlatformBrowser } from '@angular/common';
import { ModalNoDataComponent } from '../modal-no-data/modal-no-data.component';

@Component({
  selector: 'app-modal-detalles-dia',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './modal-detalles-dia.component.html',
  styleUrl: './modal-detalles-dia.component.css'
})

export class ModalDetallesDiaComponent implements AfterViewInit{

  @ViewChild('detailModal') detailModal!: TemplateRef<any>; // Referencia al modal de detalles
  selectedDetail: any; // Detalle seleccionado para mostrar

  miniTrendChart: any;
  analysisColor: string = '#000';

  constructor(
    private dialogRef: MatDialogRef<ModalNoDataComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef // Inyección de ChangeDetectorRef
  ) {}

  closeModal(): void {
    this.dialogRef.close();
  }

  // Cerrar el modal de detalles
  closeDetailModal(): void {
    this.dialog.closeAll();
  }

  ngAfterViewInit(): void {
    this.setAnalysisColor();
  }

  setAnalysisColor(): void {
    if (this.data.selectedDayCount > this.data.monthlyAverage) {
      this.analysisColor = 'green';
    } else if (this.data.selectedDayCount < this.data.monthlyAverage) {
      this.analysisColor = 'red';
    } else {
      this.analysisColor = 'orange';
    }
    this.cdr.detectChanges(); // Fuerza una nueva verificación de cambios
  }


}
