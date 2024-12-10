import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';


@Component({
  selector: 'app-modal-no-data',
  standalone: true,
  imports: [
    MatDividerModule,
    MatDialogModule,
  ],
  templateUrl: './modal-no-data.component.html',
  styleUrl: './modal-no-data.component.css'
})
export class ModalNoDataComponent {

  constructor(
    private dialogRef: MatDialogRef<ModalNoDataComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}

  closeModal(): void {
    this.dialogRef.close();
  }
}
