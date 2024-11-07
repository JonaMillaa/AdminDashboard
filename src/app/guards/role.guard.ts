// src/app/guards/role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../firebase/auth.service';
import { map, tap, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RoleGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate() {
        return this.authService.getAuthState().pipe(
            switchMap(user => user ? this.authService.getUserRole(user.uid) : of(null)),
            tap(role => {
                if (role === 'admin') {
                    this.router.navigate(['/admin-layout']);
                } else if (role === 'manager') {
                    this.router.navigate(['/manager-layout']);
                } else {
                    this.router.navigate(['/login']);
                }
            }),
            map(role => !!role)
        );
    }
}
