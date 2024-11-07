import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manager-layout',
  standalone: true,
  imports: [
    MatIcon,
    CommonModule
  ],
  templateUrl: './manager-layout.component.html',
  styleUrl: './manager-layout.component.css'
})
export class ManagerLayoutComponent {
  opened: boolean = true; // Define la propiedad `opened` aquí

}
