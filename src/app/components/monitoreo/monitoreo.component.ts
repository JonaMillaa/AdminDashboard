import { Component, OnInit,Inject, PLATFORM_ID} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FirebaseService } from '../../firebase/firebase.service';


import { Publicacion } from '../../models/publicacion.interface';
import { TutorRanking } from '../../models/tutor-ranking.interface'; 
import { CarouselComponent } from '../carousel/carousel.component';
@Component({
  selector: 'app-monitoreo',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    RouterModule,
    MatCardModule,
    MatProgressSpinnerModule,
    CarouselComponent
  ],
  templateUrl: './monitoreo.component.html',
  styleUrl: './monitoreo.component.css'
})
export class MonitoreoComponent implements OnInit {
  publicacionesMasDemandadas: Publicacion[] = [];
  rankingTutores: TutorRanking[] = []; // Usamos la interfaz TutorRanking

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.firebaseService.getPublicacionesMasDemandadas().subscribe({
      next: (publicaciones) => {
        this.publicacionesMasDemandadas = publicaciones;
        console.log('Publicaciones Más Demandadas:', publicaciones); // Debug
      },
      error: (error) => {
        console.error('Error al cargar Publicaciones:', error);
      }
    });
  
    this.firebaseService.getRankingTutores().subscribe({
      next: (ranking) => {
        this.rankingTutores = ranking.filter(tutor => tutor.usuario !== undefined);
        console.log('Ranking de Tutores (filtrado):', this.rankingTutores);
      },
      error: (error) => {
        console.error('Error al cargar Ranking de Tutores:', error);
      }
    });
    
  }
}