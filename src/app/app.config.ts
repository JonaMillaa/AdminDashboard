import { ApplicationConfig, provideZoneChangeDetection, enableProdMode} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth'; // Importa el proveedor de autenticación
import { environment } from './environments/environment';

// Habilita el modo de producción si está configurado
if (environment.production) {
  enableProdMode();
}


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideClientHydration(), 
    provideAnimationsAsync(),
    provideFirebaseApp(() => initializeApp(environment.firebase)), // Inicializa Firebase
    provideFirestore(() => getFirestore()), provideAnimationsAsync(), // Inicializa Firestore
    provideAuth(() => getAuth()), // Inicializa el proveedor de autenticación
  ]
};
