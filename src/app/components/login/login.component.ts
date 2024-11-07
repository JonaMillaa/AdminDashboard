import { Component } from '@angular/core';
import { AuthService } from '../../firebase/auth.service';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms'; // Importa FormsModule

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.email, this.password)
      .then(role$ => {
        role$.subscribe(role => {  // Nos suscribimos al observable devuelto
          if (role === 'ADMIN') {
            this.router.navigate(['/admin-layout']);
          } else if (role === 'MANAGER') {
            this.router.navigate(['/manager-layout']);
          }
        });
      })
      .catch(error => console.error(error.message));
  }
  
}
