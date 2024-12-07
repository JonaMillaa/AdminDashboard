import { Component, OnInit, AfterViewInit, PLATFORM_ID, Inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../../firebase/firebase.service';
import { Publicacion } from '../../../models/publicacion.interface';
import { TutorRanking } from '../../../models/tutor-ranking.interface';
// import { CarouselComponent } from '../carousel/carousel.component'; 
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-monitoreo',
  standalone: true,
  imports: [
    CommonModule,
    // CarouselComponent,
    NgbCarouselModule
  ],
  templateUrl: './monitoreo.component.html',
  styleUrls: ['./monitoreo.component.css'] 
})

export class MonitoreoComponent implements OnInit, AfterViewInit {
  publicacionesMasDemandadas: Publicacion[] = [];
  rankingTutores: TutorRanking[] = [];

  constructor(
    private firebaseService: FirebaseService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

 
  ngOnInit(): void {
    this.firebaseService.getPublicacionesMasDemandadas().subscribe({
      next: (publicaciones) => {
        this.publicacionesMasDemandadas = publicaciones;
        console.log('Publicaciones Más Demandadas:', publicaciones);
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

  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      const { Carousel } = await import('bootstrap');
      const carouselElement = document.getElementById('publicacionesCarousel');
      if (carouselElement) {
        new Carousel(carouselElement, { interval: false }); // Desactiva el auto deslizamiento
      }
      const tutoresCarouselElement = document.getElementById('tutoresCarousel');
      if (tutoresCarouselElement) {
        new Carousel(tutoresCarouselElement, { interval: false });
      }
    }
  }
}