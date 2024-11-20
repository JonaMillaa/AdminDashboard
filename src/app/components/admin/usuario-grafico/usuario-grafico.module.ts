// src/app/components/usuario-grafico/usuario-grafico.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { UsuarioGraficoComponent } from './usuario-grafico.component';

@NgModule({
  declarations: [
    UsuarioGraficoComponent // Declara el componente aquí
  ],
  imports: [
    CommonModule,
    NgChartsModule
  ],
  exports: [
    UsuarioGraficoComponent // Exporta el componente para que esté disponible en otros módulos
  ]
})
export class UsuarioGraficoModule { }
