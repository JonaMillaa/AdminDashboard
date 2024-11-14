import { Component, OnInit } from '@angular/core';
import { ContadorSesionService } from '../../../firebase/contador-sesion.service';

@Component({
  selector: 'app-contador-sesion',
  templateUrl: './contador-sesion.component.html',
  styleUrls: ['./contador-sesion.component.css']
})
export class ContadorSesionComponent implements OnInit {
  contadorIniciosSesionHoy: number = 0;

  constructor(private contadorSesionService: ContadorSesionService) {}

  ngOnInit(): void {
    this.contadorSesionService.obtenerContadorHoy().subscribe(
      contador => {
        this.contadorIniciosSesionHoy = contador;
        console.log('Contador de inicios de sesión hoy:', this.contadorIniciosSesionHoy);
      },
      error => console.error('Error al obtener el contador de inicios de sesión:', error)
    );
  }
}
