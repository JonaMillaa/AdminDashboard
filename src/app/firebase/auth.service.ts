// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {}

  login(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const uid = userCredential.user?.uid;
        return this.getUserRole(uid);
      });
  }

  logout() {
    return this.afAuth.signOut().then(() => {
      this.router.navigate(['/login']);
    });
  }

  getAuthState(): Observable<any> {
    return this.afAuth.authState;
  }

  getUserRole(uid: string | undefined) {
    if (!uid) return of(null);
    return this.firestore.collection('Usuarios_web').doc(uid).valueChanges().pipe(
      map((user: any) => user?.role)
    );
  }

  isAuthenticated() {
    return this.afAuth.authState.pipe(
      map(user => !!user)
    );
  }
}
