import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css'
})

export class CarouselComponent implements OnInit {
  @Input() itemCount: number = 1; // Número total de elementos en el carrusel
  currentIndex: number = 0;

  ngOnInit(): void {
    // Si no hay suficientes elementos, desactiva la navegación
    if (this.itemCount <= 1) {
      this.currentIndex = 0;
    }
  }

  nextSlide(): void {
    // Avanza al siguiente elemento o regresa al inicio si se alcanza el final
    if (this.currentIndex < this.itemCount - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0; // Vuelve al inicio si está en el final
    }
  }

  prevSlide(): void {
    // Retrocede al elemento anterior o va al final si está al inicio
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.itemCount - 1; // Vuelve al final si está en el inicio
    }
  }
}