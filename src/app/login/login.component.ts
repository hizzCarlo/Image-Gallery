import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login(this.username, this.password).subscribe({
      next: response => {
        if (response.message) {
          this.authService.handleLoginResponse(response); // Handle login response
          this.router.navigate(['/gallery']); // Redirect to image gallery after successful login
        } else {
          console.error('No account found'); // Log if no account found
          alert('No account found'); // Display alert to user
        }
      },
      error: err => {
        console.error('Login failed:', err.error); // Log the error response
        alert('Login failed: ' + err.error); // Display alert to user
      }
    });
  }
}