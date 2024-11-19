// src/app/components/login/login.component.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { FirebaseService } from '../../firebase/firebase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private router: Router, private authService: FirebaseService) {}

  login() {
    if (this.email === 'admin@gmail.com' && this.password === '123456') {
      this.authService.login('admin');
      this.router.navigateByUrl('/admin/reportes-dia');
    } else if (this.email === 'manager@gmail.com' && this.password === '123456') {
      this.authService.login('manager');
      this.router.navigateByUrl('/manager/dashboard');
    } else {
      alert('Usuario o contraseña no autorizados');
    }
  }
}
