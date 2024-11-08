import { Component, ViewChild  } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenav } from '@angular/material/sidenav'; 
import { FirebaseService } from '../../firebase/firebase.service';

@Component({
  selector: 'app-manager-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    RouterModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIcon
  ],
  templateUrl: './manager-layout.component.html',
  styleUrl: './manager-layout.component.css'
})
export class ManagerLayoutComponent {
  constructor(private authService: FirebaseService) {}
  opened = true;
  logout() {
    this.authService.logout();
  }

}